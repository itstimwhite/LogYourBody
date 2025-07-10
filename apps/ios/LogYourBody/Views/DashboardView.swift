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
            VStack(spacing: 8) {  // Further reduced from 12
                // Progress Photo (1:1 square)
                progressPhotoView
                    .padding(.horizontal, 12)
                
                // Timeline Slider - moved above metrics
                if bodyMetrics.count > 1 {
                    timelineSlider
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                }
                
                // Core Metrics Row
                coreMetricsRow
                    .padding(.horizontal, 12)
                
                // Bottom padding to account for pinned metrics strip
                Color.clear.frame(height: 130)  // Space for metrics strip + tab bar
            }
            .padding(.top, 4)  // Further reduced from 8
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
                historicalMetrics: bodyMetrics,
                selectedMetricsIndex: $selectedIndex
            )
            .frame(height: UIScreen.main.bounds.width * 0.7) // Reduced to 70% of width
            .background(Color.appBackground)
            .cornerRadius(16)
            .clipped()
            
            // Add photo button overlay if no photo exists
            if currentMetric?.photoUrl == nil || currentMetric?.photoUrl?.isEmpty == true {
                VStack {
                    HStack {
                        Spacer()
                        Button(action: {
                            showPhotoOptions = true
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.black.opacity(0.5))
                                    .frame(width: 44, height: 44)
                                
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(12)
                    }
                    Spacer()
                }
            }
        }
    }
    
    @ViewBuilder
    private var coreMetricsRow: some View {
        HStack(spacing: 8) {  // Reduced spacing
            // Body Fat % with segmented progress ring
            let estimatedBF = currentMetric?.bodyFatPercentage == nil && selectedIndex < bodyMetrics.count
                ? PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)
                : nil
            
            let bodyFatValue = currentMetric?.bodyFatPercentage ?? estimatedBF?.value
            
            if let bodyFatValue = bodyFatValue {
                StandardizedProgressRing(
                    value: bodyFatValue,
                    idealValue: getIdealBodyFat(),
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
            
            // FFMI with segmented progress ring
            if let ffmi = calculateFFMI() {
                StandardizedProgressRing(
                    value: ffmi,
                    idealValue: getIdealFFMI(),
                    label: "FFMI",
                    unit: "",
                    isFFMI: true
                )
                .frame(maxWidth: .infinity)
                .frame(height: 140)
                .background(Color.appCard)
                .cornerRadius(12)
            } else {
                EmptyMetricCard(label: "FFMI")
            }
        }
        .frame(height: 140)
    }
    
    @ViewBuilder
    private var secondaryMetricsStrip: some View {
        HStack(spacing: 0) {
            // Steps
            MetricStripItem(
                icon: "figure.walk",
                value: selectedDateMetrics?.steps.map { "\($0)" } ?? "––",
                label: "Steps",
                iconColor: .green,
                isEstimated: false
            )
            .frame(maxWidth: .infinity)
            
            Divider()
                .frame(height: 40)
            
            // Weight
            let estimatedWeight = currentMetric?.weight == nil && selectedIndex < bodyMetrics.count
                ? PhotoMetadataService.shared.estimateWeight(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)
                : nil
            let weightValue = currentMetric?.weight != nil ?
                convertWeight(currentMetric!.weight!, from: "kg", to: currentSystem.weightUnit) :
                (estimatedWeight != nil ? convertWeight(estimatedWeight!.value, from: "kg", to: currentSystem.weightUnit) : nil)
            
            MetricStripItem(
                icon: "scalemass",
                value: weightValue != nil ? "\(Int(weightValue!))" : "––",
                label: "Weight \(currentSystem.weightUnit)",
                iconColor: .gray,
                isEstimated: estimatedWeight != nil
            )
            .frame(maxWidth: .infinity)
            
            Divider()
                .frame(height: 40)
            
            // Lean Mass
            let leanMass = calculateLeanMass() != nil ?
                convertWeight(calculateLeanMass()!, from: "kg", to: currentSystem.weightUnit) : nil
            let isLeanMassEstimated = (currentMetric?.weight == nil && estimatedWeight != nil) || 
                                      (currentMetric?.bodyFatPercentage == nil && hasEstimatedData)
            
            MetricStripItem(
                icon: "figure.arms.open",
                value: leanMass != nil ? "\(Int(leanMass!))" : "––",
                label: "Lean Mass \(currentSystem.weightUnit)",
                iconColor: .blue,
                isEstimated: isLeanMassEstimated
            )
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal)
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
        VStack(spacing: 0) {
            
            // Streamlined header row
            HStack {
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
                            Text(gender == "male" ? "♂" : "♀")
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
                
                Spacer()
                
                // Sync status
                if syncManager.isSyncing {
                    Image(systemName: "arrow.triangle.2.circlepath")
                        .font(.system(size: 16))
                        .foregroundColor(.appPrimary)
                        .rotationEffect(.degrees(syncManager.isSyncing ? 360 : 0))
                        .animation(Animation.linear(duration: 1).repeatForever(autoreverses: false), value: syncManager.isSyncing)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.appBackground)
            
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
        VStack(spacing: 4) {
            // Custom slider with dots
            ZStack(alignment: .leading) {
                // Track
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.appBorder)
                    .frame(height: 4)
                
                // Dots for each metric
                GeometryReader { geometry in
                    ForEach(0..<bodyMetrics.count, id: \.self) { index in
                        Circle()
                            .fill(index == selectedIndex ? Color.appPrimary : Color.appBorder)
                            .frame(width: 8, height: 8)
                            .position(
                                x: CGFloat(index) / CGFloat(max(1, bodyMetrics.count - 1)) * geometry.size.width,
                                y: geometry.size.height / 2
                            )
                    }
                }
                .frame(height: 8)
                
                // Custom thumb
                GeometryReader { geometry in
                    Circle()
                        .fill(Color.appPrimary)
                        .frame(width: 20, height: 20)
                        .shadow(color: Color.black.opacity(0.2), radius: 2, x: 0, y: 1)
                        .position(
                            x: CGFloat(selectedIndex) / CGFloat(max(1, bodyMetrics.count - 1)) * geometry.size.width,
                            y: geometry.size.height / 2
                        )
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    let percent = value.location.x / geometry.size.width
                                    let index = Int(round(percent * Double(bodyMetrics.count - 1)))
                                    let newIndex = max(0, min(bodyMetrics.count - 1, index))
                                    
                                    // Haptic feedback on change
                                    if newIndex != selectedIndex {
                                        HapticManager.shared.sliderChanged()
                                        selectedIndex = newIndex
                                        loadMetricsForSelectedDate()
                                    }
                                }
                                .onEnded { _ in
                                    HapticManager.shared.sliderEnded()
                                }
                        )
                        .onTapGesture {
                            HapticManager.shared.sliderStarted()
                        }
                }
                .frame(height: 20)
            }
            .frame(height: 32)
            
            // Date labels with relative formatting
            HStack {
                if let date = bodyMetrics.first?.date {
                    Text(relativeDateLabel(for: date))
                        .font(.system(size: 14))
                        .foregroundColor(.appTextSecondary)
                }
                
                Spacer()
                
                if let date = currentMetric?.date {
                    Text(relativeDateLabel(for: date))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.appText)
                }
                
                Spacer()
                
                if let date = bodyMetrics.last?.date {
                    Text(relativeDateLabel(for: date))
                        .font(.system(size: 14))
                        .foregroundColor(.appTextSecondary)
                }
            }
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
                    
                    if isLoading && bodyMetrics.isEmpty {
                        loadingView
                    } else if bodyMetrics.isEmpty {
                        emptyStateView
                    } else {
                        ZStack(alignment: .bottom) {
                            mainContentView
                                .smartBlur(isPresented: showPhotoOptions || showCamera || showPhotoPicker || showingModal)
                            
                            // Pinned Secondary Metrics Strip
                            VStack(spacing: 0) {
                                Spacer()
                                
                                secondaryMetricsStrip
                                    .frame(height: 64)
                                    .background(
                                        Color.appCard
                                            .overlay(
                                                Rectangle()
                                                    .fill(Color.appBorder.opacity(0.2))
                                                    .frame(height: 0.5),
                                                alignment: .top
                                            )
                                    )
                                    .padding(.bottom, 75) // Increased space for tab bar
                            }
                        }
                    }
                }
            }
            .navigationBarHidden(true)
            .onChange(of: showPhotoOptions) { _, newValue in
                showingModal = newValue
            }
            .onChange(of: showCamera) { _, newValue in
                showingModal = newValue
            }
            .onChange(of: showPhotoPicker) { _, newValue in
                showingModal = newValue
            }
            .onAppear {
                // Log the current authentication state
                print("🎯 DashboardView onAppear")
                print("   - isAuthenticated: \(authManager.isAuthenticated)")
                print("   - currentUser: \(authManager.currentUser?.id ?? "nil") (\(authManager.currentUser?.email ?? "nil"))")
                print("   - clerkSession: \(authManager.clerkSession?.id ?? "nil")")
                
                // Delay initial load to prevent crash during transition
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    // Only load data if we have a valid user
                    if authManager.currentUser?.id != nil {
                        loadCachedDataImmediately()
                        loadDailyMetrics()
                        
                        Task {
                            // Add a small delay to ensure UI is stable
                            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
                            
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
        
        do {
            let cached = CoreDataManager.shared.fetchBodyMetrics(for: userId)
            bodyMetrics = cached.compactMap { $0.toBodyMetrics() }
                .sorted { $0.date < $1.date }
            
            print("📊 Found \(bodyMetrics.count) body metrics for user \(userId)")
            
            if !bodyMetrics.isEmpty {
                selectedIndex = min(bodyMetrics.count - 1, max(0, selectedIndex))
                loadMetricsForSelectedDate()
            }
        } catch {
            print("❌ Error loading cached data: \(error)")
            bodyMetrics = []
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
        .frame(maxWidth: .infinity)
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

// MARK: - Standardized Progress Ring

struct StandardizedProgressRing: View {
    let value: Double
    let idealValue: Double
    let label: String
    let unit: String
    var isFFMI: Bool = false
    
    @State private var animatedValue: Double = 0
    @State private var previousZone: Color? = nil
    
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
            let newZone = zoneColor(for: newValue)
            if let prevZone = previousZone, prevZone != newZone {
                if newZone == .adaptiveGreen {
                    HapticManager.shared.ringThresholdCrossed(entering: true)
                } else if prevZone == .adaptiveGreen {
                    HapticManager.shared.ringThresholdCrossed(entering: false)
                }
            }
            previousZone = newZone
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

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager.shared)
            .environmentObject(SyncManager.shared)
            .preferredColorScheme(.dark)
    }
}