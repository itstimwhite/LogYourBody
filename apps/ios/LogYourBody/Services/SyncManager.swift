//
// SyncManager.swift
// LogYourBody
//
import Foundation
import Combine
import Network
import Clerk

@MainActor
class SyncManager: ObservableObject {
    static let shared = SyncManager()
    
    @Published var isSyncing = false
    @Published var lastSyncDate: Date?
    @Published var syncStatus: SyncStatus = .idle
    @Published var pendingSyncCount = 0
    
    private let coreDataManager = CoreDataManager.shared
    private let authManager = AuthManager.shared
    private let supabaseManager = SupabaseManager.shared
    private let networkMonitor = NWPathMonitor()
    private let syncQueue = DispatchQueue(label: "com.logyourbody.sync", qos: .background)
    
    private var syncTimer: Timer?
    private var cancellables = Set<AnyCancellable>()
    
    enum SyncStatus {
        case idle
        case syncing
        case success
        case error(String)
    }
    
    private init() {
        setupNetworkMonitoring()
        setupAutoSync()
        updatePendingSyncCount()
    }
    
    private func setupNetworkMonitoring() {
        let queue = DispatchQueue.global(qos: .background)
        networkMonitor.start(queue: queue)
        
        networkMonitor.pathUpdateHandler = { [weak self] path in
            if path.status == .satisfied {
                // Network is available, attempt sync
                Task { @MainActor [weak self] in
                    self?.syncIfNeeded()
                }
            }
        }
    }
    
    private func setupAutoSync() {
        // Sync every 5 minutes when app is active
        syncTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.syncIfNeeded()
            }
        }
        
        // Sync when user logs in
        authManager.$currentUser
            .sink { [weak self] user in
                if user != nil {
                    Task { @MainActor [weak self] in
                        self?.syncAll()
                    }
                }
            }
            .store(in: &cancellables)
    }
    
    func syncIfNeeded() {
        Task.detached { [weak self] in
            guard let self = self else { return }
            
            guard self.networkMonitor.currentPath.status == .satisfied else {
                // print("📵 Sync skipped: No network connection")
                return
            }
            guard await self.authManager.isAuthenticated else {
                // print("🔒 Sync skipped: Not authenticated")
                return
            }
            guard await !self.isSyncing else {
                // print("⏳ Sync skipped: Already syncing")
                return
            }
            
            // Log the current user ID
            let userId = await self.authManager.currentUser?.id
            // print("🔄 SyncManager: Checking sync for user: \(userId ?? "nil")")
            
            // Check if we synced recently (within last 5 minutes)
            let lastSyncKey = "lastSupabaseSyncDate"
            if let lastSync = UserDefaults.standard.object(forKey: lastSyncKey) as? Date {
                let minutesSinceLastSync = Date().timeIntervalSince(lastSync) / 60
                if minutesSinceLastSync < 5 {
                    // print("⏰ Sync skipped: Synced \(Int(minutesSinceLastSync)) minutes ago")
                    return
                }
            }
            
            let unsynced = self.coreDataManager.fetchUnsyncedEntries()
            let totalUnsynced = unsynced.bodyMetrics.count + unsynced.dailyMetrics.count + unsynced.profiles.count
            
            // print("📊 Unsynced items: \(unsynced.bodyMetrics.count) body metrics, \(unsynced.dailyMetrics.count) daily metrics, \(unsynced.profiles.count) profiles")
            
            if totalUnsynced > 0 {
                // print("🚀 Starting sync for \(totalUnsynced) items...")
                UserDefaults.standard.set(Date(), forKey: lastSyncKey)
                await self.syncAll()
            } else {
                // print("✅ Everything is already synced")
                await self.updatePendingSyncCount()
            }
        }
    }
    
    func syncAll() {
        guard !isSyncing else { return }
        guard authManager.isAuthenticated else { return }
        
        Task { @MainActor in
            self.isSyncing = true
            self.syncStatus = .syncing
        }
        
        syncQueue.async { [weak self] in
            Task { @MainActor [weak self] in
                guard let self = self else { return }
                
                // Get the Clerk session token
                guard let session = self.authManager.clerkSession else {
                    self.isSyncing = false
                    self.syncStatus = .error("No active session")
                    return
                }
                
                do {
                    // Get JWT token from Clerk session (using new integration pattern)
                    // print("🔑 Getting Clerk session token for Supabase...")
                    let tokenResource = try await session.getToken()
                    guard let token = tokenResource?.jwt else {
                        // print("❌ Failed to get Clerk session token")
                        self.isSyncing = false
                        self.syncStatus = .error("Failed to get authentication token")
                        return
                    }
                    
                    // print("✅ Got Clerk session token, starting sync...")
                    self.performSync(token: token)
                } catch {
                    // print("❌ Token error: \(error)")
                    self.isSyncing = false
                    self.syncStatus = .error("Token error: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func performSync(token: String) {
        Task.detached { [weak self] in
            guard let self = self else { return }
            do {
                let unsynced = coreDataManager.fetchUnsyncedEntries()
                var hasErrors = false
                
                // print("📤 Starting sync: \(unsynced.bodyMetrics.count) body metrics, \(unsynced.dailyMetrics.count) daily metrics")
                
                // Sync body metrics in batches
                if !unsynced.bodyMetrics.isEmpty {
                    // print("🔍 Processing \(unsynced.bodyMetrics.count) unsynced body metrics...")
                    let bodyMetricsBatch = unsynced.bodyMetrics.compactMap { cached -> [String: Any]? in
                        guard let userId = cached.userId,
                              let id = cached.id,
                              let date = cached.date else {
                            // print("⚠️ Skipping body metric with missing data: userId=\(cached.userId ?? "nil"), id=\(cached.id ?? "nil"), date=\(String(describing: cached.date))")
                            return nil
                        }
                        
                        // Always include ALL fields, even if null, to satisfy Supabase's "All object keys must match" requirement
                        var metrics: [String: Any] = [
                            "id": id,
                            "user_id": userId,
                            "date": ISO8601DateFormatter().string(from: date),
                            "created_at": ISO8601DateFormatter().string(from: cached.createdAt ?? Date()),
                            "updated_at": ISO8601DateFormatter().string(from: cached.updatedAt ?? Date()),
                            "weight": cached.weight > 0 ? cached.weight : NSNull(),
                            "weight_unit": cached.weightUnit ?? "kg",
                            "body_fat_percentage": cached.bodyFatPercentage > 0 ? cached.bodyFatPercentage : NSNull(),
                            "body_fat_method": cached.bodyFatMethod ?? NSNull(),
                            "muscle_mass": cached.muscleMass > 0 ? cached.muscleMass : NSNull(),
                            "bone_mass": cached.boneMass > 0 ? cached.boneMass : NSNull(),
                            "notes": cached.notes ?? NSNull(),
                            "photo_url": cached.photoUrl ?? NSNull(),
                            "data_source": cached.dataSource ?? "Manual",
                            "original_photo_url": cached.originalPhotoUrl ?? NSNull(),
                            "photo_processed_at": cached.photoProcessedAt != nil ? ISO8601DateFormatter().string(from: cached.photoProcessedAt!) : NSNull()
                        ]
                        
                        return metrics
                    }
                    
                    // print("📊 After filtering: \(bodyMetricsBatch.count) body metrics ready to sync")
                    
                    // Send in smaller batches to avoid timeouts and debug issues
                    let batchSize = 50
                    var successCount = 0
                    
                    for i in stride(from: 0, to: bodyMetricsBatch.count, by: batchSize) {
                        let endIndex = min(i + batchSize, bodyMetricsBatch.count)
                        let batch = Array(bodyMetricsBatch[i..<endIndex])
                        
                        // print("📦 Sending batch \(i / batchSize + 1) of \((bodyMetricsBatch.count + batchSize - 1) / batchSize): \(batch.count) items")
                        
                        do {
                            let result = try await supabaseManager.upsertBodyMetricsBatch(batch, token: token)
                            successCount += result.count
                            // print("✅ Batch successful: \(result.count) items")
                        } catch {
                            // print("❌ Batch failed: \(error)")
                            // Continue with next batch even if this one fails
                        }
                    }
                    
                    if successCount > 0 {
                        // print("✅ Total synced: \(successCount) body metrics")
                        
                        // Mark synced items
                        for cached in unsynced.bodyMetrics {
                            if let id = cached.id {
                                coreDataManager.markAsSynced(entityName: "CachedBodyMetrics", id: id)
                            }
                        }
                    } else if !bodyMetricsBatch.isEmpty {
                        // print("❌ Failed to sync any body metrics")
                        hasErrors = true
                    }
                }
                
                // Sync daily metrics in batches
                if !unsynced.dailyMetrics.isEmpty {
                    // print("🔍 Processing \(unsynced.dailyMetrics.count) unsynced daily metrics...")
                    let dailyMetricsBatch = unsynced.dailyMetrics.compactMap { cached -> [String: Any]? in
                        guard let userId = cached.userId,
                              let id = cached.id,
                              let date = cached.date else { return nil }
                        
                        var metrics: [String: Any] = [
                            "id": id,
                            "user_id": userId,
                            "date": ISO8601DateFormatter().string(from: date),
                            "created_at": ISO8601DateFormatter().string(from: cached.createdAt ?? Date()),
                            "updated_at": ISO8601DateFormatter().string(from: cached.updatedAt ?? Date())
                        ]
                        
                        if cached.steps > 0 {
                            metrics["steps"] = Int(cached.steps)
                        }
                        
                        if let notes = cached.notes {
                            metrics["notes"] = notes
                        }
                        
                        return metrics
                    }
                    
                    // print("📊 After filtering: \(dailyMetricsBatch.count) daily metrics ready to sync")
                    
                    // Send in smaller batches to avoid timeouts
                    let batchSize = 50 // Reduced from unlimited to 50 per batch
                    var successCount = 0
                    
                    for i in stride(from: 0, to: dailyMetricsBatch.count, by: batchSize) {
                        let endIndex = min(i + batchSize, dailyMetricsBatch.count)
                        let batch = Array(dailyMetricsBatch[i..<endIndex])
                        
                        // print("📦 Sending daily metrics batch \(i / batchSize + 1) of \((dailyMetricsBatch.count + batchSize - 1) / batchSize): \(batch.count) items")
                        
                        do {
                            let result = try await supabaseManager.upsertDailyMetricsBatch(batch, token: token)
                            successCount += result.count
                            // print("✅ Batch successful: \(result.count) items")
                            
                            // Mark synced items in this batch
                            let syncedIds = Set(result.compactMap { $0["id"] as? String })
                            for cached in unsynced.dailyMetrics {
                                if let id = cached.id, syncedIds.contains(id) {
                                    coreDataManager.markAsSynced(entityName: "CachedDailyMetrics", id: id)
                                }
                            }
                        } catch {
                            // print("❌ Daily metrics batch failed: \(error)")
                            // Continue with next batch even if this one fails
                        }
                    }
                    
                    if successCount > 0 {
                        // print("✅ Total synced: \(successCount) daily metrics")
                    } else if !dailyMetricsBatch.isEmpty {
                        // print("❌ Failed to sync any daily metrics")
                        hasErrors = true
                    }
                }
                
                await MainActor.run {
                    self.isSyncing = false
                    self.lastSyncDate = Date()
                    self.syncStatus = hasErrors ? .error("Some items failed to sync") : .success
                    self.updatePendingSyncCount()
                }
            } catch {
                // print("❌ Sync error: \(error)")
                await MainActor.run {
                    self.isSyncing = false
                    self.syncStatus = .error(error.localizedDescription)
                }
            }
        }
    }
    
    private func syncProfile(_ cached: CachedProfile, token: String) async -> Bool {
        guard let url = URL(string: "\(Constants.baseURL)/api/users/profile") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let profile = cached.toUserProfile()
        
        do {
            let data = try JSONEncoder().encode(profile)
            request.httpBody = data
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                await Task { @MainActor in
                    coreDataManager.markAsSynced(entityName: "CachedProfile", id: cached.id ?? "")
                    coreDataManager.updateSyncStatus(
                        entityName: "CachedProfile",
                        id: cached.id ?? "",
                        status: "synced"
                    )
                }.value
                return true
            } else {
                await Task { @MainActor in
                    coreDataManager.updateSyncStatus(
                        entityName: "CachedProfile",
                        id: cached.id ?? "",
                        status: "error",
                        error: "HTTP error"
                    )
                }.value
                return false
            }
        } catch {
            await Task { @MainActor in
                coreDataManager.updateSyncStatus(
                    entityName: "CachedProfile",
                    id: cached.id ?? "",
                    status: "error",
                    error: error.localizedDescription
                )
            }.value
            return false
        }
    }
    
    private func syncBodyMetrics(_ cached: CachedBodyMetrics, token: String) async -> Bool {
        guard let url = URL(string: "\(Constants.baseURL)/api/weights") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT" // Always use PUT for upsert behavior
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        guard let metrics = cached.toBodyMetrics() else {
            // print("⚠️ Skipping sync for corrupted body metric")
            return false
        }
        
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(metrics)
            request.httpBody = data
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                if (200...299).contains(httpResponse.statusCode) || httpResponse.statusCode == 409 {
                    await Task { @MainActor in
                        coreDataManager.markAsSynced(entityName: "CachedBodyMetrics", id: cached.id ?? "")
                        coreDataManager.updateSyncStatus(
                            entityName: "CachedBodyMetrics",
                            id: cached.id ?? "",
                            status: "synced"
                        )
                    }.value
                    return true
                } else {
                    await Task { @MainActor in
                        coreDataManager.updateSyncStatus(
                            entityName: "CachedBodyMetrics",
                            id: cached.id ?? "",
                            status: "error",
                            error: "HTTP \(httpResponse.statusCode)"
                        )
                    }.value
                    return false
                }
            } else {
                return false
            }
        } catch {
            await Task { @MainActor in
                coreDataManager.updateSyncStatus(
                    entityName: "CachedBodyMetrics",
                    id: cached.id ?? "",
                    status: "error",
                    error: error.localizedDescription
                )
            }.value
            return false
        }
    }
    
    private func syncDailyMetrics(_ cached: CachedDailyMetrics, token: String) async -> Bool {
        guard let url = URL(string: "\(Constants.baseURL)/api/daily-metrics") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = cached.createdAt == cached.updatedAt ? "POST" : "PUT"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let metrics = cached.toDailyMetrics()
        
        do {
            let data = try JSONEncoder().encode(metrics)
            request.httpBody = data
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               (200...299).contains(httpResponse.statusCode) {
                await Task { @MainActor in
                    coreDataManager.markAsSynced(entityName: "CachedDailyMetrics", id: cached.id ?? "")
                    coreDataManager.updateSyncStatus(
                        entityName: "CachedDailyMetrics",
                        id: cached.id ?? "",
                        status: "synced"
                    )
                }.value
                return true
            } else {
                await Task { @MainActor in
                    coreDataManager.updateSyncStatus(
                        entityName: "CachedDailyMetrics",
                        id: cached.id ?? "",
                        status: "error",
                        error: "HTTP error"
                    )
                }.value
                return false
            }
        } catch {
            await Task { @MainActor in
                coreDataManager.updateSyncStatus(
                    entityName: "CachedDailyMetrics",
                    id: cached.id ?? "",
                    status: "error",
                    error: error.localizedDescription
                )
            }.value
            return false
        }
    }
    
    func updatePendingSyncCount() {
        Task.detached { [weak self] in
            guard let self = self else { return }
            let unsynced = self.coreDataManager.fetchUnsyncedEntries()
            let count = unsynced.bodyMetrics.count + unsynced.dailyMetrics.count + unsynced.profiles.count
            
            await MainActor.run {
                self.pendingSyncCount = count
            }
        }
    }
    
    // MARK: - Public Methods for Manual Operations
    
    func logWeight(_ weight: Double, unit: String, notes: String? = nil) {
        guard let userId = authManager.currentUser?.id else { return }
        
        let id = UUID().uuidString
        let now = Date()
        
        let metrics = BodyMetrics(
            id: id,
            userId: userId,
            date: now,
            weight: weight,
            weightUnit: unit,
            bodyFatPercentage: nil,
            bodyFatMethod: nil,
            muscleMass: nil,
            boneMass: nil,
            notes: notes,
            photoUrl: nil,
            dataSource: "Manual",
            createdAt: now,
            updatedAt: now
        )
        
        // Save to Core Data
        coreDataManager.saveBodyMetrics(metrics, userId: userId)
        
        // Update pending count
        updatePendingSyncCount()
        
        // Attempt immediate sync if online
        syncIfNeeded()
    }
    
    // Check if weight entry exists for a specific date
    func weightEntryExists(for date: Date) -> Bool {
        guard let userId = authManager.currentUser?.id else { return false }
        
        let calendar = Calendar.current
        // Check within a 1-hour window to handle minor time differences
        let hourBefore = calendar.date(byAdding: .hour, value: -1, to: date) ?? date
        let hourAfter = calendar.date(byAdding: .hour, value: 1, to: date) ?? date
        
        return !coreDataManager.fetchBodyMetrics(
            for: userId,
            from: hourBefore,
            to: hourAfter
        ).isEmpty
    }
    
    // Save weight entry from HealthKit
    func saveWeightEntry(_ entry: WeightEntry) async throws {
        guard let userId = authManager.currentUser?.id else { return }
        
        let id = UUID().uuidString
        let now = Date()
        
        let metrics = BodyMetrics(
            id: id,
            userId: userId,
            date: entry.loggedAt,
            weight: entry.weight,
            weightUnit: entry.weightUnit,
            bodyFatPercentage: nil,
            bodyFatMethod: nil,
            muscleMass: nil,
            boneMass: nil,
            notes: entry.notes,
            photoUrl: nil,
            dataSource: "Manual",
            createdAt: now,
            updatedAt: now
        )
        
        // Save to Core Data
        coreDataManager.saveBodyMetrics(metrics, userId: userId)
        
        // Update pending count
        updatePendingSyncCount()
        
        // Attempt immediate sync if online
        syncIfNeeded()
    }
    
    // Save complete body metrics (including body fat)
    func logBodyMetrics(_ metrics: BodyMetrics) {
        guard let userId = authManager.currentUser?.id else { return }
        
        // Ensure the metrics have the correct user ID
        let metricsWithUserId = BodyMetrics(
            id: metrics.id,
            userId: userId,
            date: metrics.date,
            weight: metrics.weight,
            weightUnit: metrics.weightUnit,
            bodyFatPercentage: metrics.bodyFatPercentage,
            bodyFatMethod: metrics.bodyFatMethod,
            muscleMass: metrics.muscleMass,
            boneMass: metrics.boneMass,
            notes: metrics.notes,
            photoUrl: metrics.photoUrl,
            dataSource: metrics.dataSource,
            createdAt: metrics.createdAt,
            updatedAt: metrics.updatedAt
        )
        
        // Save to Core Data
        coreDataManager.saveBodyMetrics(metricsWithUserId, userId: userId)
        
        // Update pending count
        updatePendingSyncCount()
        
        // Attempt immediate sync if online
        syncIfNeeded()
    }
    
    // Check if daily metrics exist for a specific date
    func dailyMetricsExists(for date: Date) -> Bool {
        guard let userId = authManager.currentUser?.id else { return false }
        
        return coreDataManager.fetchDailyMetrics(for: userId, date: date) != nil
    }
    
    // Save daily metrics from HealthKit
    func saveDailyMetrics(steps: Int, date: Date, notes: String? = nil) async throws {
        guard let userId = authManager.currentUser?.id else { return }
        
        let id = UUID().uuidString
        let now = Date()
        
        let metrics = DailyMetrics(
            id: id,
            userId: userId,
            date: date,
            steps: steps,
            notes: notes,
            createdAt: now,
            updatedAt: now
        )
        
        // Save to Core Data
        coreDataManager.saveDailyMetrics(metrics, userId: userId)
        
        // Update pending count
        updatePendingSyncCount()
        
        // Attempt immediate sync if online
        syncIfNeeded()
    }
    
    func logDailyMetrics(steps: Int?, notes: String? = nil) {
        guard let userId = authManager.currentUser?.id else { return }
        
        let id = UUID().uuidString
        let now = Date()
        
        let metrics = DailyMetrics(
            id: id,
            userId: userId,
            date: now,
            steps: steps,
            notes: notes,
            createdAt: now,
            updatedAt: now
        )
        
        // Save to Core Data
        coreDataManager.saveDailyMetrics(metrics, userId: userId)
        
        // Update pending count
        updatePendingSyncCount()
        
        // Attempt immediate sync if online
        syncIfNeeded()
    }
    
    func fetchLocalBodyMetrics(from startDate: Date? = nil, to endDate: Date? = nil) -> [BodyMetrics] {
        guard let userId = authManager.currentUser?.id else { return [] }
        
        let cached = coreDataManager.fetchBodyMetrics(for: userId, from: startDate, to: endDate)
        return cached.compactMap { $0.toBodyMetrics() }
    }
    
    func fetchLocalDailyMetrics(for date: Date) -> DailyMetrics? {
        guard let userId = authManager.currentUser?.id else { return nil }
        
        return coreDataManager.fetchDailyMetrics(for: userId, date: date)?.toDailyMetrics()
    }
}
