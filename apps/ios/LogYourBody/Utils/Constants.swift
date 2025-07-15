//
//  Constants.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import Foundation
import SwiftUI

extension Notification.Name {
    static let profileUpdated = Notification.Name("profileUpdated")
}

struct Constants {
    // MARK: - App Info
    static let appName = "LogYourBody"
    static let appVersion = "1.0.0"
    static let buildNumber = "1"
    
    // MARK: - API Configuration
    #if DEBUG
    static let baseURL = "https://www.logyourbody.com"  // Use production API even in debug
    #else
    static let baseURL = "https://www.logyourbody.com"
    #endif
    
    // MARK: - Clerk Configuration
    static let clerkPublishableKey = "pk_live_Y2xlcmsubG9neW91cmJvZHkuY29tJA"
    static let clerkFrontendAPI = "https://clerk.logyourbody.com"
    static let useMockAuth = false  // Disable mock auth - using production
    
    static var isClerkConfigured: Bool {
        let keyValid = !clerkPublishableKey.isEmpty && clerkPublishableKey.hasPrefix("pk_")
        if !keyValid {
            print("⚠️ Invalid Clerk publishable key format")
        }
        return keyValid
    }
    
    // MARK: - Supabase Configuration (for data storage)
    static let supabaseURL = "https://ihivupqpctpkrgqgxfjf.supabase.co"
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXZ1cHFwY3Rwa3JncWd4ZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODc4MTksImV4cCI6MjA2NTY2MzgxOX0.Vihex-nnnn-au1Z-dwGNZUnp9CTGa37t3lNk9RLB-8o"
    
    // MARK: - UserDefaults Keys
    static let authTokenKey = "authToken"
    static let currentUserKey = "currentUser"
    static let preferredWeightUnitKey = "preferredWeightUnit"
    static let preferredMeasurementSystemKey = "preferredMeasurementSystem"
    static let hasCompletedOnboardingKey = "hasCompletedOnboarding"
    
    // MARK: - Units
    static let weightUnits = ["kg", "lbs"]
    static let heightUnits = ["cm", "ft"]
    
    // MARK: - Layout
    static let cornerRadius: CGFloat = 8  // More modern, Linear-inspired
    static let cornerRadiusLarge: CGFloat = 12
    static let cornerRadiusSmall: CGFloat = 6
    static let padding: CGFloat = 20
    static let paddingSmall: CGFloat = 12
    static let paddingLarge: CGFloat = 24
    static let spacing: CGFloat = 12
    static let spacingSmall: CGFloat = 8
    static let spacingLarge: CGFloat = 16
    
    // MARK: - Animation
    static let animationDuration: Double = 0.3
    static let springAnimation = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.8)
    static let smoothAnimation = SwiftUI.Animation.easeInOut(duration: 0.3)
    
    // MARK: - Body Composition Ideal Ranges
    struct BodyComposition {
        // Body Fat Percentage
        struct BodyFat {
            static let maleOptimalRange: ClosedRange<Double> = 8...12
            static let maleIdealValue: Double = 10
            static let femaleOptimalRange: ClosedRange<Double> = 16...20
            static let femaleIdealValue: Double = 18
        }
        
        // Fat-Free Mass Index (FFMI)
        struct FFMI {
            static let maleOptimalRange: ClosedRange<Double> = 20...23
            static let maleIdealValue: Double = 23
            static let femaleOptimalRange: ClosedRange<Double> = 16...19
            static let femaleIdealValue: Double = 17.5
        }
    }
}