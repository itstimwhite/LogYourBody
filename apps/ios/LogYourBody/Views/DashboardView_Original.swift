//
//  DashboardView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI
import HealthKit
import PhotosUI

// MARK: - Temporary UI Components (until UIComponents.swift is added to Xcode project)

// MARK: - SmartBlur Modifier
struct SmartBlurModifier: ViewModifier {
    let isPresented: Bool
    let radius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .blur(radius: isPresented ? radius : 0)
            .animation(.easeInOut(duration: 0.3), value: isPresented)
            .allowsHitTesting(!isPresented)
    }
}

extension View {
    func smartBlur(isPresented: Bool, radius: CGFloat = 8) -> some View {
        modifier(SmartBlurModifier(isPresented: isPresented, radius: radius))
    }
}

struct DashboardEmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var action: (() -> Void)? = nil
    var actionTitle: String = "Get Started"
    
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: icon)
                .font(.system(size: 64, weight: .light))
                .foregroundColor(.appTextSecondary)
            
            VStack(spacing: 12) {
                Text(title)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.appText)
                
                Text(message)
                    .font(.system(size: 16))
                    .foregroundColor(.appTextSecondary)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            if let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.appPrimary)
                        .cornerRadius(24)
                }
                .padding(.top, 8)
            }
        }
        .padding(40)
    }
}

struct DashboardMetricGauge: View {
    let value: Double
    let maxValue: Double
    let label: String
    let unit: String
    let color: Color
    var size: CGSize = CGSize(width: 100, height: 100)
    
    private var normalizedValue: Double {
        min(1.0, max(0.0, value / maxValue))
    }
    
    private var displayValue: String {
        if value >= 1000 {
            return String(format: "%.1fK", value / 1000)
        } else {
            return String(format: "%.0f", value)
        }
    }
    
    var body: some View {
        ZStack {
            // Background circle - 1pt gray remainder
            Circle()
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                .frame(width: size.width, height: size.height)
            
            // Progress arc - 3pt white ring (monochrome)
            Circle()
                .trim(from: 0, to: normalizedValue)
                .stroke(
                    Color.white,
                    style: StrokeStyle(
                        lineWidth: 3,
                        lineCap: .round
                    )
                )
                .frame(width: size.width, height: size.height)
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 0.6, dampingFraction: 0.8), value: normalizedValue)
            
            // Content
            VStack(spacing: 2) {
                Text(displayValue)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                
                Text(label)
                    .font(.system(size: 12, weight: .regular))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
    }
}

struct DashboardHeaderBar<Leading: View, Trailing: View>: View {
    let title: String
    let leading: Leading
    let trailing: Trailing
    var showLiquidGlass: Bool = true
    
    init(
        title: String = "",
        showLiquidGlass: Bool = true,
        @ViewBuilder leading: () -> Leading = { EmptyView() },
        @ViewBuilder trailing: () -> Trailing = { EmptyView() }
    ) {
        self.title = title
        self.showLiquidGlass = showLiquidGlass
        self.leading = leading()
        self.trailing = trailing()
    }
    
    var body: some View {
        HStack {
            leading
            
            Spacer()
            
            if !title.isEmpty {
                Text(title)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.appText)
            }
            
            Spacer()
            
            trailing
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            Group {
                if showLiquidGlass {
                    if #available(iOS 18.0, *) {
                        Rectangle()
                            .fill(.ultraThinMaterial)
                            .overlay(
                                Rectangle()
                                    .fill(Color.appBackground.opacity(0.8))
                            )
                    } else {
                        Rectangle()
                            .fill(Color.appBackground.opacity(0.95))
                    }
                }
            }
        )
        .overlay(
            Group {
                if showLiquidGlass {
                    Rectangle()
                        .fill(Color.appBorder)
                        .frame(height: 0.5)
                }
            },
            alignment: .bottom
        )
    }
}

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var syncManager: SyncManager
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var dailyMetrics: DailyMetrics?
    @State private var selectedDateMetrics: DailyMetrics?
    @State private var bodyMetrics: [BodyMetrics] = []
    @State private var selectedIndex: Int = 0
    @State private var isLoading = false
    @State private var hasLoadedInitialData = false
    @State private var refreshID = UUID()
    @State private var showPhotoOptions = false
    @State private var showCamera = false
    @State private var showPhotoPicker = false
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var showingModal = false
    @Namespace private var namespace
    @AppStorage(Constants.preferredMeasurementSystemKey) private var measurementSystem = PreferencesView.defaultMeasurementSystem
    
    var currentSystem: PreferencesView.MeasurementSystem {
        PreferencesView.MeasurementSystem(rawValue: measurementSystem) ?? .imperial
    }
    
    var currentMetric: BodyMetrics? {
        guard !bodyMetrics.isEmpty && selectedIndex >= 0 && selectedIndex < bodyMetrics.count else { return nil }
        return bodyMetrics[selectedIndex]
    }
    
    var userAge: Int? {
        guard let dateOfBirth = authManager.currentUser?.profile?.dateOfBirth else { return nil }
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: dateOfBirth, to: Date())
        return ageComponents.year
    }
    
    @ViewBuilder
    private var loadingView: some View {
        // Use skeleton loader instead of empty state for smoother experience
        DashboardSkeleton()
    }
    
    @ViewBuilder
    private var emptyStateView: some View {
        DashboardEmptyStateView(
            icon: "chart.line.downtrend.xyaxis",
            title: "No data yet",
            message: "Log your first measurement to get started"
        )
    }
    
    @ViewBuilder
    private var mainContentView: some View {
        VStack(spacing: 0) {
            // Progress Photo - will expand to fill available space
            progressPhotoView
                .frame(maxHeight: .infinity)
            
            // Fixed height content at bottom
            VStack(spacing: 16) {
                // Timeline Slider with visual polish - full width
                if bodyMetrics.count > 1 {
                    VStack(spacing: 0) {
                        timelineSlider
                            .padding(.horizontal, 20) // Inner padding
                    }
                    .padding(.vertical, 12)
                    .background(Color.appCard.opacity(0.5))
                    // No horizontal padding here - full width
                }
                
                // Core Metrics Row
                coreMetricsRow
                
                // Secondary Metrics Row - Compact Cards
                secondaryMetricsRow
                
                // Bottom padding for floating tab bar
                Color.clear.frame(height: 90)
            }
        }
        .refreshable {
            await refreshData()
        }
    }
    
    @ViewBuilder
    private var progressPhotoView: some View {
        ZStack {
            // Use the new carousel with fixed aspect ratio
            ProgressPhotoCarouselView(
                currentMetric: currentMetric,
                historicalMetrics: bodyMetrics,
                selectedMetricsIndex: $selectedIndex
            )
            
            // Camera button overlay - always present but changes based on photo existence
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    
                    Button(action: {
                        showPhotoOptions = true
                    }) {
                        if currentMetric?.photoUrl == nil || currentMetric?.photoUrl?.isEmpty == true {
                            // Full button when no photo
                            HStack {
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 14, weight: .medium))
                                Text("Add Photo")
                                    .font(.system(size: 14, weight: .medium))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(
                                Capsule()
                                    .fill(Color.appPrimary)
                            )
                        } else {
                            // Subtle camera icon when photo exists
                            Image(systemName: "camera.fill")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))
                                .padding(10)
                                .background(
                                    Circle()
                                        .fill(Color.black.opacity(0.5))
                                        .background(.ultraThinMaterial)
                                )
                        }
                    }
                    .padding(.trailing, 16)
                    .padding(.bottom, 16)
                }
            }
        }
    }
    
    @ViewBuilder
    private var coreMetricsRow: some View {
        HStack(spacing: 16) {  // Consistent spacing
            // Body Fat % with simplified progress bar
            let estimatedBF = currentMetric?.bodyFatPercentage == nil && selectedIndex < bodyMetrics.count
                ? PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)
                : nil
            
            let bodyFatValue = currentMetric?.bodyFatPercentage ?? estimatedBF?.value
            let bodyFatTrend = calculateBodyFatTrend()
            
            VStack(spacing: 0) {
                if let bodyFatValue = bodyFatValue {
                    SimplifiedProgressBar(
                        value: bodyFatValue,
                        idealValue: getIdealBodyFat(),
                        label: "Body Fat",
                        unit: "%",
                        isFFMI: false,
                        trend: bodyFatTrend
                    )
                } else {
                    EmptyMetricPlaceholder(label: "Body Fat", unit: "%")
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 100) // Fixed height - reduced from 120
            .background(Color.appCard)
            .cornerRadius(12)
            
            // FFMI with simplified progress bar
            let ffmiValue = calculateFFMI()
            let ffmiTrend = calculateFFMITrend()
            
            VStack(spacing: 0) {
                if let ffmi = ffmiValue {
                    SimplifiedProgressBar(
                        value: ffmi,
                        idealValue: getIdealFFMI(),
                        label: "FFMI",
                        unit: "",
                        isFFMI: true,
                        trend: ffmiTrend
                    )
                } else {
                    EmptyMetricPlaceholder(label: "FFMI", unit: "")
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 100) // Fixed height - reduced from 120
            .background(Color.appCard)
            .cornerRadius(12)
        }
        .padding(.horizontal, 16)  // 16pt side insets
    }
    
    @ViewBuilder
    private var secondaryMetricsRow: some View {
        HStack(spacing: 12) {
            // Steps Card
            let stepsTrend = calculateStepsTrend()
            CompactMetricCard(
                icon: "figure.walk",
                value: selectedDateMetrics?.steps.map { formatStepCount($0) } ?? "––",
                label: "Steps",
                trend: stepsTrend,
                trendType: .positive // More steps is good
            )
            
            // Weight Card
            let estimatedWeight = currentMetric?.weight == nil && selectedIndex < bodyMetrics.count
                ? PhotoMetadataService.shared.estimateWeight(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)
                : nil
            let weightValue = currentMetric?.weight != nil ?
                convertWeight(currentMetric!.weight!, from: "kg", to: currentSystem.weightUnit) :
                (estimatedWeight != nil ? convertWeight(estimatedWeight!.value, from: "kg", to: currentSystem.weightUnit) : nil)
            
            let weightTrend = calculateWeightTrend()
            let weightTrendConverted = weightTrend != nil ? convertWeight(weightTrend!, from: "kg", to: currentSystem.weightUnit) : nil
            
            CompactMetricCard(
                icon: "scalemass",
                value: weightValue != nil ? "\(Int(weightValue!))" : "––",
                label: currentSystem.weightUnit,
                trend: weightTrendConverted,
                trendType: .neutral // Weight can go either way
            )
            
            // Lean Mass Card
            let leanMass = calculateLeanMass() != nil ?
                convertWeight(calculateLeanMass()!, from: "kg", to: currentSystem.weightUnit) : nil
            
            let leanMassTrend = calculateLeanMassTrend()
            let leanMassTrendConverted = leanMassTrend != nil ? convertWeight(leanMassTrend!, from: "kg", to: currentSystem.weightUnit) : nil
            
            CompactMetricCard(
                icon: "figure.arms.open",
                value: leanMass != nil ? "\(Int(leanMass!))" : "––",
                label: "Lean Mass",
                trend: leanMassTrendConverted,
                trendType: .positive // More lean mass is good
            )
        }
        .padding(.horizontal, 16)
    }
    
    
    
    @ViewBuilder
    private var headerView: some View {
        HeaderBar(showLiquidGlass: false) {
            // User info in two lines
            VStack(alignment: .leading, spacing: 2) {
                if let name = authManager.currentUser?.profile?.fullName?.split(separator: " ").first {
                    Text(String(name))
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.appText)
                }
                
                HStack(spacing: 8) {
                    if let age = userAge {
                        Label("\(age)", systemImage: "person")
                            .font(.system(size: 14))
                            .foregroundColor(.appTextSecondary)
                    }
                    
                    if let gender = authManager.currentUser?.profile?.gender {
                        Text(gender.lowercased() == "male" ? "♂" : "♀")
                            .font(.system(size: 14))
                            .foregroundColor(.appTextSecondary)
                    }
                    
                    if let height = authManager.currentUser?.profile?.height, height > 0 {
                        let displayHeight = currentSystem == .imperial ? 
                            formatHeightToFeetInches(height) : "\(Int(height * 2.54))cm"
                        Label(displayHeight, systemImage: "ruler")
                            .font(.system(size: 14))
                            .foregroundColor(.appTextSecondary)
                    }
                }
            }
        } trailing: {
            // Sync status
            if syncManager.isSyncing {
                Image(systemName: "arrow.triangle.2.circlepath")
                    .font(.system(size: 16))
                    .foregroundColor(.appPrimary)
                    .rotationEffect(.degrees(syncManager.isSyncing ? 360 : 0))
                    .animation(Animation.linear(duration: 1).repeatForever(autoreverses: false), value: syncManager.isSyncing)
            }
        }
    }
    
    private var userInfoString: String {
        var components: [String] = []
        
        if let name = authManager.currentUser?.profile?.fullName?.split(separator: " ").first {
            components.append(String(name))
        }
        
        if let age = userAge {
            components.append("\(age)")
        }
        
        if let gender = authManager.currentUser?.profile?.gender {
            components.append(gender.lowercased() == "male" ? "♂" : "♀")
        }
        
        if let height = authManager.currentUser?.profile?.height {
            let heightDisplay = currentSystem == .imperial ? 
                "\(Int(height / 12))′\(Int(height.truncatingRemainder(dividingBy: 12)))″" : 
                "\(Int(height * 2.54))cm"
            components.append(heightDisplay)
        }
        
        return components.joined(separator: " · ")
    }
    
    private var hasEstimatedData: Bool {
        let hasEstimatedWeight = currentMetric?.weight == nil && selectedIndex < bodyMetrics.count &&
            PhotoMetadataService.shared.estimateWeight(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics) != nil
        
        let hasEstimatedBF = currentMetric?.bodyFatPercentage == nil && selectedIndex < bodyMetrics.count &&
            PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics) != nil
        
        return hasEstimatedWeight || hasEstimatedBF
    }
    
    private func relativeDateLabel(for date: Date) -> String {
        let calendar = Calendar.current
        let now = Date()
        
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            let daysDifference = calendar.dateComponents([.day], from: date, to: now).day ?? 0
            if daysDifference <= 3 && daysDifference >= 0 {
                // Within 3 days, show relative
                return "\(daysDifference) days ago"
            } else {
                // Beyond 3 days, show actual date
                let formatter = DateFormatter()
                formatter.dateFormat = "MMM d"
                return formatter.string(from: date)
            }
        }
    }
    
    @ViewBuilder
    private var timelineSlider: some View {
        VStack(spacing: 12) {
            // Date above slider
            if let date = currentMetric?.date {
                Text(formatDateShort(date))
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .animation(.easeOut(duration: 0.2), value: selectedIndex)
            }
            
            // Liquid Glass Timeline Slider
            LiquidGlassTimelineSlider(
                selectedIndex: $selectedIndex,
                metrics: bodyMetrics,
                ticks: calculateSmartTicks(),
                onChange: { newIndex in
                    selectedIndex = newIndex
                    loadMetricsForSelectedDate()
                },
                onJumpToNext: jumpToNextPhoto,
                onJumpToPrevious: jumpToPreviousPhoto
            )
            
            // End labels
            HStack {
                if let firstDate = bodyMetrics.first?.date {
                    Text(formatDateShort(firstDate))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                
                Spacer()
                
                Button(action: {
                    // Jump to most recent entry (last index)
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        selectedIndex = bodyMetrics.count - 1
                        loadMetricsForSelectedDate()
                        HapticManager.shared.selection()
                    }
                }) {
                    Text("Today")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                }
            }
        }
    }
    
    @ViewBuilder
    private var contentView: some View {
        // Always show skeleton on first load to prevent layout shift
        if bodyMetrics.isEmpty && !hasLoadedInitialData {
            loadingView
        } else if bodyMetrics.isEmpty {
            emptyStateView
        } else {
            mainContentView
                .modifier(SmartBlurModifier(isPresented: showPhotoOptions || showCamera || showPhotoPicker || showingModal, radius: 8))
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    headerView
                    
                    contentView
                }
            }
            .navigationBarHidden(true)
            .id(refreshID)
            .onChange(of: showPhotoOptions) { _, newValue in
                showingModal = newValue
            }
            .onChange(of: showCamera) { _, newValue in
                showingModal = newValue
            }
            .onChange(of: showPhotoPicker) { _, newValue in
                showingModal = newValue
            }
            .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
                refreshID = UUID()
            }
            .onAppear {
                // Log the current authentication state
                print("🎯 DashboardView onAppear")
                print("   - isAuthenticated: \(authManager.isAuthenticated)")
                print("   - currentUser: \(authManager.currentUser?.id ?? "nil") (\(authManager.currentUser?.email ?? "nil"))")
                print("   - clerkSession: \(authManager.clerkSession?.id ?? "nil")")
                
                // Load cached data immediately for instant UI
                if authManager.currentUser?.id != nil {
                    loadCachedDataImmediately()
                    loadDailyMetrics()
                    
                    // Then sync remote data in background
                    Task {
                        // Sync today's steps from HealthKit if authorized
                        if await healthKitManager.isAuthorized {
                            await syncStepsFromHealthKit()
                            
                            // On first launch, sync historical step data
                            if !UserDefaults.standard.bool(forKey: "HasSyncedHistoricalSteps") {
                                await syncHistoricalSteps()
                            }
                        }
                        
                        await loadBodyMetrics()
                    }
                } else {
                        print("⚠️ Skipping data load - no authenticated user")
                    }
                }
            }
            .onReceive(healthKitManager.$todayStepCount) { newStepCount in
                // Update UI when step count changes
                Task {
                    await updateStepCount(newStepCount)
                }
            }
            .sheet(isPresented: $showPhotoOptions) {
                PhotoOptionsSheet(
                    showCamera: $showCamera,
                    showPhotoPicker: $showPhotoPicker,
                    isPresented: $showPhotoOptions
                )
            }
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    Task {
                        await handlePhotoCapture(image)
                    }
                }
            }
            .photosPicker(
                isPresented: $showPhotoPicker,
                selection: $selectedPhoto,
                matching: .images
            )
            .onChange(of: selectedPhoto) { _, newItem in
                Task {
                    await handlePhotoSelection(newItem)
                }
            }
            .onChange(of: authManager.currentUser?.id) { _, newUserId in
                print("👤 User ID changed: \(authManager.currentUser?.id ?? "nil") -> \(newUserId ?? "nil")")
                
                // Clear existing data
                bodyMetrics = []
                dailyMetrics = nil
                selectedDateMetrics = nil
                selectedIndex = 0
                
                // Reload data for new user
                if newUserId != nil {
                    loadCachedDataImmediately()
                    loadDailyMetrics()
                    Task {
                        if healthKitManager.isAuthorized {
                            await syncStepsFromHealthKit()
                        }
                        await loadBodyMetrics()
                    }
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    // Removed showToast helper - use ToastManager.shared.show directly
    
    @MainActor
    private func loadCachedDataImmediately() {
        guard let userId = authManager.currentUser?.id else { 
            print("⚠️ loadCachedDataImmediately: No user ID available")
            hasLoadedInitialData = true
            return 
        }
        
        print("🔍 Loading cached data for user: \(userId)")
        
        do {
            let cached = CoreDataManager.shared.fetchBodyMetrics(for: userId)
            bodyMetrics = cached.compactMap { $0.toBodyMetrics() }
                .sorted { $0.date < $1.date }
            
            print("📊 Found \(bodyMetrics.count) body metrics for user \(userId)")
            
            if !bodyMetrics.isEmpty {
                selectedIndex = min(bodyMetrics.count - 1, max(0, selectedIndex))
                loadMetricsForSelectedDate()
            }
            
            hasLoadedInitialData = true
        } catch {
            print("❌ Error loading cached data: \(error)")
            bodyMetrics = []
            hasLoadedInitialData = true
        }
    }
    
    @MainActor
    private func loadDailyMetrics() {
        guard let userId = authManager.currentUser?.id else { 
            print("⚠️ loadDailyMetrics: No user ID available")
            return 
        }
        
        print("🔍 Loading daily metrics for user: \(userId)")
        
        dailyMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: Date())?.toDailyMetrics()
        // Also set selectedDateMetrics for today initially
        selectedDateMetrics = dailyMetrics
        
        print("📊 Daily metrics loaded: \(dailyMetrics?.steps ?? 0) steps")
    }
    
    @MainActor
    private func loadMetricsForSelectedDate() {
        guard let userId = authManager.currentUser?.id,
              let selectedDate = currentMetric?.date else { return }
        
        // Load daily metrics for the selected date
        selectedDateMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: selectedDate)?.toDailyMetrics()
    }
    
    private func loadBodyMetrics() async {
        isLoading = true
        defer { isLoading = false }
        
        // Sync with remote if needed
        syncManager.syncIfNeeded()
        
        // Reload from cache
        loadCachedDataImmediately()
        loadDailyMetrics()
        loadMetricsForSelectedDate()
    }
    
    private func refreshData() async {
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
    
    private func handlePhotoCapture(_ image: UIImage) async {
        guard let currentMetric = currentMetric else { 
            await MainActor.run {
                // Show error - weight data required
            }
            return 
        }
        
        await MainActor.run {
            // Photo upload in progress
        }
        
        do {
            // Use PhotoUploadManager to handle the entire upload pipeline
            let processedUrl = try await PhotoUploadManager.shared.uploadProgressPhoto(
                for: currentMetric,
                image: image
            )
            
            // Reload data to show the processed photo
            await MainActor.run {
                loadCachedDataImmediately()
                // Photo uploaded successfully
            }
            
        } catch {
            await MainActor.run {
                let errorMessage = error.localizedDescription
                print("❌ Photo upload error: \(errorMessage)")
                print("Failed to upload photo: \(errorMessage)")
            }
        }
    }
    
    private func handlePhotoSelection(_ item: PhotosPickerItem?) async {
        guard let item = item,
              let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else { return }
        
        await handlePhotoCapture(image)
    }
    
    private func convertWeight(_ weight: Double, from: String, to: String) -> Double {
        if from == to {
            return weight
        }
        
        let weightInKg = from == "lbs" ? weight * 0.453592 : weight
        return to == "lbs" ? weightInKg * 2.20462 : weightInKg
    }
    
    private func calculateFFMI() -> Double? {
        // Get weight (actual or estimated)
        let weight: Double?
        if let actualWeight = currentMetric?.weight {
            weight = actualWeight
        } else if selectedIndex < bodyMetrics.count,
                  let estimatedWeight = PhotoMetadataService.shared.estimateWeight(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics) {
            weight = estimatedWeight.value
        } else {
            weight = nil
        }
        
        // Get body fat percentage (actual or estimated)
        let bodyFatPercentage: Double?
        if let actualBF = currentMetric?.bodyFatPercentage {
            bodyFatPercentage = actualBF
        } else if selectedIndex < bodyMetrics.count,
                  let estimatedBF = PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics) {
            bodyFatPercentage = estimatedBF.value
        } else {
            bodyFatPercentage = nil
        }
        
        // Calculate FFMI if we have all required values
        guard let weight = weight,
              let bodyFatPercentage = bodyFatPercentage,
              let heightInInches = authManager.currentUser?.profile?.height else {
            return nil
        }
        
        let heightInMeters = heightInInches * 0.0254
        let leanBodyMassKg = weight * (1 - bodyFatPercentage / 100)
        let ffmi = (leanBodyMassKg / pow(heightInMeters, 2)) + 6.1 * (1.8 - heightInMeters)
        
        return round(ffmi * 10) / 10
    }
    
    private func calculateLeanMass() -> Double? {
        // Get weight (actual or estimated)
        let weight: Double?
        if let actualWeight = currentMetric?.weight {
            weight = actualWeight
        } else if selectedIndex < bodyMetrics.count,
                  let estimatedWeight = PhotoMetadataService.shared.estimateWeight(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics) {
            weight = estimatedWeight.value
        } else {
            weight = nil
        }
        
        // Get body fat percentage (actual or estimated)
        let bodyFatPercentage: Double?
        if let actualBF = currentMetric?.bodyFatPercentage {
            bodyFatPercentage = actualBF
        } else if selectedIndex < bodyMetrics.count,
                  let estimatedBF = PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics) {
            bodyFatPercentage = estimatedBF.value
        } else {
            bodyFatPercentage = nil
        }
        
        // Calculate lean mass if we have both values
        guard let weight = weight,
              let bodyFatPercentage = bodyFatPercentage else {
            return nil
        }
        
        return weight * (1 - bodyFatPercentage / 100)
    }
    
    private func formatStepCount(_ steps: Int) -> String {
        if steps >= 10000 {
            // For 10K and above, show one decimal place
            let thousands = Double(steps) / 1000.0
            return String(format: "%.1fK", thousands)
        } else if steps >= 1000 {
            // For 1K-9999, show as whole number K
            let thousands = steps / 1000
            return "\(thousands)K"
        } else {
            // Under 1000, show exact number
            return "\(steps)"
        }
    }
    
    private func formatDateShort(_ date: Date) -> String {
        let formatter = DateFormatter()
        let calendar = Calendar.current
        let currentYear = calendar.component(.year, from: Date())
        let dateYear = calendar.component(.year, from: date)
        
        // Show year if date is from a different year
        if dateYear != currentYear {
            formatter.dateFormat = "MMM d, yy"
        } else {
            formatter.dateFormat = "MMM d"
        }
        return formatter.string(from: date)
    }
    
    // MARK: - Color Calculations
    
    private func bodyFatProgressColor() -> Color {
        guard let bodyFat = currentMetric?.bodyFatPercentage else {
            return Color(.systemGray)
        }
        
        // Green to red gradient based on body fat percentage
        if bodyFat < 10 {
            return Color(.systemGreen)
        } else if bodyFat < 15 {
            return Color(.systemTeal)
        } else if bodyFat < 20 {
            return Color(.systemOrange)
        } else {
            return Color(.systemRed)
        }
    }
    
    private func ffmiProgressColor() -> Color {
        guard let ffmi = calculateFFMI() else {
            return Color(.systemGray)
        }
        
        // Blue gradient based on FFMI
        if ffmi < 18 {
            return Color(.systemBlue).opacity(0.6)
        } else if ffmi < 22 {
            return Color(.systemBlue)
        } else if ffmi < 25 {
            return Color(.systemIndigo)
        } else {
            return Color(.systemGray)
        }
    }
    
    // MARK: - Photo Management
    
    private func savePhotoToDocuments(_ image: UIImage, withId photoId: String) -> String? {
        guard let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        
        let photosDirectory = documentsDirectory.appendingPathComponent("progress_photos")
        
        // Create photos directory if it doesn't exist
        try? FileManager.default.createDirectory(at: photosDirectory, withIntermediateDirectories: true)
        
        let fileURL = photosDirectory.appendingPathComponent("\(photoId).jpg")
        
        // Compress and save image
        if let jpegData = image.jpegData(compressionQuality: 0.8) {
            do {
                try jpegData.write(to: fileURL)
                return fileURL.absoluteString
            } catch {
                print("❌ Failed to save photo: \(error)")
                return nil
            }
        }
        
        return nil
    }
    
    // MARK: - HealthKit Integration
    
    private func syncStepsFromHealthKit() async {
        // Run HealthKit operations on background to avoid blocking UI
        await Task.detached(priority: .userInitiated) {
            do {
                // Fetch today's step count
                try await self.healthKitManager.syncStepsFromHealthKit()
                
                // Get the step count
                let steps = self.healthKitManager.todayStepCount
                guard steps > 0 else { return }
                
                // Get or create today's daily metrics
                guard let userId = await self.authManager.currentUser?.id else { return }
                let today = Date()
                
                // Fetch existing daily metrics on background
                var metrics = await Task.detached {
                    CoreDataManager.shared.fetchDailyMetrics(for: userId, date: today)?.toDailyMetrics()
                }.value
                
                if metrics == nil {
                    // Create new daily metrics
                    metrics = DailyMetrics(
                        id: UUID().uuidString,
                        userId: userId,
                        date: today,
                        steps: Int(steps),
                        notes: nil,
                        createdAt: today,
                        updatedAt: today
                    )
                } else if var existingMetrics = metrics {
                    // Update existing metrics with new step count
                    metrics = DailyMetrics(
                        id: existingMetrics.id,
                        userId: existingMetrics.userId,
                        date: existingMetrics.date,
                        steps: Int(steps),
                        notes: existingMetrics.notes,
                        createdAt: existingMetrics.createdAt,
                        updatedAt: Date()
                    )
                }
                
                // Save to Core Data on background
                if let metrics = metrics {
                    await CoreDataManager.shared.saveDailyMetrics(metrics, userId: userId)
                }
                
                // Reload daily metrics on main thread
                await MainActor.run {
                    self.loadDailyMetrics()
                }
                
            } catch {
                print("❌ Failed to sync steps from HealthKit: \(error)")
            }
        }.value
    }
    
    // Sync historical step data
    private func syncHistoricalSteps() async {
        guard let userId = authManager.currentUser?.id else { return }
        
        await MainActor.run {
            // Syncing step history
        }
        
        do {
            // Sync last 30 days of step data
            try await healthKitManager.syncHistoricalSteps(userId: userId, days: 30)
            
            // Mark as synced
            UserDefaults.standard.set(true, forKey: "HasSyncedHistoricalSteps")
            
            // Reload metrics
            await MainActor.run {
                loadDailyMetrics()
                // Step history synced successfully
            }
        } catch {
            print("❌ Failed to sync historical steps: \(error)")
            await MainActor.run {
                print("Failed to sync step history")
            }
        }
    }
    
    // Update step count in real-time
    private func updateStepCount(_ newStepCount: Int) async {
        guard let userId = authManager.currentUser?.id else { return }
        
        // Update UI immediately
        await MainActor.run {
            // Check if daily metrics exists for today
            if var metrics = dailyMetrics {
                // Update steps in the existing metrics
                dailyMetrics = DailyMetrics(
                    id: metrics.id,
                    userId: metrics.userId,
                    date: metrics.date,
                    steps: newStepCount,
                    notes: metrics.notes,
                    createdAt: metrics.createdAt,
                    updatedAt: Date()
                )
            } else {
                // Create new daily metrics
                dailyMetrics = DailyMetrics(
                    id: UUID().uuidString,
                    userId: userId,
                    date: Date(),
                    steps: newStepCount,
                    notes: nil,
                    createdAt: Date(),
                    updatedAt: Date()
                )
            }
            
            // If viewing today, also update the selected date metrics
            if Calendar.current.isDateInToday(currentMetric?.date ?? Date()) {
                selectedDateMetrics = dailyMetrics
            }
        }
        
        // Save to Core Data in background
        await Task.detached(priority: .background) {
            await self.healthKitManager.syncStepsToSupabase(userId: userId)
        }.value
    }
    
    // MARK: - Helper Functions
    
    private func formatHeightToFeetInches(_ heightInInches: Double) -> String {
        let feet = Int(heightInInches / 12)
        let inches = Int(heightInInches.truncatingRemainder(dividingBy: 12))
        return "\(feet)'\(inches)\""
    }
    
    // MARK: - Optimal Range Calculations
    
    private func getOptimalBodyFatRange() -> ClosedRange<Double> {
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        
        if gender == "female" {
            return Constants.BodyComposition.BodyFat.femaleOptimalRange
        } else {
            return Constants.BodyComposition.BodyFat.maleOptimalRange
        }
    }
    
    private func getIdealBodyFat() -> Double {
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        return gender == "female" ? Constants.BodyComposition.BodyFat.femaleIdealValue : Constants.BodyComposition.BodyFat.maleIdealValue
    }
    
    private func getOptimalFFMIRange() -> ClosedRange<Double> {
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        
        if gender == "female" {
            return Constants.BodyComposition.FFMI.femaleOptimalRange
        } else {
            return Constants.BodyComposition.FFMI.maleOptimalRange
        }
    }
    
    private func getIdealFFMI() -> Double {
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        return gender == "female" ? Constants.BodyComposition.FFMI.femaleIdealValue : Constants.BodyComposition.FFMI.maleIdealValue
    }
    
    // MARK: - Trend Calculations
    
    private func calculateBodyFatTrend() -> Double? {
        guard bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentBF = currentMetric?.bodyFatPercentage else { return nil }
        
        // Find previous metric with body fat data
        for i in stride(from: selectedIndex - 1, through: 0, by: -1) {
            if let previousBF = bodyMetrics[i].bodyFatPercentage {
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentMetric!.date).day ?? 1
                
                // Calculate change per week (7 days)
                let change = currentBF - previousBF
                let changePerWeek = (change / Double(max(daysDiff, 1))) * 7
                
                // Only show trend if change is meaningful (> 0.1% per week)
                return abs(changePerWeek) > 0.1 ? changePerWeek : nil
            }
        }
        
        return nil
    }
    
    private func calculateFFMITrend() -> Double? {
        guard bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentFFMI = calculateFFMI(),
              let currentDate = currentMetric?.date else { return nil }
        
        // Store the current selectedIndex temporarily
        let currentIndex = selectedIndex
        
        // Find previous metric with enough data to calculate FFMI
        for i in stride(from: currentIndex - 1, through: 0, by: -1) {
            // Temporarily set selectedIndex to calculate FFMI for previous date
            selectedIndex = i
            
            if let previousFFMI = calculateFFMI() {
                // Restore selectedIndex
                selectedIndex = currentIndex
                
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentDate).day ?? 1
                
                // Calculate change per month (30 days)
                let change = currentFFMI - previousFFMI
                let changePerMonth = (change / Double(max(daysDiff, 1))) * 30
                
                // Only show trend if change is meaningful (> 0.1 per month)
                return abs(changePerMonth) > 0.1 ? changePerMonth : nil
            }
        }
        
        // Restore selectedIndex
        selectedIndex = currentIndex
        return nil
    }
    
    private func calculateWeightTrend() -> Double? {
        guard bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentWeight = currentMetric?.weight else { return nil }
        
        // Find previous metric with weight data
        for i in stride(from: selectedIndex - 1, through: 0, by: -1) {
            if let previousWeight = bodyMetrics[i].weight {
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentMetric!.date).day ?? 1
                
                // Calculate change per week (7 days)
                let change = currentWeight - previousWeight
                let changePerWeek = (change / Double(max(daysDiff, 1))) * 7
                
                // Only show trend if change is meaningful (> 0.2 kg per week)
                return abs(changePerWeek) > 0.2 ? changePerWeek : nil
            }
        }
        
        return nil
    }
    
    private func calculateStepsTrend() -> Double? {
        guard let currentSteps = selectedDateMetrics?.steps,
              selectedIndex > 0 else { return nil }
        
        // Find previous day's steps
        let previousDate = Calendar.current.date(byAdding: .day, value: -1, to: currentMetric?.date ?? Date()) ?? Date()
        if let previousMetrics = CoreDataManager.shared.fetchDailyMetrics(
            for: authManager.currentUser?.id ?? "", 
            date: previousDate
        )?.toDailyMetrics(),
           let previousSteps = previousMetrics.steps {
            
            let change = Double(currentSteps - previousSteps)
            // Only show trend if change is meaningful (> 500 steps)
            return abs(change) > 500 ? change : nil
        }
        
        return nil
    }
    
    private func calculateLeanMassTrend() -> Double? {
        guard let currentLeanMass = calculateLeanMass(),
              bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentDate = currentMetric?.date else { return nil }
        
        // Store the current selectedIndex temporarily
        let currentIndex = selectedIndex
        
        // Find previous metric with enough data
        for i in stride(from: currentIndex - 1, through: 0, by: -1) {
            // Temporarily set selectedIndex to calculate lean mass for previous date
            selectedIndex = i
            
            if let previousLeanMass = calculateLeanMass() {
                // Restore selectedIndex
                selectedIndex = currentIndex
                
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentDate).day ?? 1
                
                // Calculate change per month (30 days)
                let change = currentLeanMass - previousLeanMass
                let changePerMonth = (change / Double(max(daysDiff, 1))) * 30
                
                // Only show trend if change is meaningful (> 0.2 kg per month)
                return abs(changePerMonth) > 0.2 ? changePerMonth : nil
            }
        }
        
        // Restore selectedIndex
        selectedIndex = currentIndex
        return nil
    }

struct EmptyMetricCard: View {
    let label: String
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Color.appBorder, lineWidth: 8)
                    .frame(width: 120, height: 120)
                
                Text("--")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.appTextTertiary)
            }
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.appTextSecondary)
        }
        .frame(maxWidth: CGFloat.infinity)
        .frame(height: 140)
        .background(Color.appCard)
        .cornerRadius(12)
    }
}

struct MetricStripItem: View {
    let icon: String
    let value: String
    let label: String
    let iconColor: Color
    var isEstimated: Bool = false
    
    var body: some View {
        VStack(spacing: 4) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(iconColor)
                
                // Estimated indicator
                if isEstimated {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 8))
                        .foregroundColor(.orange)
                        .offset(x: 8, y: -4)
                }
            }
            
            Text(value)
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundColor(.appText)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.appTextSecondary)
                .lineLimit(1)
        }
        .frame(maxWidth: CGFloat.infinity)
        .padding(.vertical, 16)
    }
}

struct PhotoOptionsSheet: View {
    @Binding var showCamera: Bool
    @Binding var showPhotoPicker: Bool
    @Binding var isPresented: Bool
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        VStack(spacing: 0) {
            // Handle
            Capsule()
                .fill(Color.appTextTertiary.opacity(0.3))
                .frame(width: 36, height: 5)
                .padding(.top, 8)
                .padding(.bottom, 16)
            
            // Title with icon
            VStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.appPrimary.opacity(0.1))
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: "camera.aperture")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.appPrimary)
                }
                
                Text("Add Progress Photo")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.appText)
                
                Text("Capture your transformation")
                    .font(.system(size: 14))
                    .foregroundColor(.appTextSecondary)
            }
            .padding(.bottom, 24)
            
            // Options
            VStack(spacing: 0) {
                // Take Photo Option
                Button(action: {
                    isPresented = false
                    Task {
                        try? await Task.sleep(nanoseconds: 300_000_000)
                        await MainActor.run {
                            showCamera = true
                        }
                    }
                }) {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color(.systemBlue).opacity(0.1))
                                .frame(width: 44, height: 44)
                            
                            Image(systemName: "camera.fill")
                                .font(.system(size: 20))
                                .foregroundColor(Color(.systemBlue))
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Take Photo")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.appText)
                            
                            Text("Use camera for best results")
                                .font(.system(size: 13))
                                .foregroundColor(.appTextSecondary)
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.appTextTertiary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                }
                .buttonStyle(PlainButtonStyle())
                
                Divider()
                    .background(Color.appBorder)
                    .padding(.horizontal, 20)
                
                // Choose from Library Option
                Button(action: {
                    isPresented = false
                    Task {
                        try? await Task.sleep(nanoseconds: 300_000_000)
                        await MainActor.run {
                            showPhotoPicker = true
                        }
                    }
                }) {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color(.systemGreen).opacity(0.1))
                                .frame(width: 44, height: 44)
                            
                            Image(systemName: "photo.fill")
                                .font(.system(size: 20))
                                .foregroundColor(Color(.systemGreen))
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Choose from Library")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.appText)
                            
                            Text("Select from existing photos")
                                .font(.system(size: 13))
                                .foregroundColor(.appTextSecondary)
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.appTextTertiary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .background(Color.appCard)
            .cornerRadius(16)
            .padding(.horizontal, 16)
            
            // Cancel Button
            Button(action: {
                isPresented = false
            }) {
                Text("Cancel")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.appTextSecondary)
                    .frame(maxWidth: CGFloat.infinity)
                    .frame(height: 50)
            }
            .padding(.top, 16)
            .padding(.horizontal, 16)
            
            Spacer()
        }
        .frame(maxHeight: 420)
        .background(Color.appBackground)
        .cornerRadius(24, corners: [.topLeft, .topRight])
        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: -5)
    }
}

// Helper extension for custom corner radius
extension View {
    func dashboardCornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(DashboardRoundedCorner(radius: radius, corners: corners))
    }
}

struct DashboardRoundedCorner: Shape {
    var radius: CGFloat = CGFloat.infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

// MARK: - Simplified Progress Bar

struct SimplifiedProgressBar: View {
    let value: Double
    let idealValue: Double
    let label: String
    let unit: String
    var isFFMI: Bool = false
    let trend: Double? // positive for up, negative for down
    
    @State private var animatedValue: Double = 0
    
    private var minValue: Double {
        isFFMI ? 15 : 0
    }
    
    private var maxValue: Double {
        isFFMI ? 30 : 25
    }
    
    private var targetZone: ClosedRange<Double> {
        if isFFMI {
            return 21...24
        } else {
            return 6...10
        }
    }
    
    private var normalizedValue: Double {
        let normalized = (animatedValue - minValue) / (maxValue - minValue)
        return max(0, min(1, normalized))
    }
    
    private var isInTargetZone: Bool {
        targetZone.contains(value)
    }
    
    private var trendIcon: String? {
        guard let trend = trend else { return nil }
        if abs(trend) < 0.1 { return nil } // Too small to show
        return trend > 0 ? "arrow.up.circle.fill" : "arrow.down.circle.fill"
    }
    
    private var trendColor: Color {
        guard let trend = trend else { return .clear }
        if isFFMI {
            // For FFMI, up is generally good unless already high
            return value > 24 ? (trend > 0 ? .orange.opacity(0.8) : .green.opacity(0.8)) : (trend > 0 ? .green.opacity(0.8) : .orange.opacity(0.8))
        } else {
            // For body fat, down is generally good unless already low
            return value < 6 ? (trend < 0 ? .orange.opacity(0.8) : .green.opacity(0.8)) : (trend < 0 ? .green.opacity(0.8) : .orange.opacity(0.8))
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Value and trend
            HStack(alignment: .bottom, spacing: 6) {
                Text(String(format: "%.1f", value))
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundColor(.appText)
                
                if !unit.isEmpty {
                    Text(unit)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.appTextSecondary)
                        .padding(.bottom, 6)
                }
                
                Spacer()
                
                if let icon = trendIcon {
                    Image(systemName: icon)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(trendColor)
                }
            }
            .padding(.top, 12)
            .padding(.horizontal, 16)
            
            // Label
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.appTextSecondary)
                .padding(.horizontal, 16)
                .padding(.bottom, 6)
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background track
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 4)
                    
                    // Target zone indicator
                    let targetStart = (targetZone.lowerBound - minValue) / (maxValue - minValue)
                    let targetEnd = (targetZone.upperBound - minValue) / (maxValue - minValue)
                    let targetWidth = (targetEnd - targetStart) * geometry.size.width
                    
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.appPrimary.opacity(0.2))
                        .frame(width: targetWidth, height: 4)
                        .offset(x: targetStart * geometry.size.width)
                    
                    // Progress fill
                    RoundedRectangle(cornerRadius: 2)
                        .fill(isInTargetZone ? Color.appPrimary.opacity(0.8) : Color.white.opacity(0.6))
                        .frame(width: max(4, normalizedValue * geometry.size.width), height: 4)
                        .animation(.spring(response: 0.6, dampingFraction: 0.8), value: normalizedValue)
                }
            }
            .frame(height: 4)
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
        }
        .onAppear {
            animatedValue = value
        }
        .onChange(of: value) { _, newValue in
            animatedValue = newValue
        }
    }
}

// MARK: - Empty Metric Placeholder

struct EmptyMetricPlaceholder: View {
    let label: String
    let unit: String
    
    var body: some View {
        VStack(spacing: 0) {
            // Value placeholder
            HStack(alignment: .bottom, spacing: 6) {
                Text("––")
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.2))
                
                if !unit.isEmpty {
                    Text(unit)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.white.opacity(0.15))
                        .padding(.bottom, 6)
                }
                
                Spacer()
            }
            .padding(.top, 12)
            .padding(.horizontal, 16)
            
            // Label
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.3))
                .padding(.horizontal, 16)
                .padding(.bottom, 6)
            
            // Empty progress bar
            RoundedRectangle(cornerRadius: 2)
                .fill(Color.white.opacity(0.1))
                .frame(height: 4)
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
        }
    }
}

// MARK: - Standardized Progress Ring (Deprecated - keeping for reference)

struct StandardizedProgressRing: View {
    let value: Double
    let idealValue: Double
    let label: String
    let unit: String
    var isFFMI: Bool = false
    
    @State private var animatedValue: Double = 0
    @State private var previousValue: Double = 0
    
    private let size: CGFloat = 86  // Further reduced by 15%
    private let lineWidth: CGFloat = 6  // Thinner for smaller size
    
    // Define zones based on ideal value
    private var underZone: ClosedRange<Double> {
        if isFFMI {
            return 15...21
        } else {
            return 0...6
        }
    }
    
    private var targetZone: ClosedRange<Double> {
        if isFFMI {
            return 21...24
        } else {
            return 6...10
        }
    }
    
    private var overZone: ClosedRange<Double> {
        if isFFMI {
            return 24...30
        } else {
            return 10...25
        }
    }
    
    private var minValue: Double {
        isFFMI ? 15 : 0
    }
    
    private var maxValue: Double {
        isFFMI ? 30 : 25
    }
    
    // Calculate normalized position
    private func normalizedPosition(for value: Double) -> Double {
        (value - minValue) / (maxValue - minValue)
    }
    
    // Convert value to angle (0 = top)
    private func angle(for value: Double) -> Angle {
        let normalized = normalizedPosition(for: value)
        return .degrees(normalized * 360 - 90)
    }
    
    // Get color based on zone - premium feel with subtle accents
    private func zoneColor(for value: Double) -> Color {
        if targetZone.contains(value) {
            // Target zone: subtle purple accent at 30% opacity
            return Color.appPrimary.opacity(0.3)
        } else if value < targetZone.lowerBound {
            // Under zone: slightly darker gray
            return Color(white: 0.25)
        } else {
            // Over zone: desaturated warning
            return Color(white: 0.35)
        }
    }
    
    var body: some View {
        VStack(spacing: 4) {  // Reduced spacing
            ZStack {
                // Background zones
                backgroundZones
                
                // Progress fill
                progressFill
                
                // Ideal value tick
                idealTick
                
                // Center content
                centerContent
            }
            .frame(width: size, height: size)
            
            Text(label)
                .font(.system(size: 11))  // Reduced from 12
                .foregroundColor(.appTextSecondary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.8)) {
                animatedValue = value
            }
        }
        .onChange(of: value) { _, newValue in
            withAnimation(.spring(response: 0.8, dampingFraction: 0.8)) {
                animatedValue = newValue
            }
            
            // Haptic feedback when crossing zones
            let isInTargetZone = targetZone.contains(newValue)
            let wasInTargetZone = targetZone.contains(previousValue)
            if isInTargetZone != wasInTargetZone {
                if isInTargetZone {
                    HapticManager.shared.ringThresholdCrossed(entering: true)
                } else {
                    HapticManager.shared.ringThresholdCrossed(entering: false)
                }
            }
            previousValue = newValue
        }
    }
    
    @ViewBuilder
    private var backgroundZones: some View {
        ZStack {
            // Base: light gray track
            Circle()
                .stroke(Color(white: 0.2), lineWidth: lineWidth)
            
            // Target zone: subtle purple accent at 30% opacity
            Arc(
                startAngle: angle(for: targetZone.lowerBound),
                endAngle: angle(for: targetZone.upperBound),
                clockwise: true
            )
            .stroke(Color.appPrimary.opacity(0.15), style: StrokeStyle(lineWidth: lineWidth, lineCap: .butt))
        }
    }
    
    @ViewBuilder
    private var progressFill: some View {
        Arc(
            startAngle: angle(for: minValue),
            endAngle: angle(for: min(max(minValue, animatedValue), maxValue)),
            clockwise: true
        )
        .stroke(
            zoneColor(for: animatedValue),
            style: StrokeStyle(
                lineWidth: lineWidth,
                lineCap: .round
            )
        )
    }
    
    @ViewBuilder
    private var idealTick: some View {
        let idealAngle = angle(for: idealValue)
        let radius = size / 2
        
        Path { path in
            let innerRadius = radius - lineWidth - 2
            let outerRadius = radius + 2
            
            let innerPoint = CGPoint(
                x: radius + innerRadius * cos(idealAngle.radians),
                y: radius + innerRadius * sin(idealAngle.radians)
            )
            let outerPoint = CGPoint(
                x: radius + outerRadius * cos(idealAngle.radians),
                y: radius + outerRadius * sin(idealAngle.radians)
            )
            
            path.move(to: innerPoint)
            path.addLine(to: outerPoint)
        }
        .stroke(Color.white, lineWidth: 2)
        .shadow(color: Color.black.opacity(0.3), radius: 1, x: 0, y: 1)
    }
    
    @ViewBuilder
    private var centerContent: some View {
        VStack(spacing: -2) {
            Text("\(value, specifier: "%.1f")")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(.appText)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            
            if !unit.isEmpty {
                Text(unit)
                    .font(.system(size: 12))
                    .foregroundColor(.appTextSecondary)
            }
        }
    }
}

// Custom Arc shape
struct Arc: Shape {
    var startAngle: Angle
    var endAngle: Angle
    var clockwise: Bool
    
    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.width / 2, y: rect.height / 2)
        let radius = min(rect.width, rect.height) / 2
        
        var path = Path()
        path.addArc(
            center: center,
            radius: radius,
            startAngle: startAngle,
            endAngle: endAngle,
            clockwise: clockwise
        )
        
        return path
    }
}

// MARK: - Minimal Design Components

struct MinimalMetricGauge: View {
    let value: Double
    let label: String
    let unit: String
    
    var accessibilityValue: String {
        let labelText = label == "Body-Fat" ? "Body fat" : label
        if unit == "%" {
            return "\(labelText), \(String(format: "%.1f", value)) percent"
        } else {
            return "\(labelText), \(String(format: "%.1f", value))"
        }
    }
    
    var displayValue: String {
        if unit == "%" {
            return String(format: "%.1f", value)
        } else {
            return String(format: "%.1f", value)
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Minimal gauge - 3pt ring
            ZStack {
                // Background ring - grey
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 3)
                    .frame(width: 80, height: 80)
                
                // Value ring - white fill
                Circle()
                    .trim(from: 0, to: min(value / 100, 1.0))
                    .stroke(Color.white, lineWidth: 3)
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(-90))
                    .accessibilityHidden(true) // Hide decorative ring
                
                // Integrated label
                VStack(spacing: 0) {
                    Text(displayValue)
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(unit == "%" ? "%BF" : label)
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(.white.opacity(0.7))
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityValue)
        .accessibilityHint("Double tap to view details")
    }
}

struct MinimalEmptyMetric: View {
    let label: String
    
    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    .frame(width: 100, height: 100)
                
                VStack(spacing: 2) {
                    Text("––")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white.opacity(0.3))
                    
                    Text(label)
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(.white.opacity(0.3))
                }
            }
        }
    }
}

// MARK: - Compact Metric Card

struct CompactMetricCard: View {
    let icon: String
    let value: String
    let label: String
    var trend: Double? = nil
    var trendType: TrendType = .neutral
    
    enum TrendType {
        case positive  // Up is good (steps, lean mass)
        case negative  // Down is good (body fat)
        case neutral   // Context dependent (weight)
    }
    
    private var isPlaceholder: Bool {
        value == "––"
    }
    
    private var trendIcon: String? {
        guard let trend = trend, !isPlaceholder else { return nil }
        if abs(trend) < 0.1 { return nil } // Too small to show
        return trend > 0 ? "arrow.up.right" : "arrow.down.right"
    }
    
    private var trendColor: Color {
        guard let trend = trend else { return .clear }
        
        switch trendType {
        case .positive:
            return trend > 0 ? .green : .red
        case .negative:
            return trend < 0 ? .green : .red
        case .neutral:
            return .appTextSecondary
        }
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Icon
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(isPlaceholder ? .appTextTertiary : .appTextSecondary)
                .frame(height: 20)
            
            // Value with trend
            HStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(isPlaceholder ? .appTextTertiary : .appText)
                    .minimumScaleFactor(0.8)
                    .lineLimit(1)
                
                if let trendIcon = trendIcon {
                    Image(systemName: trendIcon)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(trendColor)
                }
            }
            
            // Label
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.appTextSecondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 80) // Smaller than main cards
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color.appCard)
        .cornerRadius(12)
    }
}

struct MonochromeMetricStripItem: View {
    let icon: String
    let value: String
    let label: String
    var trend: Double? = nil // positive for up, negative for down
    
    var accessibilityLabel: String {
        if value == "––" {
            return "\(label) not available"
        }
        return "\(label): \(value)"
    }
    
    private var isPlaceholder: Bool {
        value == "––"
    }
    
    private var trendIcon: String? {
        guard let trend = trend, !isPlaceholder else { return nil }
        if abs(trend) < 0.1 { return nil } // Too small to show
        return trend > 0 ? "arrow.up.circle.fill" : "arrow.down.circle.fill"
    }
    
    private var trendColor: Color {
        guard let trend = trend else { return .clear }
        // For weight/lean mass, interpret based on context
        if label.contains("Lean") {
            return trend > 0 ? .green.opacity(0.6) : .red.opacity(0.6)
        } else if label.contains("Steps") {
            return trend > 0 ? .green.opacity(0.6) : .red.opacity(0.6)
        } else {
            // For weight, neutral interpretation
            return .white.opacity(0.4)
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Top padding to align with metric cards
            Spacer()
                .frame(height: 12)
            
            // Icon with consistent styling
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 36, height: 36)
                
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .regular, design: .rounded))
                    .foregroundColor(isPlaceholder ? .white.opacity(0.3) : .white.opacity(0.7))
            }
            
            Spacer()
                .frame(height: 8)
            
            // Value with trend indicator
            HStack(spacing: 3) {
                Text(value)
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundColor(isPlaceholder ? .white.opacity(0.3) : .white.opacity(0.9))
                    .monospacedDigit()
                
                if let trendIcon = trendIcon {
                    Image(systemName: trendIcon)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(trendColor)
                }
            }
            .frame(height: 22) // Fixed height for value row
            
            Spacer()
                .frame(height: 4)
            
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(isPlaceholder ? .white.opacity(0.4) : .white.opacity(0.7))
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            
            // Bottom padding
            Spacer()
                .frame(height: 12)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 88) // Matches card height
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityLabel)
    }
}

// Temporary CameraView definition until the file is properly added to Xcode project
struct CameraView: UIViewControllerRepresentable {
    @Environment(\.dismiss) var dismiss
    let onImageCaptured: (UIImage) -> Void
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .camera
        picker.cameraCaptureMode = .photo
        picker.cameraDevice = .front
        picker.allowsEditing = false
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImageCaptured(image)
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}


// MARK: - Smart Timeline Data Structures

struct TimelineTick {
    let date: Date
    let index: Int
    let label: String
    let isMinor: Bool
    let hasPhoto: Bool
    let photoUrl: String?
    let isPhotoAnchor: Bool // True if this is a primary photo checkpoint
}
}

// MARK: - Smart Timeline Helper Functions

extension DashboardView {
    // Calculate photo-anchored timeline ticks with visual checkpoints
    private func calculateSmartTicks() -> [TimelineTick] {
        guard !bodyMetrics.isEmpty else { return [] }
        
        var ticks: [TimelineTick] = []
        let calendar = Calendar.current
        let now = Date()
        
        // Get metrics with photos for primary anchors
        let metricsWithPhotos = bodyMetrics.enumerated().compactMap { (index, metric) -> (Int, BodyMetrics)? in
            metric.photoUrl != nil ? (index, metric) : nil
        }
        
        // Target number of ticks for optimal UX
        let targetTickCount = 40
        let photoTickCount = min(metricsWithPhotos.count, 20) // Max 20 photo anchors
        
        // Always include photo anchors as primary ticks
        var photoAnchors = Set<Int>()
        if !metricsWithPhotos.isEmpty {
            // If we have many photos, sample them evenly
            let photoStep = max(1, metricsWithPhotos.count / photoTickCount)
            for i in stride(from: 0, to: metricsWithPhotos.count, by: photoStep) {
                let (index, metric) = metricsWithPhotos[i]
                photoAnchors.insert(index)
                let label = formatTickLabel(date: metric.date, daysSinceNow: calendar.dateComponents([.day], from: metric.date, to: now).day ?? 0)
                ticks.append(TimelineTick(
                    date: metric.date,
                    index: index,
                    label: label,
                    isMinor: false,
                    hasPhoto: true,
                    photoUrl: metric.photoUrl,
                    isPhotoAnchor: true
                ))
            }
            
            // Always include the most recent photo
            if let lastPhoto = metricsWithPhotos.last, !photoAnchors.contains(lastPhoto.0) {
                let (index, metric) = lastPhoto
                photoAnchors.insert(index)
                let label = formatTickLabel(date: metric.date, daysSinceNow: calendar.dateComponents([.day], from: metric.date, to: now).day ?? 0)
                ticks.append(TimelineTick(
                    date: metric.date,
                    index: index,
                    label: label,
                    isMinor: false,
                    hasPhoto: true,
                    photoUrl: metric.photoUrl,
                    isPhotoAnchor: true
                ))
            }
        }
        
        // Fill in intermediate ticks based on time periods (avoiding photo anchors)
        for (index, metric) in bodyMetrics.enumerated() {
            // Skip if this is already a photo anchor
            if photoAnchors.contains(index) { continue }
            
            let date = metric.date
            let daysSinceNow = calendar.dateComponents([.day], from: date, to: now).day ?? 0
            
            // Determine tick interval based on recency
            let shouldAddTick: Bool
            let isMinor: Bool
            
            if daysSinceNow <= 30 {
                // Last 30 days: show weekly ticks
                let weekday = calendar.component(.weekday, from: date)
                shouldAddTick = weekday == 1 || index == 0 || index == bodyMetrics.count - 1
                isMinor = weekday != 1 && index != 0 && index != bodyMetrics.count - 1
            } else if daysSinceNow <= 180 {
                // Last 6 months: show bi-weekly ticks
                let day = calendar.component(.day, from: date)
                shouldAddTick = (day == 1 || day == 15) || index == 0 || index == bodyMetrics.count - 1
                isMinor = false
            } else if daysSinceNow <= 730 {
                // Last 2 years: show monthly ticks
                let day = calendar.component(.day, from: date)
                shouldAddTick = day == 1 || index == 0 || index == bodyMetrics.count - 1
                isMinor = false
            } else {
                // Beyond 2 years: show yearly ticks
                let month = calendar.component(.month, from: date)
                let day = calendar.component(.day, from: date)
                shouldAddTick = (month == 1 && day == 1) || index == 0 || index == bodyMetrics.count - 1
                isMinor = false
            }
            
            if shouldAddTick {
                let label = formatTickLabel(date: date, daysSinceNow: daysSinceNow)
                ticks.append(TimelineTick(
                    date: date,
                    index: index,
                    label: label,
                    isMinor: isMinor,
                    hasPhoto: metric.photoUrl != nil,
                    photoUrl: metric.photoUrl,
                    isPhotoAnchor: false
                ))
            }
        }
        
        // Sort ticks by index
        ticks.sort { $0.index < $1.index }
        
        // Thin out non-photo ticks if we have too many
        if ticks.count > targetTickCount {
            let photoTicks = ticks.filter { $0.isPhotoAnchor || $0.index == 0 || $0.index == bodyMetrics.count - 1 }
            let nonPhotoTicks = ticks.filter { !$0.isPhotoAnchor && $0.index != 0 && $0.index != bodyMetrics.count - 1 }
            
            let availableSlots = targetTickCount - photoTicks.count
            if nonPhotoTicks.count > availableSlots && availableSlots > 0 {
                let keepEvery = max(1, nonPhotoTicks.count / availableSlots)
                let keptNonPhotoTicks = nonPhotoTicks.enumerated().compactMap { index, tick in
                    index % keepEvery == 0 ? tick : nil
                }
                ticks = photoTicks + keptNonPhotoTicks
                ticks.sort { $0.index < $1.index }
            }
        }
        
        return ticks
    }
    
    private func formatTickLabel(date: Date, daysSinceNow: Int) -> String {
        let formatter = DateFormatter()
        
        if daysSinceNow <= 7 {
            // Last week: show day name
            formatter.dateFormat = "EEE"
        } else if daysSinceNow <= 30 {
            // Last month: show day
            formatter.dateFormat = "d"
        } else if daysSinceNow <= 365 {
            // Last year: show month abbreviation
            formatter.dateFormat = "MMM"
        } else {
            // Beyond a year: show year
            formatter.dateFormat = "yy"
        }
        
        return formatter.string(from: date)
    }
    
    // Find the nearest tick index for a given position, prioritizing photo anchors
    private func nearestTickIndex(for position: CGFloat, in geometry: GeometryProxy, ticks: [TimelineTick]) -> Int {
        guard !ticks.isEmpty else { return selectedIndex }
        
        let progress = max(0, min(1, position / geometry.size.width))
        let targetIndex = Int(round(progress * Double(bodyMetrics.count - 1)))
        
        // Define snap threshold (15% of timeline width)
        let snapThreshold = Int(Double(bodyMetrics.count) * 0.15)
        
        // Find photo anchors within snap threshold
        let nearbyPhotoAnchors = ticks.filter { tick in
            tick.isPhotoAnchor && abs(tick.index - targetIndex) <= snapThreshold
        }
        
        // If there are nearby photo anchors, snap to the closest one
        if let photoAnchor = nearbyPhotoAnchors.min(by: { abs($0.index - targetIndex) < abs($1.index - targetIndex) }) {
            return photoAnchor.index
        }
        
        // Otherwise, find the closest tick of any type
        let nearestTick = ticks.min { tick1, tick2 in
            abs(tick1.index - targetIndex) < abs(tick2.index - targetIndex)
        }
        
        return nearestTick?.index ?? targetIndex
    }
    
    // Get metrics with photos for quick navigation
    private var photoMetrics: [BodyMetrics] {
        bodyMetrics.filter { $0.photoUrl != nil }
    }
    
    // Navigate to next photo
    private func jumpToNextPhoto() {
        let currentDate = bodyMetrics[selectedIndex].date
        
        // Find the next photo after current date
        if let nextPhoto = photoMetrics.first(where: { $0.date > currentDate }),
           let nextIndex = bodyMetrics.firstIndex(where: { $0.id == nextPhoto.id }) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                selectedIndex = nextIndex
            }
            loadMetricsForSelectedDate()
            HapticManager.shared.sliderChanged()
        }
    }
    
    // Navigate to previous photo
    private func jumpToPreviousPhoto() {
        let currentDate = bodyMetrics[selectedIndex].date
        
        // Find the previous photo before current date
        if let previousPhoto = photoMetrics.last(where: { $0.date < currentDate }),
           let previousIndex = bodyMetrics.firstIndex(where: { $0.id == previousPhoto.id }) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                selectedIndex = previousIndex
            }
            loadMetricsForSelectedDate()
            HapticManager.shared.sliderChanged()
        }
    }
}

// MARK: - Photo-Anchored Timeline Slider

struct SmartTimelineSlider: View {
    @Binding var selectedIndex: Int
    let metrics: [BodyMetrics]
    let ticks: [TimelineTick]
    let onChange: (Int) -> Void
    let onJumpToNext: () -> Void
    let onJumpToPrevious: () -> Void
    
    @State private var isDragging = false
    @State private var thumbScale: CGFloat = 1.0
    
    private var progress: Double {
        guard metrics.count > 1 else { return 0 }
        return Double(selectedIndex) / Double(metrics.count - 1)
    }
    
    private var photoMetrics: [BodyMetrics] {
        metrics.filter { $0.photoUrl != nil }
    }
    
    private var hasPhotos: Bool {
        !photoMetrics.isEmpty
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Photo navigation buttons
            if hasPhotos {
                HStack(spacing: 16) {
                    // Previous photo button
                    Button(action: onJumpToPrevious) {
                        HStack(spacing: 6) {
                            Image(systemName: "photo.fill")
                                .font(.system(size: 12, weight: .medium))
                            Image(systemName: "chevron.left")
                                .font(.system(size: 10, weight: .semibold))
                        }
                        .foregroundColor(.white.opacity(0.7))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white.opacity(0.1))
                        )
                    }
                    
                    Spacer()
                    
                    // Photo indicator
                    HStack(spacing: 4) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.appPrimary)
                        
                        Text("\(getCurrentPhotoPosition())/\(photoMetrics.count)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                    }
                    
                    Spacer()
                    
                    // Next photo button
                    Button(action: onJumpToNext) {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 10, weight: .semibold))
                            Image(systemName: "photo.fill")
                                .font(.system(size: 12, weight: .medium))
                        }
                        .foregroundColor(.white.opacity(0.7))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white.opacity(0.1))
                        )
                    }
                }
                .padding(.horizontal, 16)
            }
            
            // Timeline with photo thumbnails
            GeometryReader { geometry in
                ZStack(alignment: .top) {
                    // Track with tick marks
                    ZStack(alignment: .leading) {
                        // Main track
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.white.opacity(0.2))
                            .frame(height: 4)
                        
                        // Active track
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.white.opacity(0.8))
                            .frame(width: max(4, geometry.size.width * CGFloat(progress)), height: 4)
                            .animation(.interactiveSpring(response: 0.3, dampingFraction: 0.8), value: progress)
                    }
                    .frame(height: 20, alignment: .center)
                    
                    // Photo thumbnails only (no tick lines)
                    ForEach(ticks.filter({ $0.isPhotoAnchor }), id: \.index) { tick in
                        let tickProgress = Double(tick.index) / Double(metrics.count - 1)
                        let xPosition = geometry.size.width * CGFloat(tickProgress)
                        
                        if let photoUrl = tick.photoUrl {
                            // Photo thumbnail
                            PhotoThumbnailTick(
                                photoUrl: photoUrl,
                                isSelected: tick.index == selectedIndex
                            )
                            .position(x: xPosition, y: 12)
                        }
                    }
                    
                    // Thumb
                    Circle()
                        .fill(Color.white)
                        .frame(width: 20, height: 20)
                        .scaleEffect(thumbScale)
                        .shadow(color: Color.black.opacity(0.3), radius: 2, x: 0, y: 1)
                        .position(
                            x: geometry.size.width * CGFloat(progress),
                            y: 10
                        )
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: thumbScale)
                }
                .frame(height: 40)
                .contentShape(Rectangle())
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            if !isDragging {
                                isDragging = true
                                thumbScale = 1.2
                                HapticManager.shared.impact(style: .light)
                            }
                            
                            // Snap to nearest tick with photo priority
                            let newIndex = nearestTickIndex(for: value.location.x, in: geometry, ticks: ticks, metrics: metrics)
                            if newIndex != selectedIndex {
                                selectedIndex = newIndex
                                onChange(newIndex)
                                // Extra haptic for photo anchors
                                if ticks.first(where: { $0.index == newIndex })?.isPhotoAnchor == true {
                                    HapticManager.shared.impact(style: .medium)
                                } else {
                                    HapticManager.shared.selection()
                                }
                            }
                        }
                        .onEnded { _ in
                            isDragging = false
                            thumbScale = 1.0
                            HapticManager.shared.impact(style: .light)
                        }
                )
            }
        }
    }
    
    private func getCurrentPhotoPosition() -> Int {
        guard selectedIndex < metrics.count,
              let photoIndex = photoMetrics.firstIndex(where: { $0.id == metrics[selectedIndex].id }) else {
            return 1
        }
        return photoIndex + 1
    }
    
    private func nearestTickIndex(for position: CGFloat, in geometry: GeometryProxy, ticks: [TimelineTick], metrics: [BodyMetrics]) -> Int {
        guard !ticks.isEmpty else {
            let progress = max(0, min(1, position / geometry.size.width))
            return Int(round(progress * Double(metrics.count - 1)))
        }
        
        let progress = max(0, min(1, position / geometry.size.width))
        let targetIndex = Int(round(progress * Double(metrics.count - 1)))
        
        // Define snap threshold for photo anchors (20% of timeline width)
        let snapThreshold = Int(Double(metrics.count) * 0.2)
        
        // Find photo anchors within snap threshold
        let nearbyPhotoAnchors = ticks.filter { tick in
            tick.isPhotoAnchor && abs(tick.index - targetIndex) <= snapThreshold
        }
        
        // If there are nearby photo anchors, snap to the closest one
        if let photoAnchor = nearbyPhotoAnchors.min(by: { abs($0.index - targetIndex) < abs($1.index - targetIndex) }) {
            return photoAnchor.index
        }
        
        // Otherwise, find the closest tick of any type
        let nearestTick = ticks.min { tick1, tick2 in
            abs(tick1.index - targetIndex) < abs(tick2.index - targetIndex)
        }
        
        return nearestTick?.index ?? targetIndex
    }
}

// MARK: - Photo Thumbnail Tick

struct PhotoThumbnailTick: View {
    let photoUrl: String
    let isSelected: Bool
    @State private var image: UIImage?
    
    var body: some View {
        ZStack {
            // Thumbnail container
            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 16, height: 16)
            
            // Photo thumbnail
            if let image = image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 14, height: 14)
                    .clipShape(Circle())
            } else {
                // Loading placeholder
                Circle()
                    .fill(Color.appPrimary.opacity(0.3))
                    .frame(width: 14, height: 14)
            }
            
            // Selection indicator
            if isSelected {
                Circle()
                    .stroke(Color.appPrimary, lineWidth: 2)
                    .frame(width: 18, height: 18)
            }
        }
        .onAppear {
            loadThumbnail()
        }
    }
    
    private func loadThumbnail() {
        Task.detached(priority: .userInitiated) {
            // Load image on background thread
            guard let thumbnail = await ImageLoader.shared.loadImage(from: photoUrl) else { return }
            
            // Resize on background thread to avoid UI blocking
            let thumbnailSize = CGSize(width: 28, height: 28)
            let thumbnailImage = thumbnail.resized(to: thumbnailSize)
            
            // Update UI on main thread
            await MainActor.run {
                self.image = thumbnailImage
            }
        }
    }
}

// Helper extension for image resizing
extension UIImage {
    func resized(to size: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            draw(in: CGRect(origin: .zero, size: size))
        }
    }
}

// MARK: - iOS 26 Liquid Glass Slider

struct LiquidGlassSlider: View {
    @Binding var selectedIndex: Int
    let count: Int
    let onChange: (Int) -> Void
    
    @State private var isDragging = false
    @State private var thumbScale: CGFloat = 1.0
    @State private var glowOpacity: Double = 0
    
    private var progress: Double {
        guard count > 1 else { return 0 }
        return Double(selectedIndex) / Double(count - 1)
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Glass track background
                Group {
                    if #available(iOS 18.0, *) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color.white.opacity(0.05))
                            )
                    } else {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.white.opacity(0.1))
                            .background(
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color.black.opacity(0.2))
                            )
                    }
                }
                .frame(height: 8)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                )
                
                // Active track with gradient
                RoundedRectangle(cornerRadius: 4)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.appPrimary.opacity(0.8),
                                Color.appPrimary
                            ]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: max(4, geometry.size.width * CGFloat(progress)), height: 8)
                    .animation(.interactiveSpring(response: 0.3, dampingFraction: 0.8), value: progress)
                
                // Glass thumb with depth
                ZStack {
                    // Glow effect when dragging
                    Circle()
                        .fill(Color.appPrimary)
                        .frame(width: 40, height: 40)
                        .blur(radius: 20)
                        .opacity(glowOpacity)
                        .animation(.easeInOut(duration: 0.3), value: glowOpacity)
                    
                    // Main thumb
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Circle()
                                .fill(Color.white.opacity(0.3))
                                .frame(width: 28, height: 28)
                        )
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.5), lineWidth: 0.5)
                        )
                        .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                        .scaleEffect(thumbScale)
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: thumbScale)
                    
                    // Inner highlight
                    Circle()
                        .fill(
                            RadialGradient(
                                gradient: Gradient(colors: [
                                    Color.white.opacity(0.6),
                                    Color.clear
                                ]),
                                center: .topLeading,
                                startRadius: 2,
                                endRadius: 10
                            )
                        )
                        .frame(width: 20, height: 20)
                        .scaleEffect(thumbScale)
                }
                .offset(
                    x: geometry.size.width * CGFloat(progress) - 14,
                    y: 0
                )
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            if !isDragging {
                                isDragging = true
                                thumbScale = 1.2
                                glowOpacity = 0.5
                                HapticManager.shared.selection()
                            }
                            
                            let percent = min(max(0, value.location.x / geometry.size.width), 1)
                            let newIndex = Int(round(percent * Double(max(1, count - 1))))
                            
                            if newIndex != selectedIndex {
                                onChange(newIndex)
                            }
                        }
                        .onEnded { _ in
                            isDragging = false
                            thumbScale = 1.0
                            glowOpacity = 0
                            HapticManager.shared.impact(style: .light)
                        }
                )
            }
        }
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
