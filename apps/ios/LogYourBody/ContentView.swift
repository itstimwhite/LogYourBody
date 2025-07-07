//
//  ContentView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var loadingManager: LoadingManager
    @State private var hasCompletedOnboarding = false
    @State private var isLoadingComplete = false
    @State private var isUnlocked = false
    @AppStorage("biometricLockEnabled") private var biometricLockEnabled = false
    
    init() {
        // We need to initialize LoadingManager with a temporary AuthManager
        // The actual authManager will be injected from environment
        _loadingManager = StateObject(wrappedValue: LoadingManager(authManager: AuthManager.shared))
    }
    
    // Check if user profile is complete
    private var isProfileComplete: Bool {
        guard let profile = authManager.currentUser?.profile else { return false }
        return profile.fullName != nil &&
               profile.dateOfBirth != nil &&
               profile.height != nil &&
               profile.gender != nil
    }
    
    private var shouldShowOnboarding: Bool {
        // Show onboarding if:
        // 1. User hasn't completed onboarding OR
        // 2. User profile is incomplete
        return !hasCompletedOnboarding || !isProfileComplete
    }
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            if !isLoadingComplete {
                LoadingView(
                    progress: $loadingManager.progress,
                    loadingStatus: $loadingManager.loadingStatus,
                    onComplete: {
                        withAnimation(.easeInOut(duration: 0.4)) {
                            isLoadingComplete = true
                        }
                    }
                )
                .transition(.opacity)
            } else if authManager.isAuthenticated && biometricLockEnabled && !isUnlocked {
                // Show biometric lock screen
                BiometricLockView(isUnlocked: $isUnlocked)
                    .transition(AnyTransition.opacity)
            } else {
                Group {
                    if authManager.isAuthenticated {
                        if shouldShowOnboarding {
                            OnboardingContainerView()
                                .onAppear {
                                    print("🎯 Showing OnboardingContainerView")
                                    print("   Profile complete: \(isProfileComplete)")
                                    print("   Onboarding completed: \(hasCompletedOnboarding)")
                                }
                        } else {
                            MainTabView()
                                .onAppear {
                                    print("🏠 Showing MainTabView (Dashboard)")
                                }
                        }
                    } else if authManager.needsEmailVerification {
                        NavigationView {
                            EmailVerificationView()
                        }
                        .onAppear {
                            print("📧 Showing EmailVerificationView")
                        }
                    } else {
                        NavigationView {
                            LoginView()
                        }
                        .onAppear {
                            print("🔐 Showing LoginView")
                        }
                    }
                }
                .transition(.opacity)
            }
        }
        .preferredColorScheme(.dark)
        .toastPresenter() // Add global toast presenter
        .onAppear {
            // Initialize onboarding status
            hasCompletedOnboarding = UserDefaults.standard.bool(forKey: Constants.hasCompletedOnboardingKey)
            
            // Start loading process
            Task {
                await loadingManager.startLoading()
                // Check if loading is already complete
                if !loadingManager.isLoading && loadingManager.progress >= 1.0 {
                    withAnimation(.easeInOut(duration: 0.4)) {
                        isLoadingComplete = true
                    }
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: UserDefaults.didChangeNotification)) { _ in
            // Update onboarding status when UserDefaults changes
            hasCompletedOnboarding = UserDefaults.standard.bool(forKey: Constants.hasCompletedOnboardingKey)
        }
        .onChange(of: authManager.isAuthenticated) { newValue in
            print("🔄 Authentication state changed to: \(newValue)")
            print("🔄 Should show onboarding: \(shouldShowOnboarding)")
            print("🔄 Profile complete: \(isProfileComplete)")
            print("🔄 Onboarding completed: \(hasCompletedOnboarding)")
            print("🔄 isLoadingComplete: \(isLoadingComplete)")
            print("🔄 Current user: \(authManager.currentUser?.email ?? "nil")")
            print("🔄 Clerk session: \(authManager.clerkSession?.id ?? "nil")")
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager.shared)
}
