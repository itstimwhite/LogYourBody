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
    @State private var dailyMetrics: DailyMetrics?
    @State private var bodyMetrics: [BodyMetrics] = []
    @State private var selectedIndex: Int = 0
    @State private var isLoading = false
    @State private var showPhotoOptions = false
    @State private var showCamera = false
    @State private var showPhotoPicker = false
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var toastMessage: String?
    @State private var toastType: ToastType = .info
    @AppStorage(Constants.preferredMeasurementSystemKey) private var measurementSystem = PreferencesView.defaultMeasurementSystem
    
    enum ToastType {
        case info, success, error
    }
    
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
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom Header
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
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 12)
                    .background(Color.appBackground)
                    
                    // Toast container (32pt overlay)
                    if let message = toastMessage {
                        HStack {
                            Image(systemName: toastType == .error ? "exclamationmark.circle" : 
                                            toastType == .success ? "checkmark.circle" : "info.circle")
                                .foregroundColor(toastType == .error ? .red : 
                                               toastType == .success ? .green : .appPrimary)
                            Text(message)
                                .font(.system(size: 14))
                                .foregroundColor(.appText)
                        }
                        .padding(.horizontal, 16)
                        .frame(height: 32)
                        .frame(maxWidth: .infinity)
                        .background(Color.appCard)
                        .cornerRadius(8)
                        .padding(.horizontal)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .onAppear {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                withAnimation {
                                    toastMessage = nil
                                }
                            }
                        }
                    }
                    
                    if isLoading && bodyMetrics.isEmpty {
                        // Loading State
                        Spacer()
                        VStack(spacing: 20) {
                            ProgressView()
                                .scaleEffect(1.5)
                            Text("Loading your data...")
                                .font(.appBody)
                                .foregroundColor(.appTextSecondary)
                        }
                        Spacer()
                    } else if bodyMetrics.isEmpty {
                        // Empty State
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
                    } else {
                        // Main Content
                        ScrollView {
                            VStack(spacing: 16) {
                                // Progress Photo (1:1 square)
                                ZStack {
                                    if let photoUrl = currentMetric?.photoUrl, !photoUrl.isEmpty {
                                        OptimizedProgressPhotoView(photoUrl: photoUrl)
                                            .aspectRatio(1, contentMode: .fill)
                                            .clipped()
                                            .cornerRadius(16)
                                    } else {
                                        Rectangle()
                                            .fill(Color.appCard)
                                            .aspectRatio(1, contentMode: .fit)
                                            .overlay(
                                                ZStack {
                                                    Circle()
                                                        .fill(Color.appBackground)
                                                        .frame(width: 60, height: 60)
                                                    
                                                    Image(systemName: "plus")
                                                        .font(.system(size: 24, weight: .medium))
                                                        .foregroundColor(.appPrimary)
                                                }
                                            )
                                            .cornerRadius(16)
                                            .onTapGesture {
                                                showPhotoOptions = true
                                            }
                                    }
                                }
                                .padding(.horizontal)
                                
                                // Core Metrics Row
                                HStack(spacing: 12) {
                                    // Body Fat % with progress ring
                                    CoreMetricCard(
                                        value: currentMetric?.bodyFatPercentage,
                                        label: "Body Fat %",
                                        progress: currentMetric?.bodyFatPercentage != nil ? 
                                            (100 - currentMetric!.bodyFatPercentage) / 100 : 0
                                    )
                                    
                                    // FFMI with progress ring
                                    CoreMetricCard(
                                        value: calculateFFMI(),
                                        label: "FFMI",
                                        progress: calculateFFMI() != nil ? 
                                            min(calculateFFMI()! / 25, 1.0) : 0
                                    )
                                }
                                .frame(height: 120)
                                .padding(.horizontal)
                                
                                // Secondary Metrics Strip
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 0) {
                                        SecondaryMetricItem(
                                            icon: "scalemass",
                                            value: currentMetric?.weight != nil ? 
                                                convertWeight(currentMetric!.weight!, from: "kg", to: currentSystem.weightUnit) : nil,
                                            unit: currentSystem.weightUnit,
                                            label: "Weight"
                                        )
                                        
                                        Divider()
                                            .frame(height: 40)
                                        
                                        SecondaryMetricItem(
                                            icon: "figure.walk",
                                            value: dailyMetrics?.steps != nil ? Double(dailyMetrics!.steps!) : nil,
                                            unit: "steps",
                                            label: "Steps",
                                            showDecimal: false
                                        )
                                        
                                        Divider()
                                            .frame(height: 40)
                                        
                                        SecondaryMetricItem(
                                            icon: "figure.arms.open",
                                            value: calculateLeanMass() != nil ? 
                                                convertWeight(calculateLeanMass()!, from: "kg", to: currentSystem.weightUnit) : nil,
                                            unit: currentSystem.weightUnit,
                                            label: "Lean Mass"
                                        )
                                    }
                                    .padding(.horizontal)
                                }
                                .frame(height: 60)
                                .background(Color.appCard)
                                
                                // Timeline controls (if multiple entries)
                                if bodyMetrics.count > 1 {
                                    VStack(spacing: 8) {
                                        Slider(
                                            value: Binding(
                                                get: { Double(selectedIndex) },
                                                set: { selectedIndex = Int($0) }
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
                }
            }
            .navigationBarHidden(true)
            .onAppear {
                loadCachedDataImmediately()
                loadDailyMetrics()
                Task {
                    await loadBodyMetrics()
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
        }
    }
    
    // MARK: - Helper Methods
    
    private func showToast(_ message: String, type: ToastType) {
        withAnimation {
            toastMessage = message
            toastType = type
        }
    }
    
    private func loadCachedDataImmediately() {
        guard let userId = authManager.currentUser?.id else { return }
        
        let cached = CoreDataManager.shared.fetchBodyMetrics(for: userId)
        bodyMetrics = cached.compactMap { $0.toBodyMetrics() }
            .sorted { $0.date < $1.date }
        
        if !bodyMetrics.isEmpty {
            selectedIndex = bodyMetrics.count - 1
        }
    }
    
    private func loadDailyMetrics() {
        guard let userId = authManager.currentUser?.id else { return }
        dailyMetrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: Date())?.toDailyMetrics()
    }
    
    private func loadBodyMetrics() async {
        isLoading = true
        defer { isLoading = false }
        
        // Sync with remote if needed
        syncManager.syncIfNeeded()
        
        // Reload from cache
        loadCachedDataImmediately()
        loadDailyMetrics()
    }
    
    private func refreshData() async {
        // Sync with remote
        syncManager.syncAll()
        
        // Wait a bit for sync
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        // Reload from cache
        loadCachedDataImmediately()
        loadDailyMetrics()
    }
    
    private func handlePhotoCapture(_ image: UIImage) async {
        guard let currentMetric = currentMetric else { return }
        
        showToast("Uploading photo...", type: .info)
        
        // Save to photo library and get URL
        var photoUrl: String?
        await MainActor.run {
            // Here we would normally upload to Supabase
            // For now, just save locally
            photoUrl = "local://photo_\(UUID().uuidString)"
        }
        
        if let photoUrl = photoUrl {
            // Update the current metric with the photo URL
            if var updatedMetric = bodyMetrics.first(where: { $0.id == currentMetric.id }) {
                updatedMetric.photoUrl = photoUrl
                
                // Save to Core Data
                CoreDataManager.shared.saveBodyMetrics(updatedMetric, userId: authManager.currentUser?.id ?? "")
                
                // Reload data
                loadCachedDataImmediately()
                
                // Trigger sync
                syncManager.syncIfNeeded()
                
                showToast("Photo saved successfully", type: .success)
            }
        } else {
            showToast("Failed to save photo", type: .error)
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
}

// MARK: - New UI Components

struct CoreMetricCard: View {
    let value: Double?
    let label: String
    let progress: Double
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Background ring
                Circle()
                    .stroke(Color.appBorder, lineWidth: 6)
                    .frame(width: 80, height: 80)
                
                // Progress ring
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(Color.appPrimary, lineWidth: 6)
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.5), value: progress)
                
                // Value
                Text(value != nil ? "\(Int(value!))" : "--")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.appText)
            }
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.appTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 120)
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
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(.appPrimary)
            
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
    
    var body: some View {
        VStack(spacing: 0) {
            // Handle
            RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.appBorder)
                .frame(width: 40, height: 5)
                .padding(.top, 8)
                .padding(.bottom, 20)
            
            Text("Add Progress Photo")
                .font(.appHeadline)
                .foregroundColor(.appText)
                .padding(.bottom, 24)
            
            VStack(spacing: 12) {
                Button(action: {
                    isPresented = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        showCamera = true
                    }
                }) {
                    HStack {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 20))
                        Text("Take Photo")
                            .font(.appBodyLarge)
                        Spacer()
                    }
                    .foregroundColor(.appText)
                    .padding()
                    .background(Color.appCard)
                    .cornerRadius(12)
                }
                
                Button(action: {
                    isPresented = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        showPhotoPicker = true
                    }
                }) {
                    HStack {
                        Image(systemName: "photo.fill")
                            .font(.system(size: 20))
                        Text("Choose from Library")
                            .font(.appBodyLarge)
                        Spacer()
                    }
                    .foregroundColor(.appText)
                    .padding()
                    .background(Color.appCard)
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .frame(maxHeight: 300)
        .background(Color.appBackground)
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