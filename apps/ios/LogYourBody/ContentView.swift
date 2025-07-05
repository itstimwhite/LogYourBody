//
//  ContentView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var loadingManager = LoadingManager(authManager: AuthManager.shared)
    @State private var hasCompletedOnboarding = false
    @State private var isLoadingComplete = false
    
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
            } else {
                Group {
                    if authManager.isAuthenticated {
                        if hasCompletedOnboarding {
                            MainTabView()
                                .onAppear {
                                    print("🏠 Showing MainTabView (Dashboard)")
                                }
                        } else {
                            OnboardingContainerView()
                                .onAppear {
                                    print("🎯 Showing OnboardingContainerView")
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
            print("🔄 Current onboarding status: \(hasCompletedOnboarding)")
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
