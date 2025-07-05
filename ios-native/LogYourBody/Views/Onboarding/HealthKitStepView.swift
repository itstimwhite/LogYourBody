//
//  HealthKitStepView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI
import HealthKit

struct HealthKitStepView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var isConnecting = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {
                    viewModel.previousStep()
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .frame(width: 40, height: 40)
                        .contentShape(Rectangle())
                }
                
                Spacer()
                
                Button("Skip") {
                    viewModel.nextStep()
                }
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.appTextSecondary)
                .padding(.trailing, 16)
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            
            Spacer()
            
            VStack(spacing: 40) {
                // Apple Health icon - minimalist
                Image(systemName: "heart.fill")
                    .font(.system(size: 48, weight: .regular))
                    .foregroundColor(Color(red: 1.0, green: 0.2, blue: 0.4))
                
                // Title and description
                VStack(spacing: 12) {
                    Text("Connect Apple Health")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.appText)
                    
                    Text("Automatically sync your weight data between LogYourBody and Apple Health")
                        .font(.system(size: 15, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
                
                // Benefits
                VStack(alignment: .leading, spacing: 20) {
                    HealthBenefitRow(
                        icon: "arrow.triangle.2.circlepath",
                        text: "Automatic weight syncing"
                    )
                    
                    HealthBenefitRow(
                        icon: "chart.line.uptrend.xyaxis",
                        text: "Track progress in one place"
                    )
                    
                    HealthBenefitRow(
                        icon: "lock.shield.fill",
                        text: "Your data stays private"
                    )
                }
                .padding(.horizontal, 40)
            }
            
            Spacer()
            
            // Connect button
            VStack(spacing: 16) {
                Button(action: {
                    connectHealthKit()
                }) {
                    HStack {
                        if isConnecting {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 20))
                            Text("Connect Apple Health")
                                .font(.system(size: 15, weight: .medium))
                        }
                    }
                }
                .modernPrimaryButtonStyle()
                .disabled(isConnecting)
                
                Text("You can change this anytime in Settings")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.appTextTertiary)
                    .opacity(0.8)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
        }
    }
    
    private func connectHealthKit() {
        isConnecting = true
        
        Task {
            let authorized = await healthKitManager.requestAuthorization()
            
            await MainActor.run {
                isConnecting = false
                viewModel.data.healthKitEnabled = authorized
                
                // If authorized, try to fetch data from HealthKit
                if authorized {
                    Task {
                        // Fetch all available data from HealthKit
                        
                        // Fetch date of birth
                        if let dateOfBirth = healthKitManager.fetchDateOfBirth() {
                            await MainActor.run {
                                viewModel.data.dateOfBirth = dateOfBirth
                            }
                        }
                        
                        // Fetch biological sex
                        if let biologicalSex = healthKitManager.fetchBiologicalSex() {
                            await MainActor.run {
                                viewModel.data.gender = OnboardingData.Gender(rawValue: biologicalSex)
                            }
                        }
                        
                        // Fetch height
                        if let heightInInches = try? await healthKitManager.fetchHeight() {
                            await MainActor.run {
                                let feet = Int(heightInInches) / 12
                                let inches = Int(heightInInches) % 12
                                viewModel.data.heightFeet = feet
                                viewModel.data.heightInches = inches
                            }
                        }
                    }
                }
                
                // Move to next step
                viewModel.nextStep()
            }
        }
    }
}

struct HealthBenefitRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .regular))
                .foregroundColor(.appTextSecondary)
                .frame(width: 28)
            
            Text(text)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.appText)
            
            Spacer()
        }
    }
}

#Preview {
    HealthKitStepView()
        .environmentObject(OnboardingViewModel())
        .background(Color.appBackground)
}