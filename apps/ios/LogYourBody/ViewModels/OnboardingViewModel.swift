//
//  OnboardingViewModel.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI
import Combine

class OnboardingViewModel: ObservableObject {
    @Published var currentStep: OnboardingStep = .welcome
    @Published var data = OnboardingData()
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""
    
    enum OnboardingStep: Int, CaseIterable {
        case welcome = 0
        case healthKit = 1
        case name = 2
        case dateOfBirth = 3
        case height = 4
        case gender = 5
        case notifications = 6
        case completion = 7
        
        var title: String {
            switch self {
            case .welcome: return "Welcome"
            case .name: return "Your Name"
            case .dateOfBirth: return "Date of Birth"
            case .height: return "Height"
            case .gender: return "Gender"
            case .healthKit: return "Apple Health"
            case .notifications: return "Notifications"
            case .completion: return "All Set!"
            }
        }
        
        var progress: Double {
            return Double(self.rawValue + 1) / Double(OnboardingStep.allCases.count)
        }
    }
    
    
    init() {
        // Pre-fill data from Apple Sign In if available
        if let appleSignInName = UserDefaults.standard.string(forKey: "appleSignInName") {
            data.name = appleSignInName
        }
    }
    
    func nextStep() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if currentStep.rawValue < OnboardingStep.allCases.count - 1 {
                var nextStepValue = currentStep.rawValue + 1
                
                // Keep incrementing until we find a step that needs to be shown
                while nextStepValue < OnboardingStep.allCases.count {
                    let potentialStep = OnboardingStep(rawValue: nextStepValue)!
                    
                    if shouldShowStep(potentialStep) {
                        currentStep = potentialStep
                        break
                    }
                    
                    nextStepValue += 1
                }
                
                // If we've skipped all steps, go to completion
                if nextStepValue >= OnboardingStep.allCases.count {
                    currentStep = .completion
                }
            }
        }
    }
    
    private func shouldShowStep(_ step: OnboardingStep) -> Bool {
        switch step {
        case .welcome, .healthKit, .notifications, .completion:
            // Always show these steps
            return true
        case .name:
            // Show name step if name is empty (couldn't get from Apple Sign In)
            return data.name.isEmpty
        case .dateOfBirth:
            // Show DOB step if not imported from HealthKit
            return data.dateOfBirth == nil
        case .height:
            // Show height step if not imported from HealthKit
            return data.totalHeightInInches == 0
        case .gender:
            // Show gender step if not imported from HealthKit
            return data.gender == nil
        }
    }
    
    func previousStep() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if currentStep.rawValue > 0 {
                currentStep = OnboardingStep(rawValue: currentStep.rawValue - 1)!
            }
        }
    }
    
    
    func completeOnboarding(authManager: AuthManager) async {
        isLoading = true
        
        await MainActor.run {
            // Mark onboarding as completed
            UserDefaults.standard.set(true, forKey: Constants.hasCompletedOnboardingKey)
            
            // Force notification to ensure UI updates
            NotificationCenter.default.post(name: UserDefaults.didChangeNotification, object: nil)
        }
        
        // Update user profile
        let currentUser = await MainActor.run { authManager.currentUser }
        if let user = currentUser {
            // Create profile update data
            let updates: [String: Any] = [
                "name": data.name.isEmpty ? user.name ?? "" : data.name,
                "dateOfBirth": data.dateOfBirth as Any,
                "height": Double(data.totalHeightInInches),
                "heightUnit": "in",
                "gender": data.gender?.rawValue as Any,
                "onboardingCompleted": true
            ]
            
            // Update profile through AuthManager (which will sync to Supabase)
            await authManager.updateProfile(updates)
        }
        
        await MainActor.run {
            isLoading = false
        }
    }
}