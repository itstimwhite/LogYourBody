//
// LogYourBodyApp.swift
// LogYourBody
//
import SwiftUI
import Clerk

@main
struct LogYourBodyApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var healthKitManager = HealthKitManager.shared
    @StateObject private var syncManager = SyncManager.shared
    @StateObject private var widgetDataManager = WidgetDataManager.shared
    @State private var clerk = Clerk.shared
    @State private var showAddEntrySheet = false
    @State private var selectedEntryTab = 0
    
    let persistenceController = CoreDataManager.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.viewContext)
                .environmentObject(authManager)
                .environmentObject(syncManager)
                .environment(clerk)
                .sheet(isPresented: $showAddEntrySheet) {
                    AddEntrySheet(isPresented: $showAddEntrySheet)
                        .environmentObject(authManager)
                        .onAppear {
                            // Set the selected tab based on deep link
                            if let tab = UserDefaults.standard.object(forKey: "pendingEntryTab") as? Int {
                                selectedEntryTab = tab
                                UserDefaults.standard.removeObject(forKey: "pendingEntryTab")
                            }
                        }
                }
                .onOpenURL { url in
                    handleDeepLink(url)
                }
                .task {
                    // Perform app version management and cleanup
                    // TODO: Add AppVersionManager.swift to Xcode project, then uncomment:
                    // AppVersionManager.shared.performStartupMaintenance()
                    
                    // Repair any corrupted Core Data entries on startup
                    let repairedCount = CoreDataManager.shared.repairCorruptedEntries()
                    if repairedCount > 0 {
                        // print("🔧 App startup: Repaired \(repairedCount) corrupted entries")
                    }
                    
                    // Initialize Clerk
                    await authManager.initializeClerk()
                    
                    // Check HealthKit authorization status on app launch
                    healthKitManager.checkAuthorizationStatus()
                    
                    // Start HealthKit sync if enabled
                    if UserDefaults.standard.bool(forKey: "healthKitSyncEnabled") && healthKitManager.isAuthorized {
                        // Set up observers for new data
                        healthKitManager.observeWeightChanges()
                        healthKitManager.observeStepChanges()
                        
                        // Initial sync will be handled by the observers
                        // No need to call sync methods here to avoid concurrent saves
                        
                        // Enable background step delivery
                        Task {
                            try? await healthKitManager.setupStepCountBackgroundDelivery()
                        }
                    }
                    
                    // Setup widget data updates
                    widgetDataManager.setupAutomaticUpdates()
                    await widgetDataManager.updateWidgetData()
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)) { _ in
                    // App entering background - ensure sync is complete
                    syncManager.syncIfNeeded()
                    
                    // Update widget data
                    Task {
                        await widgetDataManager.updateWidgetData()
                    }
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
                    // App entering foreground - refresh data
                    Task {
                        if healthKitManager.isAuthorized {
                            try? await healthKitManager.syncStepsFromHealthKit()
                        }
                        // Update widget with latest data
                        await widgetDataManager.updateWidgetData()
                    }
                }
        }
    }
    
    // MARK: - Deep Link Handling
    
    private func handleDeepLink(_ url: URL) {
        guard url.scheme == "logyourbody" else { return }
        
        switch url.host {
        case "oauth", "oauth-callback":
            // Handle OAuth callbacks (e.g., from Apple Sign In)
            // Clerk SDK handles the OAuth callback automatically
            break
            
        case "log":
            // Check if user is authenticated and has completed onboarding
            guard authManager.isAuthenticated else {
                // User needs to sign in first
                return
            }
            
            // Check if onboarding is complete
            let hasCompletedOnboarding = UserDefaults.standard.bool(forKey: Constants.hasCompletedOnboardingKey)
            let isProfileComplete = checkProfileComplete()
            
            if !hasCompletedOnboarding || !isProfileComplete {
                // User needs to complete onboarding first
                // Don't open the add entry sheet
                return
            }
            
            // Handle specific log types
            if let path = url.pathComponents.dropFirst().first {
                switch path {
                case "weight":
                    UserDefaults.standard.set(0, forKey: "pendingEntryTab")
                case "bodyfat":
                    UserDefaults.standard.set(1, forKey: "pendingEntryTab")
                case "photo":
                    UserDefaults.standard.set(2, forKey: "pendingEntryTab")
                default:
                    break
                }
            }
            showAddEntrySheet = true
            
        default:
            // Unhandled URL host
            break
        }
    }
    
    private func checkProfileComplete() -> Bool {
        guard let profile = authManager.currentUser?.profile else { return false }
        return profile.fullName != nil &&
               profile.dateOfBirth != nil &&
               profile.height != nil &&
               profile.gender != nil
    }
}
