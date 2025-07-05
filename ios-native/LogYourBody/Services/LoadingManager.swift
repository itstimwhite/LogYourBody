//
//  LoadingManager.swift
//  LogYourBody
//
//  Created on 7/2/25.
//

import Foundation
import SwiftUI

@MainActor
class LoadingManager: ObservableObject {
    @Published var progress: Double = 0.0
    @Published var loadingStatus: String = "Initializing..."
    @Published var isLoading: Bool = true
    
    private let authManager: AuthManager
    private let healthKitManager = HealthKitManager.shared
    private let coreDataManager = CoreDataManager.shared
    private let syncManager = SyncManager.shared
    
    // Loading steps with their weights
    private enum LoadingStep {
        case initialize
        case checkAuth
        case loadProfile
        case setupHealthKit
        case loadLocalData
        case syncData
        case complete
        
        var weight: Double {
            switch self {
            case .initialize: return 0.1
            case .checkAuth: return 0.2
            case .loadProfile: return 0.2
            case .setupHealthKit: return 0.2
            case .loadLocalData: return 0.15
            case .syncData: return 0.15
            case .complete: return 0.0
            }
        }
        
        var status: String {
            switch self {
            case .initialize: return "Initializing app..."
            case .checkAuth: return "Checking authentication..."
            case .loadProfile: return "Loading user profile..."
            case .setupHealthKit: return "Setting up health data..."
            case .loadLocalData: return "Loading local data..."
            case .syncData: return "Syncing with server..."
            case .complete: return "Ready!"
            }
        }
    }
    
    private var completedWeight: Double = 0.0
    
    init(authManager: AuthManager) {
        self.authManager = authManager
    }
    
    func startLoading() async {
        isLoading = true
        progress = 0.0
        completedWeight = 0.0
        
        // Step 1: Initialize
        await updateProgress(for: .initialize)
        try? await Task.sleep(nanoseconds: 200_000_000) // 0.2s
        
        // Step 2: Check Authentication
        await updateProgress(for: .checkAuth, partial: 0.5)
        
        // Wait for Clerk to be loaded first
        while !authManager.isClerkLoaded {
            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s
        }
        
        // Add timeout for auth check
        await withTaskGroup(of: Void.self) { group in
            group.addTask {
                // Auth status is automatically updated by the session observer
                // Just wait a moment for it to complete
                try? await Task.sleep(nanoseconds: 200_000_000) // 0.2s
            }
            
            group.addTask {
                try? await Task.sleep(nanoseconds: 3_000_000_000) // 3 second timeout
            }
            
            // Wait for first to complete (either auth check or timeout)
            await group.next()
            group.cancelAll()
        }
        
        await updateProgress(for: .checkAuth)
        
        // Step 3: Load Profile (if authenticated)
        if authManager.isAuthenticated {
            await updateProgress(for: .loadProfile, partial: 0.3)
            
            if let userId = authManager.currentUser?.id {
                // Load profile from Core Data first
                if let cachedProfile = coreDataManager.fetchProfile(for: userId) {
                    let profile = cachedProfile.toUserProfile()
                    // Update auth manager with cached profile
                    if let currentUser = authManager.currentUser {
                        let updatedUser = User(
                            id: currentUser.id,
                            email: currentUser.email,
                            name: currentUser.name,
                            profile: profile
                        )
                        authManager.currentUser = updatedUser
                    }
                }
            }
            
            await updateProgress(for: .loadProfile)
            
            // Step 4: Setup HealthKit
            await updateProgress(for: .setupHealthKit, partial: 0.3)
            healthKitManager.checkAuthorizationStatus()
            
            if healthKitManager.isAuthorized {
                // Request fresh data from HealthKit
                Task {
                    try? await healthKitManager.fetchTodayStepCount()
                }
            }
            await updateProgress(for: .setupHealthKit)
            
            // Step 5: Load Local Data
            await updateProgress(for: .loadLocalData, partial: 0.5)
            syncManager.updatePendingSyncCount()
            await updateProgress(for: .loadLocalData)
            
            // Step 6: Sync Data (if online)
            await updateProgress(for: .syncData, partial: 0.3)
            
            // Start sync in background
            Task {
                syncManager.syncIfNeeded()
            }
            
            try? await Task.sleep(nanoseconds: 300_000_000) // 0.3s
            await updateProgress(for: .syncData)
        } else {
            // Skip profile, healthkit, and sync steps if not authenticated
            completedWeight += LoadingStep.loadProfile.weight
            completedWeight += LoadingStep.setupHealthKit.weight
            completedWeight += LoadingStep.loadLocalData.weight
            completedWeight += LoadingStep.syncData.weight
            progress = completedWeight
        }
        
        // Step 7: Complete
        await updateProgress(for: .complete)
        progress = 1.0
        loadingStatus = "Ready!"
        
        try? await Task.sleep(nanoseconds: 200_000_000) // 0.2s
        isLoading = false
    }
    
    private func updateProgress(for step: LoadingStep, partial: Double = 1.0) async {
        loadingStatus = step.status
        
        let stepProgress = step.weight * partial
        completedWeight += stepProgress
        
        // Animate progress update
        withAnimation(.easeInOut(duration: 0.3)) {
            progress = min(completedWeight, 0.99) // Keep at 99% until truly complete
        }
        
        // Small delay to make the progress visible
        try? await Task.sleep(nanoseconds: 50_000_000) // 0.05s
    }
}