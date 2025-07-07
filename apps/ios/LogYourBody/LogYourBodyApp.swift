//
//  LogYourBodyApp.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI
import Clerk

@main
struct LogYourBodyApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var healthKitManager = HealthKitManager.shared
    @StateObject private var syncManager = SyncManager.shared
    @State private var clerk = Clerk.shared
    
    let persistenceController = CoreDataManager.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.viewContext)
                .environmentObject(authManager)
                .environmentObject(syncManager)
                .environment(clerk)
                .task {
                    // Perform app version management and cleanup
                    // TODO: Add AppVersionManager.swift to Xcode project, then uncomment:
                    // AppVersionManager.shared.performStartupMaintenance()
                    
                    // Repair any corrupted Core Data entries on startup
                    let repairedCount = CoreDataManager.shared.repairCorruptedEntries()
                    if repairedCount > 0 {
                        print("🔧 App startup: Repaired \(repairedCount) corrupted entries")
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
                    }
                }
        }
    }
}
