//
//  OnboardingContainerView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI

struct OnboardingContainerView: View {
    @StateObject private var viewModel = OnboardingViewModel()
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var backgroundOffset: CGFloat = 0
    
    var body: some View {
        ZStack {
            // Clean background - Linear style
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Modern progress indicator
                if viewModel.currentStep != .welcome && viewModel.currentStep != .completion {
                    VStack(spacing: 0) {
                        // Step dots indicator
                        HStack(spacing: 6) {
                            ForEach(OnboardingViewModel.OnboardingStep.allCases.filter { $0 != .welcome && $0 != .completion }, id: \.self) { step in
                                StepIndicator(
                                    isActive: step == viewModel.currentStep,
                                    isCompleted: step.rawValue < viewModel.currentStep.rawValue
                                )
                            }
                        }
                        .padding(.horizontal, Constants.paddingLarge)
                        .padding(.vertical, Constants.padding)
                        
                        // Subtle separator
                        Rectangle()
                            .fill(Color.appBorder.opacity(0.2))
                            .frame(height: 1)
                    }
                    .background(Color.appBackground)
                }
                
                // Content with animation
                Group {
                    switch viewModel.currentStep {
                    case .welcome:
                        WelcomeStepView()
                    case .name:
                        NameInputView()
                    case .dateOfBirth:
                        DateOfBirthInputView()
                    case .height:
                        HeightInputView()
                    case .gender:
                        GenderInputView()
                    case .healthKit:
                        HealthKitStepView()
                    case .notifications:
                        NotificationsStepView()
                    case .completion:
                        CompletionStepView()
                    }
                }
                .environmentObject(viewModel)
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .move(edge: .leading).combined(with: .opacity)
                ))
                .animation(.smooth, value: viewModel.currentStep)
            }
        }
        .preferredColorScheme(.dark)
        .onChange(of: viewModel.currentStep) { _, newStep in
            // Subtle haptic feedback
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.prepare()
            impactFeedback.impactOccurred()
        }
    }
}

// MARK: - Step Indicator Component
struct StepIndicator: View {
    let isActive: Bool
    let isCompleted: Bool
    
    var body: some View {
        Circle()
            .fill(
                isCompleted ? Color.appPrimary :
                isActive ? Color.appPrimary :
                Color.appBorder
            )
            .frame(width: 5, height: 5)
            .opacity(isCompleted ? 1 : isActive ? 1 : 0.3)
            .animation(.easeOut(duration: 0.2), value: isActive)
            .animation(.easeOut(duration: 0.2), value: isCompleted)
    }
}

#Preview {
    OnboardingContainerView()
        .environmentObject(AuthManager())
}