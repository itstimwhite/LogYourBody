//
//  OnboardingViewModel.swift
//  LogYourBody
//
import Combine

@MainActor
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
        case progressPhotos = 6
        case notifications = 7
        case profilePreparation = 8
        
        var title: String {
            switch self {
            case .welcome: return "Welcome"
            case .name: return "Your Name"
            case .dateOfBirth: return "Date of Birth"
            case .height: return "Height"
            case .gender: return "Gender"
            case .healthKit: return "Apple Health"
            case .progressPhotos: return "Progress Photos"
            case .notifications: return "Notifications"
            case .profilePreparation: return "Preparing Profile"
            }
        }
        
        var progress: Double {
            return Double(self.rawValue + 1) / Double(OnboardingStep.allCases.count)
        }
    }
    
    
    init() {
        // Use single source of truth for name
        let displayName = AuthManager.shared.getUserDisplayName()
        
        // Only use the name if it's not the email fallback
        if !displayName.contains("@") && displayName != "User" {
            data.name = displayName
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
                
                // If we've skipped all steps, go to profile preparation
                if nextStepValue >= OnboardingStep.allCases.count {
                    currentStep = .profilePreparation
                }
            }
        }
    }
    
    private func shouldShowStep(_ step: OnboardingStep) -> Bool {
        switch step {
        case .welcome, .healthKit, .progressPhotos, .notifications, .profilePreparation:
            // Always show these steps
            return true
        case .name:
            // Show name step if name is empty (couldn't get from Apple Sign In)
            return data.name.isEmpty
        case .dateOfBirth, .height, .gender:
            // Always show these steps so users can see imported data
            // This increases perceived value when data is pre-filled from HealthKit
            return true
        }
    }
    
    func previousStep() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if currentStep.rawValue > 0 {
                var previousStepValue = currentStep.rawValue - 1
                
                // Keep decrementing until we find a step that should be shown
                while previousStepValue >= 0 {
                    let potentialStep = OnboardingStep(rawValue: previousStepValue)!
                    
                    if shouldShowStep(potentialStep) {
                        currentStep = potentialStep
                        break
                    }
                    
                    previousStepValue -= 1
                }
                
                // If we couldn't find a previous step, stay on current
                if previousStepValue < 0 {
                    currentStep = OnboardingStep(rawValue: 0)!
                }
            }
        }
    }
    
    
    func completeOnboarding(authManager: AuthManager) async {
        // Validate required fields before completing
        guard !data.name.isEmpty,
              data.dateOfBirth != nil,
              data.totalHeightInInches > 0,
              data.gender != nil else {
            // Don't complete onboarding if required fields are missing
            isLoading = false
            return
        }
        
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
            // Update name using consolidated method
            if !data.name.isEmpty && data.name != authManager.getUserDisplayName() {
                do {
                    try await authManager.consolidateNameUpdate(data.name)
                } catch {
                    // Failed to update name during onboarding
                }
            }
            
            // Create profile update data (without name, as it's handled above)
            let updates: [String: Any] = [
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
