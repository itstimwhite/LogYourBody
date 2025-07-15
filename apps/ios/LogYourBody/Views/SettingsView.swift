//
// SettingsView.swift
// LogYourBody
//
// Created by Tim White on 7/1/25.
// import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showDeveloperMenu = false
    @State private var developerTapCount = 0
    @State private var refreshID = UUID()
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 0) {
                        // User Header
                        userHeaderView
                            .padding(.top, 20)
                            .padding(.bottom, 30)
                        
                        VStack(spacing: 20) {
                            // Profile Section
                            SettingsSection(header: "Profile") {
                                SettingsRow(
                                    icon: "envelope",
                                    title: "Email",
                                    value: authManager.currentUser?.email ?? "",
                                    showChevron: false
                                )

                                Divider()
                                    .padding(.leading, 16)

                                NavigationLink(destination: ProfileSettingsViewV2().environmentObject(authManager)) {
                                    SettingsRow(
                                        icon: "person.circle",
                                        title: "Profile Settings",
                                        showChevron: true
                                    )
                                }
                            }

                            // Preferences Section
                            SettingsSection(header: "Preferences") {
                                NavigationLink(destination: PreferencesView().environmentObject(authManager)) {
                                    SettingsRow(
                                        icon: "slider.horizontal.3",
                                        title: "Units & Security",
                                        showChevron: true
                                    )
                                }
                            }

                            // Integrations Section
                            SettingsSection(header: "Integrations") {
                                NavigationLink(destination: IntegrationsView().environmentObject(authManager)) {
                                    SettingsRow(
                                        icon: "arrow.triangle.2.circlepath",
                                        title: "Apps & Import",
                                        value: "Apple Health, Photos",
                                        showChevron: true
                                    )
                                }
                            }

                            // Security & Devices Section
                            SettingsSection(header: "Security & Devices") {
                                NavigationLink(destination: SecuritySessionsView()) {
                                    SettingsRow(
                                        icon: "desktopcomputer",
                                        title: "Active Sessions",
                                        showChevron: true
                                    )
                                }

                                Divider()
                                    .padding(.leading, 16)

                                NavigationLink(destination: ChangePasswordView()) {
                                    SettingsRow(
                                        icon: "lock.rotation",
                                        title: "Change Password",
                                        showChevron: true
                                    )
                                }
                            }

                            // Data & Privacy Section
                            SettingsSection(header: "Data & Privacy") {
                                NavigationLink(destination: ExportDataView()) {
                                    SettingsRow(
                                        icon: "square.and.arrow.up",
                                        title: "Export Data",
                                        showChevron: true
                                    )
                                }

                                Divider()
                                    .padding(.leading, 16)

                                NavigationLink(destination: DeleteAccountView()) {
                                    SettingsRow(
                                        icon: "trash",
                                        title: "Delete Account",
                                        showChevron: true
                                    )
                                }
                                .foregroundColor(.red)
                            }

                            // Legal Section
                            SettingsSection(header: "Legal") {
                                NavigationLink(destination: LegalView()) {
                                    SettingsRow(
                                        icon: "scale.3d",
                                        title: "Legal & Policies",
                                        showChevron: true
                                    )
                                }
                            }

                            // About Section
                            SettingsSection(header: "About") {
                                Button(action: {
                                    developerTapCount += 1
                                    if developerTapCount >= 7 {
                                        withAnimation {
                                            showDeveloperMenu = true
                                            developerTapCount = 0
                                        }
                                    }
                                    
                                    // Reset tap count after 3 seconds
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                        if developerTapCount < 7 {
                                            developerTapCount = 0
                                        }
                                    }
                                }) {
                                    HStack {
                                        VersionRow()
                                        
                                        if developerTapCount > 0 && developerTapCount < 7 {
                                            Spacer()
                                            Text("\(7 - developerTapCount)")
                                                .font(.caption2)
                                                .foregroundColor(.appTextTertiary)
                                                .padding(.trailing, 16)
                                                .transition(.opacity)
                                        }
                                    }
                                }
                                .buttonStyle(PlainButtonStyle())

                                Divider()
                                    .padding(.leading, 16)

                                WhatsNewRow()

                                Divider()
                                    .padding(.leading, 16)

                                Link(destination: URL(string: "https://logyourbody.com/support")!) {
                                    SettingsRow(
                                        icon: "questionmark.circle",
                                        title: "Support",
                                        showChevron: true,
                                        isExternal: true
                                    )
                                }
                            }

                            // Log Out Button
                            Button(action: {
                                Task {
                                    await authManager.logout()
                                }
                            }) {
                                HStack {
                                    Label("Log Out", systemImage: "rectangle.portrait.and.arrow.right")
                                        .font(.system(size: 16))
                                        .foregroundColor(.red)
                                    Spacer()
                                }
                                .padding()
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                            }
                            .buttonStyle(PlainButtonStyle())
                            .padding(.top, 12)
                            
                            // Footer with developer access
                            if showDeveloperMenu {
                                VStack(spacing: 8) {
                                    NavigationLink(destination: DeveloperMenuView()) {
                                        HStack {
                                            Image(systemName: "hammer")
                                                .font(.caption2)
                                            Text("Developer Options")
                                                .font(.caption2)
                                        }
                                        .foregroundColor(.appPrimary)
                                    }
                                }
                                .padding(.top, 20)
                                .padding(.bottom, 40)
                            } else {
                                // Just add spacing when developer menu is hidden
                                Spacer()
                                    .frame(height: 60)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .id(refreshID)
            .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
                refreshID = UUID()
            }
        }
    }
    
    @ViewBuilder
    
    private var userHeaderView: some View {
        VStack(spacing: 16) {
            // User Avatar
            ZStack {
                Circle()
                    .fill(Color(.systemGray5))
                    .frame(width: 80, height: 80)
                
                Text(authManager.currentUser?.profile?.fullName?.prefix(1).uppercased() ?? "U")
                    .font(.system(size: 32, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            
            // User Info
            VStack(spacing: 4) {
                Text(authManager.currentUser?.profile?.fullName ?? "User")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(authManager.currentUser?.email ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 20)
    }
}

// MARK: - Settings View
// Components are imported from SettingsComponents.swift which includes:
// - SettingsSection
// - SettingsRow
// - SettingsNavigationLink
// - SettingsToggleRow
// - SettingsButtonRow
// - and more...


// MARK: - Developer Menu View

struct DeveloperMenuView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    #if DEBUG
                    // Debug Tools
                    DebugToolsSection()
                    #endif
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 40)
            }
        }
        .navigationTitle("Developer Options")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#if DEBUG
struct DebugToolsSection: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        SettingsSection(header: "Debug Tools") {
            Button(action: {
                Task {
                    await testBodyMetricsSync()
                }
            }) {
                SettingsRow(
                    icon: "arrow.triangle.2.circlepath",
                    title: "Test Body Metrics Sync"
                )
            }
            
            Divider()
                .padding(.leading, 16)
            
            Button(action: {
                CoreDataManager.shared.debugPrintAllBodyMetrics()
            }) {
                SettingsRow(
                    icon: "doc.text.magnifyingglass",
                    title: "Print All Body Metrics"
                )
            }
            
            Divider()
                .padding(.leading, 16)
            
            Button(action: {
                SyncManager.shared.syncAll()
            }) {
                SettingsRow(
                    icon: "icloud.and.arrow.up",
                    title: "Force Sync Now"
                )
            }
            
            Divider()
                .padding(.leading, 16)
            
            Button(action: {
                // Clear all caches
                UserDefaults.standard.removeObject(forKey: "HasSyncedHistoricalSteps")
            }) {
                SettingsRow(
                    icon: "trash",
                    title: "Clear Caches"
                )
            }
        }
    }
    
    @MainActor
    func testBodyMetricsSync() async {
        // print("\n🔍 === SYNC DEBUG TEST START ===")
        
        let testMetric = BodyMetrics(
            id: UUID().uuidString,
            userId: AuthManager.shared.currentUser?.id ?? "",
            date: Date(),
            weight: 75.5,
            weightUnit: "kg",
            bodyFatPercentage: 20.5,
            bodyFatMethod: "Debug Test",
            muscleMass: nil,
            boneMass: nil,
            notes: "Test metric created for debugging sync",
            photoUrl: nil,
            dataSource: "Manual",
            createdAt: Date(),
            updatedAt: Date()
        )
        
        CoreDataManager.shared.saveBodyMetrics(testMetric, userId: testMetric.userId, markAsSynced: false)
        SyncManager.shared.syncIfNeeded()
        
        // print("\n🔍 === SYNC DEBUG TEST END ===\n")
    }
}
#endif


#Preview {
    SettingsView()
        .environmentObject(AuthManager.shared)
        .preferredColorScheme(.dark)
}
