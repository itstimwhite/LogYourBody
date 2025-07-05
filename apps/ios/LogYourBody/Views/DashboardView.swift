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
    @State private var bodyMetrics: [BodyMetrics] = []
    @State private var selectedIndex: Int = 0
    @State private var isLoading = true
    @State private var isLoadingFullHistory = false
    @State private var showHealthKitPrompt = false
    @State private var hasCheckedHealthKit = false
    @State private var isRefreshing = false
    @State private var hasLoadedFullHistory = false
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
                        ScrollView {
                            VStack(spacing: 24) {
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
                                    
                                    // Date Display
                                    if let date = currentMetric?.date {
                                        Text(date, style: .date)
                                            .font(.appBody)
                                            .foregroundColor(.appTextSecondary)
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
                
                // Sync Status Overlay (fixed position)
                if syncManager.pendingSyncCount > 0 && !isLoading {
                    VStack {
                        HStack {
                            Image(systemName: syncManager.isSyncing ? "arrow.triangle.2.circlepath" : "exclamationmark.icloud")
                                .foregroundColor(syncManager.isSyncing ? .blue : .orange)
                                .rotationEffect(.degrees(syncManager.isSyncing ? 360 : 0))
                                .animation(syncManager.isSyncing ? .linear(duration: 1).repeatForever(autoreverses: false) : nil, value: syncManager.isSyncing)
                            
                            Text(syncManager.isSyncing ? "Syncing..." : "\(syncManager.pendingSyncCount) items pending sync")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            if !syncManager.isSyncing {
                                Button("Sync Now") {
                                    syncManager.syncAll()
                                }
                                .font(.caption)
                                .buttonStyle(.bordered)
                            }
                        }
                        .padding()
                        .background(Color.appCard)
                        .cornerRadius(12)
                        .padding(.horizontal)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        
                        Spacer()
                    }
                    .padding(.top, 50)
                }
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                Task {
                    await loadBodyMetrics()
                }
                checkHealthKitStatus()
            }
            .onChange(of: authManager.currentUser?.id) { _ in
                bodyMetrics = []
                selectedIndex = 0
                hasLoadedFullHistory = false
                isLoading = true
                Task {
                    await loadBodyMetrics()
                }
            }
            .sheet(isPresented: $showHealthKitPrompt) {
                HealthKitPromptView(isPresented: $showHealthKitPrompt)
                    .environmentObject(authManager)
            }
        }
    }
    
    private func loadBodyMetrics() async {
        // Phase 1: Load recent data (last 30 days) for quick display
        let recentDate = Calendar.current.date(byAdding: .day, value: -30, to: Date())
        let recentMetrics = await fetchAndProcessMetrics(from: recentDate)
        
        await MainActor.run {
            bodyMetrics = recentMetrics
            if !recentMetrics.isEmpty {
                selectedIndex = recentMetrics.count - 1
            }
            isLoading = false
        }
        
        // Try to sync with HealthKit if authorized and enabled
        if healthKitManager.isAuthorized && healthKitSyncEnabled {
            await syncHealthKitData()
        }
        
        // Trigger sync to get latest data from server
        syncManager.syncIfNeeded()
        
        // Phase 2: Load full history in background
        if !hasLoadedFullHistory {
            await loadFullHistory()
        }
    }
    
    private func fetchAndProcessMetrics(from startDate: Date?) -> [BodyMetrics] {
        let metrics = syncManager.fetchLocalBodyMetrics(from: startDate)
            .sorted { $0.date < $1.date }
        
        // Remove duplicates by date (keep the latest for each date)
        var uniqueMetrics: [BodyMetrics] = []
        var seenDates = Set<Date>()
        
        for metric in metrics.reversed() {
            let calendar = Calendar.current
            let dateOnly = calendar.startOfDay(for: metric.date)
            if !seenDates.contains(dateOnly) {
                seenDates.insert(dateOnly)
                uniqueMetrics.insert(metric, at: 0)
            }
        }
        
        return uniqueMetrics
    }
    
    private func loadFullHistory() async {
        await MainActor.run {
            isLoadingFullHistory = true
        }
        
        // Load all historical data
        let allMetrics = await fetchAndProcessMetrics(from: nil)
        
        // Only update if we got more data than we already have
        if allMetrics.count > bodyMetrics.count {
            await MainActor.run {
                let currentDate = bodyMetrics.indices.contains(selectedIndex) ? bodyMetrics[selectedIndex].date : nil
                
                bodyMetrics = allMetrics
                
                if let currentDate = currentDate,
                   let newIndex = allMetrics.firstIndex(where: { $0.date == currentDate }) {
                    selectedIndex = newIndex
                } else if !allMetrics.isEmpty {
                    selectedIndex = allMetrics.count - 1
                }
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
        do {
            try await healthKitManager.syncWeightFromHealthKit()
            await loadBodyMetrics()
        } catch {
            print("HealthKit sync error: \(error)")
        }
    }
    
    private func refreshData() async {
        isRefreshing = true
        hasLoadedFullHistory = false
        
        if healthKitManager.isAuthorized && healthKitSyncEnabled {
            await syncHealthKitData()
        }
        
        syncManager.syncAll()
        await loadBodyMetrics()
        
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        await MainActor.run {
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