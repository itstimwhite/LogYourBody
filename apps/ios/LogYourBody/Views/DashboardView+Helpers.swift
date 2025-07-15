//
// DashboardView+Helpers.swift
// LogYourBody
//
// Helper methods for DashboardView
// import SwiftUI
import HealthKit
import PhotosUI

extension DashboardView {
    // MARK: - Data Loading
    
    @MainActor
    func loadCachedDataImmediately() {
        guard let userId = authManager.currentUser?.id else {
            // print("⚠️ loadCachedDataImmediately: No user ID available")
            hasLoadedInitialData = true
            return
        }
        
        // print("🔍 Loading cached data for user: \(userId)")
        
        do {
            let cached = CoreDataManager.shared.fetchBodyMetrics(for: userId)
            bodyMetrics = cached.compactMap { $0.toBodyMetrics() }
                .sorted { $0.date < $1.date }
            
            // print("📊 Found \(bodyMetrics.count) body metrics for user \(userId)")
            
            if !bodyMetrics.isEmpty {
                selectedIndex = min(bodyMetrics.count - 1, max(0, selectedIndex))
                loadMetricsForSelectedDate()
            }
            
            hasLoadedInitialData = true
        } catch {
            // print("❌ Error loading cached data: \(error)")
            bodyMetrics = []
            hasLoadedInitialData = true
        }
    }
    
    @MainActor
    func loadDailyMetrics() {
        guard let userId = authManager.currentUser?.id else {
            // print("⚠️ loadDailyMetrics: No user ID available")
            return
        }
        
        // print("🔍 Loading daily metrics for user: \(userId)")
        
        dailyMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: Date())?.toDailyMetrics()
        // Also set selectedDateMetrics for today initially
        selectedDateMetrics = dailyMetrics
        
        // print("📊 Daily metrics loaded: \(dailyMetrics?.steps ?? 0) steps")
    }
    
    @MainActor
    func loadMetricsForSelectedDate() {
        guard let userId = authManager.currentUser?.id else { return }
        guard let currentDate = currentMetric?.date else { return }
        
        selectedDateMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: currentDate)?.toDailyMetrics()
    }
    
    func loadBodyMetrics() async {
        isLoading = true
        defer { isLoading = false }
        
        // Sync with remote if needed
        syncManager.syncIfNeeded()
        
        // Reload from cache
        loadCachedDataImmediately()
        loadDailyMetrics()
        loadMetricsForSelectedDate()
    }
    
    func refreshData() async {
        // Sync steps from HealthKit if authorized
        if healthKitManager.isAuthorized {
            await syncStepsFromHealthKit()
        }
        
        // Sync with remote
        syncManager.syncAll()
        
        // Wait a bit for sync
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        // Reload from cache
        loadCachedDataImmediately()
        loadDailyMetrics()
        loadMetricsForSelectedDate()
    }
    
    // MARK: - Photo Management
    
    func handlePhotoCapture(_ image: UIImage) async {
        guard let currentMetric = currentMetric else {
            await MainActor.run {
                // ToastManager.shared.show("No metric selected", type: .error)
            }
            return
        }
        
        do {
            _ = try await PhotoUploadManager.shared.uploadProgressPhoto(
                for: currentMetric,
                image: image
            )
            
            await MainActor.run {
                // ToastManager.shared.show("Photo uploaded successfully", type: .success)
                SyncManager.shared.syncIfNeeded()
            }
            
            // Reload to show new photo
            await loadBodyMetrics()
        } catch {
            await MainActor.run {
                // ToastManager.shared.show("Failed to upload photo", type: .error)
            }
        }
    }
    
    func handlePhotoSelection(_ item: PhotosPickerItem?) async {
        guard let item = item else { return }
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else {
            await MainActor.run {
                // ToastManager.shared.show("Failed to load image", type: .error)
            }
            return
        }
        
        await handlePhotoCapture(image)
    }
    
    func saveProgressPhoto(_ image: UIImage) async {
        await handlePhotoCapture(image)
    }
    
    // MARK: - HealthKit Integration
    
    func syncStepsFromHealthKit() async {
        do {
            // print("📱 Starting HealthKit step sync...")
            
            let stepCount = try await healthKitManager.fetchTodayStepCount()
            // print("👟 Today's steps from HealthKit: \(stepCount)")
            
            // Update daily metrics
            await updateStepCount(stepCount)
            
            // print("✅ HealthKit sync completed")
        } catch {
            // print("❌ HealthKit sync error: \(error)")
        }
    }
    
    func syncHistoricalSteps() async {
        guard let userId = authManager.currentUser?.id else { return }
        
        do {
            // print("📱 Starting historical step sync...")
            
            // Get last 30 days of step data
            let endDate = Date()
            let startDate = Calendar.current.date(byAdding: .day, value: -30, to: endDate) ?? endDate
            
            let stepHistory = try await healthKitManager.fetchStepCountHistory(days: 30)
            let stepData = stepHistory.map { (date: $0.date, steps: $0.stepCount) }
            
            for (date, steps) in stepData {
                if let existingMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: date) {
                    // Update existing metrics
                    existingMetrics.steps = Int32(steps)
                    existingMetrics.updatedAt = Date()
                } else {
                    // Create new daily metrics
                    let newMetrics = DailyMetrics(
                        id: UUID().uuidString,
                        userId: userId,
                        date: date,
                        steps: steps,
                        notes: nil,
                        createdAt: Date(),
                        updatedAt: Date()
                    )
                    CoreDataManager.shared.saveDailyMetrics(newMetrics, userId: userId)
                }
            }
            
            UserDefaults.standard.set(true, forKey: "HasSyncedHistoricalSteps")
            // print("✅ Historical step sync completed")
            
            // Reload data
            await MainActor.run {
                loadDailyMetrics()
                loadMetricsForSelectedDate()
            }
        } catch {
            // print("❌ Historical step sync error: \(error)")
        }
    }
    
    func updateStepCount(_ steps: Int) async {
        guard let userId = authManager.currentUser?.id else { return }
        
        let today = Date()
        
        if let existingMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: today) {
            // Update existing metrics
            existingMetrics.steps = Int32(steps)
            existingMetrics.updatedAt = Date()
            
            let dailyMetrics = existingMetrics.toDailyMetrics()
            await MainActor.run {
                self.dailyMetrics = dailyMetrics
                
                // Update selectedDateMetrics if viewing today
                if Calendar.current.isDateInToday(currentMetric?.date ?? Date()) {
                    self.selectedDateMetrics = dailyMetrics
                }
            }
        } else {
            // Create new daily metrics
            let newMetrics = DailyMetrics(
                id: UUID().uuidString,
                userId: userId,
                date: today,
                steps: steps,
                notes: nil,
                createdAt: Date(),
                updatedAt: Date()
            )
            
            CoreDataManager.shared.saveDailyMetrics(newMetrics, userId: userId)
            
            await MainActor.run {
                self.dailyMetrics = newMetrics
                if Calendar.current.isDateInToday(currentMetric?.date ?? Date()) {
                    self.selectedDateMetrics = newMetrics
                }
            }
        }
        
        await MainActor.run {
            // Trigger sync to upload to remote
            syncManager.syncIfNeeded()
        }
    }
    
    // MARK: - Helper Functions
    
    func formatStepCount(_ steps: Int) -> String {
        if steps >= 10_000 {
            return String(format: "%.1fK", Double(steps) / 1_000.0)
        } else {
            return "\(steps)"
        }
    }
    
    // MARK: - Navigation Helpers
    
    var hasPhotos: Bool {
        bodyMetrics.contains { $0.photoUrl != nil }
    }
    
    var hasPreviousPhoto: Bool {
        guard selectedIndex > 0 else { return false }
        return bodyMetrics[0..<selectedIndex].contains { $0.photoUrl != nil }
    }
    
    var hasNextPhoto: Bool {
        guard selectedIndex < bodyMetrics.count - 1 else { return false }
        return bodyMetrics[(selectedIndex + 1)...].contains { $0.photoUrl != nil }
    }
    
    func navigateToPreviousPhoto() {
        guard selectedIndex > 0 else { return }
        
        // Find previous metric with photo
        for i in stride(from: selectedIndex - 1, through: 0, by: -1) {
            if bodyMetrics[i].photoUrl != nil {
                selectedIndex = i
                HapticManager.shared.impact(style: .light)
                break
            }
        }
    }
    
    func navigateToNextPhoto() {
        guard selectedIndex < bodyMetrics.count - 1 else { return }
        
        // Find next metric with photo
        for i in (selectedIndex + 1)..<bodyMetrics.count {
            if bodyMetrics[i].photoUrl != nil {
                selectedIndex = i
                HapticManager.shared.impact(style: .light)
                break
            }
        }
    }
}
