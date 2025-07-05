//
//  LogWeightView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

struct LogWeightView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var syncManager: SyncManager
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var weight: String = ""
    @State private var bodyFat: String = ""
    @State private var showBodyFatField = false
    @AppStorage(Constants.preferredMeasurementSystemKey) private var measurementSystem = PreferencesView.defaultMeasurementSystem
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab: Int = 0
    
    var currentSystem: PreferencesView.MeasurementSystem {
        PreferencesView.MeasurementSystem(rawValue: measurementSystem) ?? .imperial
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color.appBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 20))
                                .foregroundColor(.appText)
                                .frame(width: 44, height: 44)
                        }
                        
                        Spacer()
                        
                        Text("Log Measurement")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.appText)
                        
                        Spacer()
                        
                        // Invisible placeholder for balance
                        Color.clear
                            .frame(width: 44, height: 44)
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                    
                    ScrollView {
                        VStack(spacing: 40) {
                            // Tab selector
                            HStack(spacing: 0) {
                                ForEach(0..<2) { index in
                                    Button(action: { 
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            selectedTab = index
                                        }
                                    }) {
                                        VStack(spacing: 8) {
                                            Text(index == 0 ? "Weight" : "Body Fat")
                                                .font(.appBody)
                                                .foregroundColor(selectedTab == index ? .appText : .appTextSecondary)
                                            
                                            Rectangle()
                                                .fill(selectedTab == index ? Color.appPrimary : Color.clear)
                                                .frame(height: 2)
                                        }
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                            }
                            .padding(.horizontal, 24)
                            .padding(.top, 20)
                            
                            // Icon
                            ZStack {
                                Circle()
                                    .fill(Color.appPrimary.opacity(0.1))
                                    .frame(width: 80, height: 80)
                                
                                Image(systemName: selectedTab == 0 ? "scalemass.fill" : "percent")
                                    .font(.system(size: 40))
                                    .foregroundColor(.appPrimary)
                            }
                            
                            // Input fields
                            VStack(spacing: 24) {
                                if selectedTab == 0 {
                                    // Weight input
                                    VStack(spacing: 16) {
                                        Text("Enter your weight")
                                            .font(.system(size: 20, weight: .medium))
                                            .foregroundColor(.appText)
                                        
                                        HStack(alignment: .bottom, spacing: 8) {
                                            TextField("0", text: $weight)
                                                .font(.system(size: 48, weight: .bold, design: .rounded))
                                                .foregroundColor(.appText)
                                                .multilineTextAlignment(.center)
                                                .keyboardType(.decimalPad)
                                                .frame(maxWidth: 200)
                                            
                                            Text(currentSystem.weightUnit)
                                                .font(.system(size: 24, weight: .medium))
                                                .foregroundColor(.appTextSecondary)
                                                .padding(.bottom, 8)
                                        }
                                        
                                        // Optional body fat toggle
                                        Button(action: {
                                            withAnimation {
                                                showBodyFatField.toggle()
                                            }
                                        }) {
                                            HStack {
                                                Image(systemName: showBodyFatField ? "checkmark.square.fill" : "square")
                                                    .foregroundColor(.appPrimary)
                                                Text("Also log body fat %")
                                                    .font(.appBody)
                                                    .foregroundColor(.appText)
                                            }
                                        }
                                        .padding(.top, 8)
                                        
                                        if showBodyFatField {
                                            VStack(spacing: 8) {
                                                Text("Body Fat Percentage")
                                                    .font(.appBodySmall)
                                                    .foregroundColor(.appTextSecondary)
                                                
                                                HStack(alignment: .bottom, spacing: 8) {
                                                    TextField("0", text: $bodyFat)
                                                        .font(.system(size: 32, weight: .semibold, design: .rounded))
                                                        .foregroundColor(.appText)
                                                        .multilineTextAlignment(.center)
                                                        .keyboardType(.decimalPad)
                                                        .frame(maxWidth: 120)
                                                    
                                                    Text("%")
                                                        .font(.system(size: 20, weight: .medium))
                                                        .foregroundColor(.appTextSecondary)
                                                        .padding(.bottom, 6)
                                                }
                                            }
                                            .padding(.top, 16)
                                            .transition(.opacity)
                                        }
                                    }
                                } else {
                                    // Body fat input
                                    VStack(spacing: 16) {
                                        Text("Enter body fat percentage")
                                            .font(.system(size: 20, weight: .medium))
                                            .foregroundColor(.appText)
                                        
                                        HStack(alignment: .bottom, spacing: 8) {
                                            TextField("0", text: $bodyFat)
                                                .font(.system(size: 48, weight: .bold, design: .rounded))
                                                .foregroundColor(.appText)
                                                .multilineTextAlignment(.center)
                                                .keyboardType(.decimalPad)
                                                .frame(maxWidth: 200)
                                            
                                            Text("%")
                                                .font(.system(size: 24, weight: .medium))
                                                .foregroundColor(.appTextSecondary)
                                                .padding(.bottom, 8)
                                        }
                                    }
                                }
                            }
                            
                            // Today's date
                            HStack {
                                Image(systemName: "calendar")
                                    .font(.system(size: 16))
                                    .foregroundColor(.appTextSecondary)
                                Text(Date(), style: .date)
                                    .font(.system(size: 16))
                                    .foregroundColor(.appTextSecondary)
                            }
                            
                            Spacer(minLength: 60)
                        }
                        .padding(.bottom, 100)
                    }
                    
                    // Save button (fixed at bottom)
                    VStack {
                        Button(action: saveMeasurement) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.9)
                                    .frame(height: 56)
                                    .frame(maxWidth: .infinity)
                                    .background(Color.appPrimary)
                                    .cornerRadius(Constants.cornerRadius)
                            } else {
                                Text(getSaveButtonText())
                                    .font(.system(size: 17, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(height: 56)
                                    .frame(maxWidth: .infinity)
                                    .background(isFormValid() ? Color.appPrimary : Color.appBorder)
                                    .cornerRadius(Constants.cornerRadius)
                                    .animation(.easeInOut(duration: 0.2), value: isFormValid())
                            }
                        }
                        .disabled(!isFormValid() || isLoading)
                        .padding(.horizontal, 24)
                        .padding(.bottom, 50)
                    }
                    .background(
                        Color.appBackground
                            .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: -5)
                    )
                }
            }
            .preferredColorScheme(.dark)
            .onTapGesture {
                hideKeyboard()
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
    
    private func isFormValid() -> Bool {
        if selectedTab == 0 {
            return !weight.isEmpty
        } else {
            return !bodyFat.isEmpty
        }
    }
    
    private func getSaveButtonText() -> String {
        if selectedTab == 0 {
            if showBodyFatField && !bodyFat.isEmpty {
                return "Save Weight & Body Fat"
            }
            return "Save Weight"
        } else {
            return "Save Body Fat"
        }
    }
    
    private func saveMeasurement() {
        isLoading = true
        
        Task {
            do {
                if selectedTab == 0 {
                    // Save weight (and optionally body fat)
                    guard let weightValue = Double(weight) else {
                        await MainActor.run {
                            errorMessage = "Please enter a valid weight"
                            showError = true
                            isLoading = false
                        }
                        return
                    }
                    
                    // Convert weight to kg for storage
                    let weightInKg = currentSystem.weightUnit == "lbs" ? weightValue * 0.453592 : weightValue
                    
                    // Parse body fat if provided
                    let bodyFatValue = showBodyFatField && !bodyFat.isEmpty ? Double(bodyFat) : nil
                    
                    // Save to HealthKit if authorized
                    if healthKitManager.isAuthorized {
                        let weightInLbs = currentSystem.weightUnit == "kg" ? weightValue * 2.20462 : weightValue
                        try await healthKitManager.saveWeight(weightInLbs, date: Date())
                        
                        if let bf = bodyFatValue {
                            try await healthKitManager.saveBodyFatPercentage(bf / 100, date: Date())
                        }
                    }
                    
                    // Create body metrics
                    let metrics = BodyMetrics(
                        id: UUID().uuidString,
                        userId: authManager.currentUser?.id ?? "",
                        date: Date(),
                        weight: weightInKg,
                        weightUnit: "kg",
                        bodyFatPercentage: bodyFatValue,
                        bodyFatMethod: bodyFatValue != nil ? "Manual" : nil,
                        muscleMass: nil,
                        boneMass: nil,
                        notes: nil,
                        createdAt: Date(),
                        updatedAt: Date()
                    )
                    
                    // Save to local storage and sync
                    syncManager.logBodyMetrics(metrics)
                    
                } else {
                    // Save body fat only
                    guard let bodyFatValue = Double(bodyFat) else {
                        await MainActor.run {
                            errorMessage = "Please enter a valid body fat percentage"
                            showError = true
                            isLoading = false
                        }
                        return
                    }
                    
                    // Get the latest weight to update with body fat
                    let recentMetrics = syncManager.fetchLocalBodyMetrics(
                        from: Calendar.current.date(byAdding: .day, value: -7, to: Date())
                    ).sorted { $0.date > $1.date }
                    
                    let latestWeight = recentMetrics.first?.weight
                    
                    // Save to HealthKit if authorized
                    if healthKitManager.isAuthorized {
                        try await healthKitManager.saveBodyFatPercentage(bodyFatValue / 100, date: Date())
                    }
                    
                    // Create body metrics with body fat
                    let metrics = BodyMetrics(
                        id: UUID().uuidString,
                        userId: authManager.currentUser?.id ?? "",
                        date: Date(),
                        weight: latestWeight,
                        weightUnit: latestWeight != nil ? "kg" : nil,
                        bodyFatPercentage: bodyFatValue,
                        bodyFatMethod: "Manual",
                        muscleMass: nil,
                        boneMass: nil,
                        notes: nil,
                        createdAt: Date(),
                        updatedAt: Date()
                    )
                    
                    // Save to local storage and sync
                    syncManager.logBodyMetrics(metrics)
                }
                
                await MainActor.run {
                    isLoading = false
                    // Dismiss and return to dashboard
                    dismiss()
                }
                
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}

struct LogWeightView_Previews: PreviewProvider {
    static var previews: some View {
        LogWeightView()
            .environmentObject(AuthManager.shared)
            .environmentObject(SyncManager.shared)
            .preferredColorScheme(.dark)
    }
}