//
//  MainTabView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = AnimatedTabView.Tab.dashboard
    @StateObject private var healthKitManager = HealthKitManager.shared
    @AppStorage("healthKitSyncEnabled") private var healthKitSyncEnabled = true
    @Namespace private var namespace
    
    init() {
        // Hide default tab bar since we're using custom one
        UITabBar.appearance().isHidden = true
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Content with smooth transitions
            Group {
                switch selectedTab {
                case .dashboard:
                    DashboardView()
                        .transition(.asymmetric(
                            insertion: .move(edge: .leading).combined(with: .opacity),
                            removal: .move(edge: .trailing).combined(with: .opacity)
                        ))
                case .log:
                    LogWeightView()
                        .transition(.asymmetric(
                            insertion: .scale.combined(with: .opacity),
                            removal: .scale.combined(with: .opacity)
                        ))
                case .settings:
                    SettingsView()
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .move(edge: .leading).combined(with: .opacity)
                        ))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Custom Animated Tab Bar
            VStack(spacing: 0) {
                Spacer()
                
                AnimatedTabView(selectedTab: $selectedTab)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: selectedTab)
        .toastPresenter() // Add toast presenter to main view
        .onAppear {
            // Check HealthKit authorization status on app launch
            healthKitManager.checkAuthorizationStatus()
            
            // If sync is enabled and we're authorized, start observers
            if healthKitSyncEnabled && healthKitManager.isAuthorized {
                Task {
                    // Start observers for real-time updates
                    healthKitManager.observeWeightChanges()
                    healthKitManager.observeStepChanges()
                    
                    // Enable background step delivery
                    try? await healthKitManager.setupStepCountBackgroundDelivery()
                }
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthManager())
}