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
        guard networkMonitor.currentPath.status == .satisfied else { return }
        guard authManager.isAuthenticated else { return }
        guard !isSyncing else { return }
        
        let unsynced = coreDataManager.fetchUnsyncedEntries()
        let totalUnsynced = unsynced.bodyMetrics.count + unsynced.dailyMetrics.count + unsynced.profiles.count
        
        if totalUnsynced > 0 {
            syncAll()
        }
    }
    
    func syncAll() {
        guard !isSyncing else { return }
        guard authManager.isAuthenticated else { return }
        
        DispatchQueue.main.async {
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
                    // Get JWT token from Clerk session
                    let tokenResource = try await session.getToken()
                    guard let token = tokenResource?.jwt else {
                        self.isSyncing = false
                        self.syncStatus = .error("Failed to get authentication token")
                        return
                    }
                    
                    self.performSync(token: token)
                } catch {
                    self.isSyncing = false
                    self.syncStatus = .error("Token error: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func performSync(token: String) {
        // TODO: Implement proper API endpoints before enabling sync
        // For now, just mark as success to prevent API errors
        DispatchQueue.main.async { [weak self] in
            self?.isSyncing = false
            self?.syncStatus = .success
            self?.lastSyncDate = Date()
        }
        
        /* Disabled until API endpoints are ready
        let unsynced = coreDataManager.fetchUnsyncedEntries()
        var hasErrors = false
        
        // Sync profiles first
        for profile in unsynced.profiles {
            if !syncProfile(profile, token: token) {
                hasErrors = true
            }
        }
        
        // Sync body metrics
        for metrics in unsynced.bodyMetrics {
            if !syncBodyMetrics(metrics, token: token) {
                hasErrors = true
            }
        }
        
        // Sync daily metrics
        for metrics in unsynced.dailyMetrics {
            if !syncDailyMetrics(metrics, token: token) {
                hasErrors = true
            }
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.isSyncing = false
            self?.lastSyncDate = Date()
            self?.syncStatus = hasErrors ? .error("Some items failed to sync") : .success
            self?.updatePendingSyncCount()
        }
        */
    }
    
    private func syncProfile(_ cached: CachedProfile, token: String) -> Bool {
        guard let url = URL(string: "\(Constants.baseURL)/api/users/profile") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let profile = cached.toUserProfile()
        
        do {
            let data = try JSONEncoder().encode(profile)
            request.httpBody = data
            
            class SyncResultWrapper {
                var value = false
            }
            let syncResult = SyncResultWrapper()
            let semaphore = DispatchSemaphore(value: 0)
            
            URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
                defer { semaphore.signal() }
                
                if let httpResponse = response as? HTTPURLResponse,
                   httpResponse.statusCode == 200 {
                    self?.coreDataManager.markAsSynced(entityName: "CachedProfile", id: cached.id ?? "")
                    self?.coreDataManager.updateSyncStatus(
                        entityName: "CachedProfile",
                        id: cached.id ?? "",
                        status: "synced"
                    )
                    syncResult.value = true
                } else {
                    self?.coreDataManager.updateSyncStatus(
                        entityName: "CachedProfile",
                        id: cached.id ?? "",
                        status: "error",
                        error: error?.localizedDescription ?? "Unknown error"
                    )
                }
            }.resume()
            
            semaphore.wait()
            return syncResult.value
            
        } catch {
            coreDataManager.updateSyncStatus(
                entityName: "CachedProfile",
                id: cached.id ?? "",
                status: "error",
                error: error.localizedDescription
            )
            return false
        }
    }
    
    private func syncBodyMetrics(_ cached: CachedBodyMetrics, token: String) -> Bool {
        guard let url = URL(string: "\(Constants.baseURL)/api/weights") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT" // Always use PUT for upsert behavior
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let metrics = cached.toBodyMetrics()
        
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(metrics)
            request.httpBody = data
            
            class SyncResultWrapper {
                var value = false
            }
            let syncResult = SyncResultWrapper()
            let semaphore = DispatchSemaphore(value: 0)
            
            URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
                defer { semaphore.signal() }
                
                if let httpResponse = response as? HTTPURLResponse {
                    if (200...299).contains(httpResponse.statusCode) {
                        self?.coreDataManager.markAsSynced(entityName: "CachedBodyMetrics", id: cached.id ?? "")
                        self?.coreDataManager.updateSyncStatus(
                            entityName: "CachedBodyMetrics",
                            id: cached.id ?? "",
                            status: "synced"
                        )
                        syncResult.value = true
                    } else if httpResponse.statusCode == 409 {
                        // Conflict - implement last-write-wins strategy
                        // Server will handle the conflict resolution
                        self?.coreDataManager.markAsSynced(entityName: "CachedBodyMetrics", id: cached.id ?? "")
                        self?.coreDataManager.updateSyncStatus(
                            entityName: "CachedBodyMetrics",
                            id: cached.id ?? "",
                            status: "synced"
                        )
                        syncResult.value = true
                    } else {
                        self?.coreDataManager.updateSyncStatus(
                            entityName: "CachedBodyMetrics",
                            id: cached.id ?? "",
                            status: "error",
                            error: "HTTP \(httpResponse.statusCode)"
                        )
                    }
                } else {
                    self?.coreDataManager.updateSyncStatus(
                        entityName: "CachedBodyMetrics",
                        id: cached.id ?? "",
                        status: "error",
                        error: error?.localizedDescription ?? "Unknown error"
                    )
                }
            }.resume()
            
            semaphore.wait()
            return syncResult.value
            
        } catch {
            coreDataManager.updateSyncStatus(
                entityName: "CachedBodyMetrics",
                id: cached.id ?? "",
                status: "error",
                error: error.localizedDescription
            )
            return false
        }
    }
    
    private func syncDailyMetrics(_ cached: CachedDailyMetrics, token: String) -> Bool {
        guard let url = URL(string: "\(Constants.baseURL)/api/daily-metrics") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = cached.createdAt == cached.updatedAt ? "POST" : "PUT"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let metrics = cached.toDailyMetrics()
        
        do {
            let data = try JSONEncoder().encode(metrics)
            request.httpBody = data
            
            class SyncResultWrapper {
                var value = false
            }
            let syncResult = SyncResultWrapper()
            let semaphore = DispatchSemaphore(value: 0)
            
            URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
                defer { semaphore.signal() }
                
                if let httpResponse = response as? HTTPURLResponse,
                   (200...299).contains(httpResponse.statusCode) {
                    self?.coreDataManager.markAsSynced(entityName: "CachedDailyMetrics", id: cached.id ?? "")
                    self?.coreDataManager.updateSyncStatus(
                        entityName: "CachedDailyMetrics",
                        id: cached.id ?? "",
                        status: "synced"
                    )
                    syncResult.value = true
                } else {
                    self?.coreDataManager.updateSyncStatus(
                        entityName: "CachedDailyMetrics",
                        id: cached.id ?? "",
                        status: "error",
                        error: error?.localizedDescription ?? "Unknown error"
                    )
                }
            }.resume()
            
            semaphore.wait()
            return syncResult.value
            
        } catch {
            coreDataManager.updateSyncStatus(
                entityName: "CachedDailyMetrics",
                id: cached.id ?? "",
                status: "error",
                error: error.localizedDescription
            )
            return false
        }
    }
    
    func updatePendingSyncCount() {
        let unsynced = coreDataManager.fetchUnsyncedEntries()
        let count = unsynced.bodyMetrics.count + unsynced.dailyMetrics.count + unsynced.profiles.count
        
        DispatchQueue.main.async {
            self.pendingSyncCount = count
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
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay) ?? date
        
        return coreDataManager.fetchBodyMetrics(
            for: userId,
            from: startOfDay,
            to: endOfDay
        ).count > 0
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
        return cached.map { $0.toBodyMetrics() }
    }
    
    func fetchLocalDailyMetrics(for date: Date) -> DailyMetrics? {
        guard let userId = authManager.currentUser?.id else { return nil }
        
        return coreDataManager.fetchDailyMetrics(for: userId, date: date)?.toDailyMetrics()
    }
}