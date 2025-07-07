//
//  PreferencesView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI
import LocalAuthentication

struct PreferencesView: View {
    @AppStorage(Constants.preferredMeasurementSystemKey) private var measurementSystem = PreferencesView.defaultMeasurementSystem
    @AppStorage("healthKitSyncEnabled") private var healthKitSyncEnabled = true
    @AppStorage("biometricLockEnabled") private var biometricLockEnabled = false
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var showHealthKitConnect = false
    @State private var biometricType: LABiometryType = .none
    
    private let context = LAContext()
    
    enum MeasurementSystem: String, CaseIterable {
        case imperial = "Imperial"
        case metric = "Metric"
        
        var weightUnit: String {
            switch self {
            case .imperial: return "lbs"
            case .metric: return "kg"
            }
        }
        
        var heightUnit: String {
            switch self {
            case .imperial: return "ft"
            case .metric: return "cm"
            }
        }
        
        var heightDisplay: String {
            switch self {
            case .imperial: return "feet & inches"
            case .metric: return "centimeters"
            }
        }
    }
    
    // Default to imperial as requested
    static var defaultMeasurementSystem: String {
        return MeasurementSystem.imperial.rawValue
    }
    
    var currentSystem: MeasurementSystem {
        MeasurementSystem(rawValue: measurementSystem) ?? .imperial
    }
    
    private func checkBiometricAvailability() {
        var error: NSError?
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            biometricType = context.biometryType
        } else {
            biometricType = .none
        }
    }
    
    var body: some View {
        List {
            Section("Units") {
                Picker("Measurement System", selection: $measurementSystem) {
                    Text("Imperial").tag(MeasurementSystem.imperial.rawValue)
                    Text("Metric").tag(MeasurementSystem.metric.rawValue)
                }
                .pickerStyle(SegmentedPickerStyle())
                
                VStack(alignment: .leading, spacing: 8) {
                    Label {
                        Text("Weight: \(currentSystem.weightUnit)")
                            .font(.caption)
                    } icon: {
                        Image(systemName: "scalemass")
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                    }
                    
                    Label {
                        Text("Height: \(currentSystem.heightDisplay)")
                            .font(.caption)
                    } icon: {
                        Image(systemName: "ruler")
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                    }
                }
                .foregroundColor(.secondary)
                .padding(.vertical, 4)
            }
            
            Section("Apple Health") {
                if healthKitManager.isHealthKitAvailable {
                    HStack {
                        Image(systemName: "heart.fill")
                            .foregroundColor(.red)
                            .font(.system(size: 20))
                        
                        Text("Apple Health")
                        
                        Spacer()
                        
                        if healthKitManager.isAuthorized {
                            Label("Connected", systemImage: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.green)
                                .labelStyle(.titleAndIcon)
                        } else {
                            Button("Connect") {
                                Task {
                                    let authorized = await healthKitManager.requestAuthorization()
                                    if !authorized {
                                        showHealthKitConnect = true
                                    }
                                }
                            }
                            .font(.caption)
                            .foregroundColor(.blue)
                        }
                    }
                    
                    if healthKitManager.isAuthorized {
                        Toggle("Enable Sync", isOn: $healthKitSyncEnabled)
                            .padding(.top, 8)
                            .onChange(of: healthKitSyncEnabled) { oldValue, newValue in
                                if newValue {
                                    // Check if we still have permissions
                                    Task {
                                        let authorized = await healthKitManager.requestAuthorization()
                                        if authorized {
                                            // Start observing changes and sync existing data
                                            healthKitManager.observeWeightChanges()
                                            healthKitManager.observeStepChanges()
                                            try? await healthKitManager.syncWeightFromHealthKit()
                                            try? await healthKitManager.syncStepsFromHealthKit()
                                        } else {
                                            // Reset the toggle if not authorized
                                            await MainActor.run {
                                                healthKitSyncEnabled = false
                                                showHealthKitConnect = true
                                            }
                                        }
                                    }
                                }
                            }
                        
                        Text(healthKitSyncEnabled ? 
                             "Weight and step data sync automatically between LogYourBody and Apple Health" :
                             "HealthKit sync is disabled. Data will not sync with Apple Health")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    }
                } else {
                    HStack {
                        Image(systemName: "exclamationmark.triangle")
                            .foregroundColor(.orange)
                        Text("Apple Health is not available on this device")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Section("Security") {
                Toggle(isOn: $biometricLockEnabled) {
                    HStack {
                        Image(systemName: biometricType == .faceID ? "faceid" : "touchid")
                            .foregroundColor(.appPrimary)
                        Text(biometricType == .faceID ? "Face ID Lock" : "Touch ID Lock")
                    }
                }
                .disabled(biometricType == .none)
                
                if biometricType == .none {
                    Text("Biometric authentication is not available on this device")
                        .font(.caption)
                        .foregroundColor(.secondary)
                } else {
                    Text(biometricLockEnabled ? 
                         "Require \(biometricType == .faceID ? "Face ID" : "Touch ID") to open the app" :
                         "App opens without authentication")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Section("Data & Privacy") {
                NavigationLink("Export Data") {
                    ExportDataView()
                }
                
                NavigationLink("Delete Account") {
                    DeleteAccountView()
                }
                .foregroundColor(.red)
            }
        }
        .navigationTitle("Preferences")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showHealthKitConnect) {
            HealthKitConnectSheet(isPresented: $showHealthKitConnect)
        }
        .onAppear {
            checkBiometricAvailability()
            // Check HealthKit authorization status
            healthKitManager.checkAuthorizationStatus()
        }
    }
}

struct HealthKitConnectSheet: View {
    @Binding var isPresented: Bool
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var isConnecting = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 40) {
                Spacer()
                
                // Apple Health icon
                ZStack {
                    RoundedRectangle(cornerRadius: 30)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color(red: 1.0, green: 0.2, blue: 0.4),
                                    Color(red: 1.0, green: 0.4, blue: 0.6)
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 120, height: 120)
                    
                    Image(systemName: "heart.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.white)
                }
                
                VStack(spacing: 16) {
                    Text("Connect Apple Health")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Allow LogYourBody to read and write weight data to Apple Health")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
                
                Spacer()
                
                VStack(spacing: 12) {
                    Button(action: {
                        connectHealthKit()
                    }) {
                        if isConnecting {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.gray)
                                .cornerRadius(10)
                        } else {
                            Text("Connect")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                    }
                    .disabled(isConnecting)
                    .padding(.horizontal)
                    
                    Button("Not Now") {
                        isPresented = false
                    }
                    .foregroundColor(.secondary)
                }
                .padding(.bottom, 40)
            }
            .navigationTitle("Apple Health")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        isPresented = false
                    }
                }
            }
        }
    }
    
    private func connectHealthKit() {
        isConnecting = true
        
        Task {
            let authorized = await healthKitManager.requestAuthorization()
            
            await MainActor.run {
                isConnecting = false
                if authorized {
                    // Start syncing from HealthKit when first connected
                    Task {
                        healthKitManager.observeWeightChanges()
                        healthKitManager.observeStepChanges()
                        try? await healthKitManager.syncWeightFromHealthKit()
                        try? await healthKitManager.syncStepsFromHealthKit()
                    }
                    isPresented = false
                }
            }
        }
    }
}

// Custom label styles removed - use default SwiftUI label styles

#Preview {
    NavigationView {
        PreferencesView()
    }
}