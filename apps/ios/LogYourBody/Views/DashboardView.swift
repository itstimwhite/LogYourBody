//
//  DashboardView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI
import HealthKit

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var syncManager: SyncManager
    @StateObject private var healthKitManager = HealthKitManager.shared
    @StateObject private var realtimeSync = RealtimeSyncManager.shared
    @State private var bodyMetrics: [BodyMetrics] = []
    @State private var selectedIndex: Int = 0
    @State private var isLoading = false  // Start with false to show cached data immediately
    @State private var isLoadingFullHistory = false
    @State private var showHealthKitPrompt = false
    @State private var hasCheckedHealthKit = false
    @State private var isRefreshing = false
    @State private var hasLoadedFullHistory = false
    @State private var isSyncingHealthKit = false
    @State private var hasInitialDataLoaded = false
    @AppStorage(Constants.preferredMeasurementSystemKey) private var measurementSystem = PreferencesView.defaultMeasurementSystem
    @AppStorage("healthKitSyncEnabled") private var healthKitSyncEnabled = true
    
    var currentSystem: PreferencesView.MeasurementSystem {
        PreferencesView.MeasurementSystem(rawValue: measurementSystem) ?? .imperial
    }
    
    var currentMetric: BodyMetrics? {
        guard !bodyMetrics.isEmpty && selectedIndex >= 0 && selectedIndex < bodyMetrics.count else { return nil }
        return bodyMetrics[selectedIndex]
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                if isLoading {
                    // Loading State
                    VStack(spacing: 20) {
                        ProgressView()
                            .scaleEffect(1.5)
                        Text("Loading your data...")
                            .font(.appBody)
                            .foregroundColor(.appTextSecondary)
                    }
                } else if bodyMetrics.isEmpty {
                    // Empty State
                    VStack(spacing: 20) {
                        Image(systemName: "chart.line.downtrend.xyaxis")
                            .font(.system(size: 60))
                            .foregroundColor(.appTextTertiary)
                        Text("No body composition data yet")
                            .font(.appHeadline)
                            .foregroundColor(.appText)
                        Text("Log your first measurement to get started")
                            .font(.appBody)
                            .foregroundColor(.appTextSecondary)
                    }
                } else {
                    // Main Content
                    VStack(spacing: 0) {
                        // Add spacer at top to push content down
                        Spacer(minLength: 40)
                        
                        ScrollView {
                            VStack(spacing: 24) {
                                // Progress Photo Display
                                VStack(spacing: 12) {
                                    if let photoUrl = currentMetric?.photoUrl, !photoUrl.isEmpty {
                                        AsyncImage(url: URL(string: photoUrl)) { image in
                                            image
                                                .resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .frame(maxHeight: 300)
                                                .cornerRadius(12)
                                                .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
                                        } placeholder: {
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(Color.appCard)
                                                .frame(height: 300)
                                                .overlay(
                                                    ProgressView()
                                                        .scaleEffect(1.2)
                                                )
                                        }
                                    } else {
                                        // Placeholder image
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(
                                                LinearGradient(
                                                    gradient: Gradient(colors: [
                                                        Color.appCard,
                                                        Color.appCard.opacity(0.8)
                                                    ]),
                                                    startPoint: .top,
                                                    endPoint: .bottom
                                                )
                                            )
                                            .frame(height: 300)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 12)
                                                    .stroke(Color.appBorder, lineWidth: 1)
                                            )
                                            .overlay(
                                                VStack(spacing: 16) {
                                                    Circle()
                                                        .fill(Color.appBackground)
                                                        .frame(width: 80, height: 80)
                                                        .overlay(
                                                            Image(systemName: "camera.fill")
                                                                .font(.system(size: 36))
                                                                .foregroundColor(.appTextTertiary)
                                                        )
                                                    Text("No progress photo")
                                                        .font(.appBodyLarge)
                                                        .foregroundColor(.appTextSecondary)
                                                    Text("Tap to add photo")
                                                        .font(.appCaption)
                                                        .foregroundColor(.appTextTertiary)
                                                }
                                            )
                                            .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
                                    }
                                    
                                    // Date Display
                                    if let date = currentMetric?.date {
                                        Text(date, style: .date)
                                            .font(.appBody)
                                            .foregroundColor(.appTextSecondary)
                                    }
                                }
                                .padding(.horizontal)
                                
                                // Main Body Fat Display
                                VStack(spacing: 16) {
                                    if let bodyFat = currentMetric?.bodyFatPercentage {
                                        VStack(spacing: 8) {
                                            Text("Body Fat")
                                                .font(.appBodyLarge)
                                                .foregroundColor(.appTextSecondary)
                                            
                                            HStack(alignment: .firstTextBaseline, spacing: 2) {
                                                Text("\(bodyFat, specifier: "%.1f")")
                                                    .font(.system(size: 72, weight: .bold, design: .rounded))
                                                    .foregroundColor(.appText)
                                                Text("%")
                                                    .font(.system(size: 36, weight: .medium, design: .rounded))
                                                    .foregroundColor(.appTextSecondary)
                                            }
                                        }
                                        .padding(.vertical, 20)
                                    } else {
                                        VStack(spacing: 8) {
                                            Text("Body Fat")
                                                .font(.appBodyLarge)
                                                .foregroundColor(.appTextSecondary)
                                            
                                            Text("--")
                                                .font(.system(size: 72, weight: .bold, design: .rounded))
                                                .foregroundColor(.appTextTertiary)
                                        }
                                        .padding(.vertical, 20)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.horizontal)
                                
                                // Secondary Metrics Grid
                                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                    MetricCard(
                                        title: "Weight",
                                        value: currentMetric?.weight != nil ? convertWeight(currentMetric!.weight!, from: "kg", to: currentSystem.weightUnit) : nil,
                                        unit: currentSystem.weightUnit,
                                        icon: "scalemass",
                                        color: .blue
                                    )
                                    
                                    MetricCard(
                                        title: "FFMI",
                                        value: calculateFFMI(),
                                        unit: "",
                                        icon: "figure.strengthtraining.traditional",
                                        color: .green
                                    )
                                    
                                    MetricCard(
                                        title: "Lean Mass",
                                        value: calculateLeanMass() != nil ? convertWeight(calculateLeanMass()!, from: "kg", to: currentSystem.weightUnit) : nil,
                                        unit: currentSystem.weightUnit,
                                        icon: "figure.arms.open",
                                        color: .purple
                                    )
                                    
                                    MetricCard(
                                        title: "Fat Mass",
                                        value: calculateFatMass() != nil ? convertWeight(calculateFatMass()!, from: "kg", to: currentSystem.weightUnit) : nil,
                                        unit: currentSystem.weightUnit,
                                        icon: "drop.fill",
                                        color: .orange
                                    )
                                }
                                .padding(.horizontal)
                                
                                Spacer(minLength: 100)
                            }
                            .padding(.top)
                        }
                        .refreshable {
                            await refreshData()
                        }
                        
                        // Timeline Slider
                        if bodyMetrics.count > 1 {
                            VStack(spacing: 12) {
                                Slider(
                                    value: Binding(
                                        get: { Double(selectedIndex) },
                                        set: { selectedIndex = Int($0) }
                                    ),
                                    in: 0...Double(max(0, bodyMetrics.count - 1)),
                                    step: 1
                                )
                                .tint(.appPrimary)
                                .padding(.horizontal)
                                
                                HStack {
                                    if let firstDate = bodyMetrics.first?.date {
                                        Text(firstDate, style: .date)
                                            .font(.appCaption)
                                            .foregroundColor(.appTextTertiary)
                                    }
                                    
                                    Spacer()
                                    
                                    VStack(spacing: 2) {
                                        Text("\(selectedIndex + 1) of \(bodyMetrics.count)")
                                            .font(.appCaptionBold)
                                            .foregroundColor(.appTextSecondary)
                                        
                                        if isLoadingFullHistory {
                                            Text("Loading history...")
                                                .font(.appCaption)
                                                .foregroundColor(.appTextTertiary)
                                        }
                                    }
                                    
                                    Spacer()
                                    
                                    if let lastDate = bodyMetrics.last?.date {
                                        Text(lastDate, style: .date)
                                            .font(.appCaption)
                                            .foregroundColor(.appTextTertiary)
                                    }
                                }
                                .padding(.horizontal)
                            }
                            .padding(.vertical)
                            .background(Color.appCard)
                            .overlay(
                                Rectangle()
                                    .fill(Color.appBorder)
                                    .frame(height: 1),
                                alignment: .top
                            )
                        }
                    }
                }
                
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if syncManager.pendingSyncCount > 0 {
                        Button(action: {
                            print("🚀 Manual sync triggered")
                            syncManager.syncAll()
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: syncManager.isSyncing ? "arrow.triangle.2.circlepath" : "icloud.and.arrow.up")
                                    .rotationEffect(.degrees(syncManager.isSyncing ? 360 : 0))
                                    .animation(syncManager.isSyncing ? Animation.linear(duration: 1).repeatForever(autoreverses: false) : .default, value: syncManager.isSyncing)
                                Text("\(syncManager.pendingSyncCount)")
                                    .font(.caption)
                            }
                            .foregroundColor(syncManager.isSyncing ? .gray : .blue)
                        }
                        .disabled(syncManager.isSyncing)
                    }
                }
            }
            .onAppear {
                // Load cached data immediately (synchronously)
                loadCachedDataImmediately()
                
                // Then check for updates asynchronously
                Task {
                    await loadBodyMetricsIncrementally()
                }
                checkHealthKitStatus()
            }
            .onChange(of: authManager.currentUser?.id) { _ in
                bodyMetrics = []
                selectedIndex = 0
                hasLoadedFullHistory = false
                hasInitialDataLoaded = false
                isLoading = false
                // Load cached data immediately for new user
                loadCachedDataImmediately()
                Task {
                    await loadBodyMetricsIncrementally()
                }
            }
            .onChange(of: realtimeSync.lastSyncDate) { _ in
                // Only reload if we don't have data
                if bodyMetrics.isEmpty {
                    let updatedMetrics = fetchAndProcessMetrics(from: nil)
                    if !updatedMetrics.isEmpty {
                        bodyMetrics = updatedMetrics
                        selectedIndex = updatedMetrics.count - 1
                    }
                } else {
                    // Just update the sync status, don't reload all data
                    print("📊 Sync completed, data already loaded")
                }
            }
            .sheet(isPresented: $showHealthKitPrompt) {
                HealthKitPromptView(isPresented: $showHealthKitPrompt)
                    .environmentObject(authManager)
            }
        }
    }
    
    // Load cached data immediately on view appear (synchronous)
    private func loadCachedDataImmediately() {
        guard !hasInitialDataLoaded else { return }
        hasInitialDataLoaded = true
        
        // Load all cached data immediately
        let allCachedMetrics = fetchAndProcessMetrics(from: nil)
        
        if !allCachedMetrics.isEmpty {
            bodyMetrics = allCachedMetrics
            selectedIndex = allCachedMetrics.count - 1
            print("📊 Loaded \(allCachedMetrics.count) cached metrics immediately")
        }
    }
    
    private func loadBodyMetricsIncrementally() async {
        // Only sync if we haven't synced recently
        let shouldSyncHealthKit = healthKitManager.isAuthorized && 
                                 healthKitSyncEnabled && 
                                 !isSyncingHealthKit &&
                                 shouldPerformHealthKitSync()
        
        if shouldSyncHealthKit {
            // Sync only recent data (last 7 days) from HealthKit
            await syncRecentHealthKitData()
        }
        
        // Trigger sync to upload data to Supabase
        syncManager.syncIfNeeded()
        
        // Also trigger realtime sync
        realtimeSync.syncIfNeeded()
        
        // Load incremental history in background only if needed
        // Check if we actually need more historical data
        let needsHistoricalData = !hasLoadedFullHistory && bodyMetrics.count < 30
        let oldestEntry = bodyMetrics.first?.date ?? Date()
        let daysSinceOldest = Calendar.current.dateComponents([.day], from: oldestEntry, to: Date()).day ?? 0
        
        if needsHistoricalData && daysSinceOldest < 180 { // Only load if we have less than 6 months of data
            await loadIncrementalHistory()
        }
    }
    
    // Check if we should perform HealthKit sync (not more than once per hour)
    private func shouldPerformHealthKitSync() -> Bool {
        let lastSyncKey = "lastHealthKitSyncDate"
        if let lastSync = UserDefaults.standard.object(forKey: lastSyncKey) as? Date {
            let hoursSinceLastSync = Date().timeIntervalSince(lastSync) / 3600
            return hoursSinceLastSync >= 1.0 // Only sync if more than 1 hour has passed
        }
        return true
    }
    
    // Sync only recent HealthKit data
    private func syncRecentHealthKitData() async {
        guard !isSyncingHealthKit else { return }
        
        isSyncingHealthKit = true
        defer { 
            isSyncingHealthKit = false
            UserDefaults.standard.set(Date(), forKey: "lastHealthKitSyncDate")
        }
        
        do {
            // Only sync last 7 days from HealthKit
            try await healthKitManager.syncWeightFromHealthKitIncremental(days: 7)
            
            // Reload data after sync
            let updatedMetrics = fetchAndProcessMetrics(from: nil)
            await MainActor.run {
                bodyMetrics = updatedMetrics
                if !updatedMetrics.isEmpty && selectedIndex >= updatedMetrics.count {
                    selectedIndex = updatedMetrics.count - 1
                }
            }
        } catch {
            print("HealthKit sync error: \(error)")
        }
    }
    
    private func loadBodyMetrics() async {
        // This method is now replaced by loadCachedDataImmediately and loadBodyMetricsIncrementally
        // Keeping for backward compatibility if called elsewhere
        await loadBodyMetricsIncrementally()
    }
    
    private func fetchAndProcessMetrics(from startDate: Date?) -> [BodyMetrics] {
        guard let userId = authManager.currentUser?.id else { return [] }
        
        let cachedMetrics = CoreDataManager.shared.fetchBodyMetrics(for: userId, from: startDate)
        let metrics = cachedMetrics.map { cached in
            BodyMetrics(
                id: cached.id ?? UUID().uuidString,
                userId: cached.userId ?? "",
                date: cached.date ?? Date(),
                weight: cached.weight > 0 ? cached.weight : nil,
                weightUnit: cached.weightUnit ?? "kg",
                bodyFatPercentage: cached.bodyFatPercentage > 0 ? cached.bodyFatPercentage : nil,
                bodyFatMethod: cached.bodyFatMethod,
                muscleMass: cached.muscleMass > 0 ? cached.muscleMass : nil,
                boneMass: cached.boneMass > 0 ? cached.boneMass : nil,
                notes: cached.notes,
                photoUrl: cached.photoUrl,
                createdAt: cached.createdAt ?? Date(),
                updatedAt: cached.updatedAt ?? Date()
            )
        }
        .sorted { $0.date < $1.date }
        
        // Only print summary in debug mode
        #if DEBUG
        if metrics.count > 100 {
            print("📊 Fetched \(metrics.count) body metrics from CoreData")
        }
        #endif
        
        // Remove duplicates more intelligently
        var uniqueMetrics: [BodyMetrics] = []
        var processedEntries = Set<String>()
        
        // Sort by date and updatedAt to get the most recent version of each entry
        let sortedMetrics = metrics.sorted { (a, b) in
            if a.date == b.date {
                return a.updatedAt > b.updatedAt
            }
            return a.date < b.date
        }
        
        for metric in sortedMetrics {
            // Create a unique key based on date and time (rounded to nearest hour to handle minor time differences)
            let calendar = Calendar.current
            let components = calendar.dateComponents([.year, .month, .day, .hour], from: metric.date)
            let roundedDate = calendar.date(from: components) ?? metric.date
            let uniqueKey = "\(userId)-\(ISO8601DateFormatter().string(from: roundedDate))"
            
            if !processedEntries.contains(uniqueKey) {
                processedEntries.insert(uniqueKey)
                uniqueMetrics.append(metric)
            }
        }
        
        return uniqueMetrics
    }
    
    private func loadIncrementalHistory() async {
        await MainActor.run {
            isLoadingFullHistory = true
        }
        
        var currentStartDate = Calendar.current.date(byAdding: .day, value: -37, to: Date()) // Start from 37 days ago (7 + 30)
        let batchSize = 30 // Days per batch
        var hasMoreData = true
        
        while hasMoreData && !Task.isCancelled {
            // Calculate end date for this batch (30 days before current start)
            let batchEndDate = Calendar.current.date(byAdding: .day, value: -batchSize, to: currentStartDate!)
            
            // Fetch metrics for this 30-day batch
            let batchMetrics = await fetchAndProcessMetrics(from: batchEndDate)
                .filter { $0.date < currentStartDate! }
            
            if batchMetrics.isEmpty {
                hasMoreData = false
            } else {
                // Add new metrics to the beginning of the array (older data)
                await MainActor.run {
                    let currentDate = bodyMetrics.indices.contains(selectedIndex) ? bodyMetrics[selectedIndex].date : nil
                    
                    // Merge new data with existing data, avoiding duplicates
                    let allMetrics = (batchMetrics + bodyMetrics)
                        .sorted { $0.date < $1.date }
                        .removingDuplicatesBy { Calendar.current.startOfDay(for: $0.date) }
                    
                    bodyMetrics = allMetrics
                    
                    // Maintain the selected item position
                    if let currentDate = currentDate,
                       let newIndex = allMetrics.firstIndex(where: { $0.date == currentDate }) {
                        selectedIndex = newIndex
                    } else if !allMetrics.isEmpty {
                        selectedIndex = allMetrics.count - 1
                    }
                }
                
                // Move to the next batch (30 days earlier)
                currentStartDate = batchEndDate
                
                // Add a small delay to avoid overwhelming the UI
                try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
            }
        }
        
        await MainActor.run {
            hasLoadedFullHistory = true
            isLoadingFullHistory = false
        }
    }
    
    private func checkHealthKitStatus() {
        guard !hasCheckedHealthKit else { return }
        hasCheckedHealthKit = true
        
        if healthKitManager.isHealthKitAvailable && !healthKitManager.isAuthorized && healthKitSyncEnabled {
            let lastPromptDate = UserDefaults.standard.object(forKey: "lastHealthKitPromptDate") as? Date
            let shouldShowPrompt = lastPromptDate == nil || 
                Calendar.current.dateComponents([.day], from: lastPromptDate!, to: Date()).day! > 7
            
            if shouldShowPrompt {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    showHealthKitPrompt = true
                }
            }
        }
    }
    
    private func syncHealthKitData() async {
        // This method is deprecated - use syncRecentHealthKitData instead
        await syncRecentHealthKitData()
    }
    
    private func refreshData() async {
        isRefreshing = true
        
        // Only sync recent data from HealthKit on manual refresh
        if healthKitManager.isAuthorized && healthKitSyncEnabled {
            await syncRecentHealthKitData()
        }
        
        // Sync with Supabase
        realtimeSync.syncAll()
        
        // Wait a bit for sync to complete
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        // Reload data from cache
        let updatedMetrics = fetchAndProcessMetrics(from: nil)
        
        await MainActor.run {
            if !updatedMetrics.isEmpty {
                bodyMetrics = updatedMetrics
                if selectedIndex >= updatedMetrics.count {
                    selectedIndex = updatedMetrics.count - 1
                }
            }
            isRefreshing = false
        }
    }
    
    private func convertWeight(_ weight: Double, from: String, to: String) -> Double {
        if from == to {
            return weight
        }
        
        let weightInKg = from == "lbs" ? weight * 0.453592 : weight
        return to == "lbs" ? weightInKg * 2.20462 : weightInKg
    }
    
    private func calculateFFMI() -> Double? {
        guard let weight = currentMetric?.weight,
              let bodyFatPercentage = currentMetric?.bodyFatPercentage,
              let heightInInches = authManager.currentUser?.profile?.height else {
            return nil
        }
        
        let heightInMeters = heightInInches * 0.0254
        let leanBodyMassKg = weight * (1 - bodyFatPercentage / 100)
        let ffmi = (leanBodyMassKg / pow(heightInMeters, 2)) + 6.1 * (1.8 - heightInMeters)
        
        return round(ffmi * 10) / 10
    }
    
    private func calculateLeanMass() -> Double? {
        guard let weight = currentMetric?.weight,
              let bodyFatPercentage = currentMetric?.bodyFatPercentage else {
            return nil
        }
        
        return weight * (1 - bodyFatPercentage / 100)
    }
    
    private func calculateFatMass() -> Double? {
        guard let weight = currentMetric?.weight,
              let bodyFatPercentage = currentMetric?.bodyFatPercentage else {
            return nil
        }
        
        return weight * (bodyFatPercentage / 100)
    }
}

struct MetricCard: View {
    let title: String
    let value: Double?
    let unit: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.appBody)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.appBodySmall)
                    .foregroundColor(.appTextSecondary)
                
                Spacer()
            }
            
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                if let value = value {
                    Text("\(value, specifier: "%.1f")")
                        .font(.appHeadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.appText)
                    if !unit.isEmpty {
                        Text(unit)
                            .font(.appBodySmall)
                            .foregroundColor(.appTextSecondary)
                    }
                } else {
                    Text("--")
                        .font(.appHeadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.appTextTertiary)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.appCard)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.appBorder, lineWidth: 1)
        )
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager.shared)
            .environmentObject(SyncManager.shared)
            .preferredColorScheme(.dark)
    }
}

extension Array {
    func removingDuplicatesBy<Key: Hashable>(_ keyPath: (Element) -> Key) -> [Element] {
        var seen = Set<Key>()
        return filter { seen.insert(keyPath($0)).inserted }
    }
}