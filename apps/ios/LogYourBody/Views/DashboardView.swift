//
//  DashboardView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI
import HealthKit
import PhotosUI

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var syncManager: SyncManager
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var dailyMetrics: DailyMetrics?
    @State private var selectedDateMetrics: DailyMetrics?
    @State private var bodyMetrics: [BodyMetrics] = []
    @State private var selectedIndex: Int = 0
    @State private var isLoading = false
    @State private var showPhotoOptions = false
    @State private var showCamera = false
    @State private var showPhotoPicker = false
    @State private var selectedPhoto: PhotosPickerItem?
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
        Spacer()
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading your data...")
                .font(.appBody)
                .foregroundColor(.appTextSecondary)
        }
        Spacer()
    }
    
    @ViewBuilder
    private var emptyStateView: some View {
        Spacer()
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
        Spacer()
    }
    
    @ViewBuilder
    private var mainContentView: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Progress Photo (1:1 square)
                progressPhotoView
                    .padding(.horizontal)
                
                // Core Metrics Row
                coreMetricsRow
                    .frame(height: 120)
                    .padding(.horizontal)
                
                // Secondary Metrics Strip
                secondaryMetricsStrip
                    .frame(height: 60)
                    .background(Color.appCard)
                
                // Timeline controls (if multiple entries)
                if bodyMetrics.count > 1 {
                    timelineControls
                        .padding()
                        .background(Color.appCard)
                        .cornerRadius(12)
                        .padding(.horizontal)
                }
                
                Spacer(minLength: 20)
            }
            .padding(.top, 8)
        }
        .refreshable {
            await refreshData()
        }
    }
    
    @ViewBuilder
    private var progressPhotoView: some View {
        ZStack {
            // Use the new cutout view for photos
            ProgressPhotoCutoutView(
                currentMetric: currentMetric,
                historicalMetrics: bodyMetrics
            )
            .frame(height: UIScreen.main.bounds.width)
            .cornerRadius(16)
            .clipped()
            
            // Add photo button overlay if no photo exists
            if currentMetric?.photoUrl == nil || currentMetric?.photoUrl?.isEmpty == true {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button(action: {
                            showPhotoOptions = true
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.appPrimary)
                                    .frame(width: 56, height: 56)
                                    .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                                
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 24, weight: .medium))
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(20)
                    }
                }
            }
        }
    }
    
    @ViewBuilder
    private var coreMetricsRow: some View {
        HStack(spacing: 12) {
            // Body Fat % with segmented progress ring
            AnimatedCard(id: "bodyfat-metric", namespace: namespace) {
                if let bodyFat = currentMetric?.bodyFatPercentage {
                    SegmentedProgressRing(
                        value: bodyFat,
                        minValue: 0,
                        maxValue: 25,
                        optimalRange: getOptimalBodyFatRange(),
                        idealValue: getIdealBodyFat(),
                        size: 120,
                        lineWidth: 8,
                        label: "Body Fat",
                        unit: "%"
                    )
                    .frame(maxWidth: .infinity)
                    .frame(height: 140)
                    .background(Color.appCard)
                    .cornerRadius(12)
                } else {
                    EmptyMetricCard(label: "Body Fat %")
                }
            }
            
            // FFMI with segmented progress ring
            AnimatedCard(id: "ffmi-metric", namespace: namespace) {
                if let ffmi = calculateFFMI() {
                    SegmentedProgressRing(
                        value: ffmi,
                        minValue: 15,
                        maxValue: 30,
                        optimalRange: getOptimalFFMIRange(),
                        idealValue: getIdealFFMI(),
                        size: 120,
                        lineWidth: 8,
                        label: "FFMI",
                        unit: ""
                    )
                    .frame(maxWidth: .infinity)
                    .frame(height: 140)
                    .background(Color.appCard)
                    .cornerRadius(12)
                } else {
                    EmptyMetricCard(label: "FFMI")
                }
            }
        }
    }
    
    @ViewBuilder
    private var secondaryMetricsStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 0) {
                AnimatedCard(id: "steps-metric", namespace: namespace) {
                    SecondaryMetricItem(
                        icon: "figure.walk",
                        value: selectedDateMetrics?.steps != nil ? Double(selectedDateMetrics!.steps!) : nil,
                        unit: "steps",
                        label: "Steps",
                        showDecimal: false,
                        iconColor: Color(.systemGreen)
                    )
                }
                
                Divider()
                    .frame(height: 40)
                
                AnimatedCard(id: "weight-metric", namespace: namespace) {
                    SecondaryMetricItem(
                        icon: "scalemass",
                        value: currentMetric?.weight != nil ? 
                            convertWeight(currentMetric!.weight!, from: "kg", to: currentSystem.weightUnit) : nil,
                        unit: currentSystem.weightUnit,
                        label: "Weight",
                        iconColor: Color(.systemGray)
                    )
                }
                
                Divider()
                    .frame(height: 40)
                
                AnimatedCard(id: "lean-mass-metric", namespace: namespace) {
                    SecondaryMetricItem(
                        icon: "figure.arms.open",
                        value: calculateLeanMass() != nil ? 
                            convertWeight(calculateLeanMass()!, from: "kg", to: currentSystem.weightUnit) : nil,
                        unit: currentSystem.weightUnit,
                        label: "Lean Mass",
                        iconColor: Color(.systemBlue)
                    )
                }
            }
            .padding(.horizontal)
        }
    }
    
    @ViewBuilder
    private var timelineControls: some View {
        VStack(spacing: 8) {
            Slider(
                value: Binding(
                    get: { Double(selectedIndex) },
                    set: { newValue in
                        selectedIndex = Int(newValue)
                        loadMetricsForSelectedDate()
                    }
                ),
                in: 0...Double(max(0, bodyMetrics.count - 1)),
                step: 1
            )
            .tint(.appPrimary)
            
            HStack {
                if let date = currentMetric?.date {
                    Text(date, style: .date)
                        .font(.system(size: 12))
                        .foregroundColor(.appTextSecondary)
                }
                
                Spacer()
                
                Text("\(selectedIndex + 1) of \(bodyMetrics.count)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.appText)
                
                Spacer()
                
                if let lastDate = bodyMetrics.last?.date {
                    Text(lastDate, style: .date)
                        .font(.system(size: 12))
                        .foregroundColor(.appTextSecondary)
                }
            }
        }
    }
    
    
    @ViewBuilder
    private var headerView: some View {
        HStack {
            // User info
            HStack(spacing: 8) {
                if let name = authManager.currentUser?.profile?.fullName {
                    Text(name)
                        .font(.system(size: 14, weight: .regular, design: .default))
                        .foregroundColor(.appText)
                }
                
                if let age = userAge {
                    Text("• \(age)")
                        .font(.system(size: 14, weight: .regular, design: .default))
                        .foregroundColor(.appTextSecondary)
                }
                
                if let gender = authManager.currentUser?.profile?.gender {
                    Image(systemName: gender.lowercased() == "male" ? "person.fill" : "person.dress.line.vertical.figure")
                        .font(.system(size: 14))
                        .foregroundColor(.appTextSecondary)
                }
                
                if let height = authManager.currentUser?.profile?.height {
                    let heightDisplay = currentSystem == .imperial ? 
                        "\(Int(height / 12))'\(Int(height.truncatingRemainder(dividingBy: 12)))\"" : 
                        "\(Int(height * 2.54))cm"
                    Text("• \(heightDisplay)")
                        .font(.system(size: 14, weight: .regular, design: .default))
                        .foregroundColor(.appTextSecondary)
                }
            }
            
            Spacer()
            
            // Sync status
            if syncManager.isSyncing {
                Image(systemName: "arrow.triangle.2.circlepath")
                    .font(.system(size: 16))
                    .foregroundColor(.appPrimary)
                    .rotationEffect(.degrees(syncManager.isSyncing ? 360 : 0))
                    .animation(Animation.linear(duration: 1).repeatForever(autoreverses: false), value: syncManager.isSyncing)
                    .task {
                        // Keep the animation running smoothly
                        while syncManager.isSyncing {
                            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 second
                        }
                    }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color.appBackground)
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
                    headerView
                    
                    if isLoading && bodyMetrics.isEmpty {
                        loadingView
                    } else if bodyMetrics.isEmpty {
                        emptyStateView
                    } else {
                        mainContentView
                    }
                }
            }
            .navigationBarHidden(true)
            .onAppear {
                // Log the current authentication state
                print("🎯 DashboardView onAppear")
                print("   - isAuthenticated: \(authManager.isAuthenticated)")
                print("   - currentUser: \(authManager.currentUser?.id ?? "nil") (\(authManager.currentUser?.email ?? "nil"))")
                print("   - clerkSession: \(authManager.clerkSession?.id ?? "nil")")
                
                // Only load data if we have a valid user
                if authManager.currentUser?.id != nil {
                    loadCachedDataImmediately()
                    loadDailyMetrics()
                    Task {
                        // Sync today's steps from HealthKit if authorized
                        if healthKitManager.isAuthorized {
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
            .onChange(of: selectedPhoto) { newItem in
                Task {
                    await handlePhotoSelection(newItem)
                }
            }
            .onChange(of: authManager.currentUser?.id) { newUserId in
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
    
    private func showToast(_ message: String, type: Toast.ToastType) {
        ToastManager.shared.show(message, type: type)
    }
    
    @MainActor
    private func loadCachedDataImmediately() {
        guard let userId = authManager.currentUser?.id else { 
            print("⚠️ loadCachedDataImmediately: No user ID available")
            return 
        }
        
        print("🔍 Loading cached data for user: \(userId)")
        
        let cached = CoreDataManager.shared.fetchBodyMetrics(for: userId)
        bodyMetrics = cached.compactMap { $0.toBodyMetrics() }
            .sorted { $0.date < $1.date }
        
        print("📊 Found \(bodyMetrics.count) body metrics for user \(userId)")
        
        if !bodyMetrics.isEmpty {
            selectedIndex = bodyMetrics.count - 1
            loadMetricsForSelectedDate()
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
                showToast("Please log weight data first", type: .error)
            }
            return 
        }
        
        await MainActor.run {
            showToast("Uploading photo...", type: .info)
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
                showToast("Photo uploaded and processed successfully", type: .success)
            }
            
        } catch {
            await MainActor.run {
                let errorMessage = error.localizedDescription
                print("❌ Photo upload error: \(errorMessage)")
                self.showToast("Failed to upload photo: \(errorMessage)", type: .error)
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
            showToast("Syncing step history...", type: .info)
        }
        
        do {
            // Sync last 30 days of step data
            try await healthKitManager.syncHistoricalSteps(userId: userId, days: 30)
            
            // Mark as synced
            UserDefaults.standard.set(true, forKey: "HasSyncedHistoricalSteps")
            
            // Reload metrics
            await MainActor.run {
                loadDailyMetrics()
                showToast("Step history synced", type: .success)
            }
        } catch {
            print("❌ Failed to sync historical steps: \(error)")
            await MainActor.run {
                showToast("Failed to sync step history", type: .error)
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
    
    // MARK: - Optimal Range Calculations
    
    private func getOptimalBodyFatRange() -> ClosedRange<Double> {
        // TODO: Adjust based on gender and age
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        
        if gender == "female" {
            return 16...20  // Female optimal range
        } else {
            return 6...10   // Male optimal range
        }
    }
    
    private func getIdealBodyFat() -> Double {
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        return gender == "female" ? 18 : 8
    }
    
    private func getOptimalFFMIRange() -> ClosedRange<Double> {
        // TODO: Adjust based on gender
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        
        if gender == "female" {
            return 16...19  // Female optimal FFMI range
        } else {
            return 20...23  // Male optimal FFMI range
        }
    }
    
    private func getIdealFFMI() -> Double {
        let gender = authManager.currentUser?.profile?.gender?.lowercased() ?? "male"
        return gender == "female" ? 17.5 : 23
    }
}

// MARK: - New UI Components

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
        .frame(maxWidth: .infinity)
        .frame(height: 140)
        .background(Color.appCard)
        .cornerRadius(12)
    }
}

struct SecondaryMetricItem: View {
    let icon: String
    let value: Double?
    let unit: String
    let label: String
    var showDecimal: Bool = true
    var iconColor: Color = Color(.systemGray)
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(iconColor)
            
            HStack(spacing: 2) {
                if let value = value {
                    Text(showDecimal ? "\(value, specifier: "%.1f")" : "\(Int(value))")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.appText)
                } else {
                    Text("--")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.appTextTertiary)
                }
            }
            
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.appTextSecondary)
        }
        .frame(minWidth: 100)
        .padding(.horizontal, 16)
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
                    .frame(maxWidth: .infinity)
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
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

// MARK: - Segmented Progress Ring

struct SegmentedProgressRing: View {
    let value: Double
    let minValue: Double
    let maxValue: Double
    let optimalRange: ClosedRange<Double>
    let idealValue: Double
    let size: CGFloat
    let lineWidth: CGFloat
    let label: String
    let unit: String
    
    @State private var animatedValue: Double = 0
    @State private var showOnTarget = false
    
    // Calculate position on the ring (0-1)
    private func normalizedPosition(for value: Double) -> Double {
        (value - minValue) / (maxValue - minValue)
    }
    
    // Convert value to angle (0 = top)
    private func angle(for value: Double) -> Angle {
        let normalized = normalizedPosition(for: value)
        return .degrees(normalized * 360 - 90)
    }
    
    // Get color for a given value
    private func color(for value: Double) -> Color {
        if optimalRange.contains(value) {
            return Color(.systemGreen)
        } else {
            return Color(.systemRed).opacity(0.8)
        }
    }
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Background segments
                backgroundSegments
                
                // Progress fill
                progressFill
                
                // Ideal value tick mark
                idealTick
                
                // Center content
                centerContent
            }
            .frame(width: size, height: size)
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.appTextSecondary)
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.8)) {
                animatedValue = value
            }
            
            // Show "On target" briefly if in optimal range
            if optimalRange.contains(value) {
                withAnimation(.easeIn(duration: 0.3).delay(0.5)) {
                    showOnTarget = true
                }
                withAnimation(.easeOut(duration: 0.3).delay(2.0)) {
                    showOnTarget = false
                }
            }
        }
        .onChange(of: value) { newValue in
            withAnimation(.spring(response: 0.8, dampingFraction: 0.8)) {
                animatedValue = newValue
            }
            
            // Check if we entered the optimal range
            if optimalRange.contains(newValue) && !optimalRange.contains(value) {
                withAnimation(.easeIn(duration: 0.3)) {
                    showOnTarget = true
                }
                withAnimation(.easeOut(duration: 0.3).delay(2.0)) {
                    showOnTarget = false
                }
            }
        }
    }
    
    @ViewBuilder
    private var backgroundSegments: some View {
        ZStack {
            // Full gray background ring
            Circle()
                .stroke(Color.appBorder.opacity(0.3), lineWidth: lineWidth)
            
            // Colored segments overlay
            Group {
                // Below optimal range (red)
                if minValue < optimalRange.lowerBound {
                    Arc(
                        startAngle: angle(for: minValue),
                        endAngle: angle(for: min(optimalRange.lowerBound, maxValue)),
                        clockwise: true
                    )
                    .stroke(Color(.systemRed).opacity(0.4), style: StrokeStyle(lineWidth: lineWidth, lineCap: .butt))
                }
                
                // Optimal range (green)
                Arc(
                    startAngle: angle(for: max(minValue, optimalRange.lowerBound)),
                    endAngle: angle(for: min(maxValue, optimalRange.upperBound)),
                    clockwise: true
                )
                .stroke(Color(.systemGreen).opacity(0.4), style: StrokeStyle(lineWidth: lineWidth, lineCap: .butt))
                
                // Above optimal range (red)
                if maxValue > optimalRange.upperBound {
                    Arc(
                        startAngle: angle(for: max(minValue, optimalRange.upperBound)),
                        endAngle: angle(for: maxValue),
                        clockwise: true
                    )
                    .stroke(Color(.systemRed).opacity(0.4), style: StrokeStyle(lineWidth: lineWidth, lineCap: .butt))
                }
            }
        }
    }
    
    @ViewBuilder
    private var progressFill: some View {
        // Main progress arc
        Arc(
            startAngle: angle(for: minValue),
            endAngle: angle(for: min(max(minValue, animatedValue), maxValue)),
            clockwise: true
        )
        .stroke(
            color(for: animatedValue),
            style: StrokeStyle(
                lineWidth: lineWidth,
                lineCap: .round
            )
        )
        .animation(.spring(response: 0.8, dampingFraction: 0.8), value: animatedValue)
    }
    
    @ViewBuilder
    private var idealTick: some View {
        // Small tick mark at ideal value
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
        VStack(spacing: 0) {
            // Value
            Text("\(Int(animatedValue))")
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.appText)
            
            // Unit
            Text(unit)
                .font(.system(size: 14))
                .foregroundColor(.appTextSecondary)
                .offset(y: -4)
            
            // "On target" indicator
            if showOnTarget {
                Text("On target")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(.systemGreen))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(
                        Capsule()
                            .fill(Color(.systemGreen).opacity(0.15))
                    )
                    .offset(y: 8)
                    .transition(.scale.combined(with: .opacity))
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

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager.shared)
            .environmentObject(SyncManager.shared)
            .preferredColorScheme(.dark)
    }
}