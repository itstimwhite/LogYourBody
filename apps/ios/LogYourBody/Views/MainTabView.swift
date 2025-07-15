//
// MainTabView.swift
// LogYourBody
//
import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = AnimatedTabView.Tab.dashboard
    @StateObject private var healthKitManager = HealthKitManager.shared
    @AppStorage("healthKitSyncEnabled") private var healthKitSyncEnabled = true
    @Namespace private var namespace
    @State private var showAddEntrySheet = false
    @EnvironmentObject var authManager: AuthManager
    
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
                case .dietPhases:
                    DietPhaseHistoryView()
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .move(edge: .leading).combined(with: .opacity)
                        ))
                case .log:
                    DashboardView() // Stay on dashboard when log is tapped
                        .onAppear {
                            showAddEntrySheet = true
                            // Reset tab back to dashboard
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                                selectedTab = .dashboard
                            }
                        }
                case .settings:
                    SettingsView()
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .move(edge: .leading).combined(with: .opacity)
                        ))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Floating Tab Bar
            AnimatedTabView(selectedTab: $selectedTab)
                .padding(.horizontal, 16)
                .padding(.bottom, 20) // Space from bottom edge
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: selectedTab)
        // Toast presenter removed - handle notifications at view level
        .sheet(isPresented: $showAddEntrySheet) {
            AddEntrySheet(isPresented: $showAddEntrySheet)
                .environmentObject(authManager)
        }
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
