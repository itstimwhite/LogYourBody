import SwiftUI
import Supabase
import RevenueCat

@main
struct LogYourBodyApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var userManager = UserManager.shared
    
    init() {
        // Configure Supabase
        SupabaseManager.shared.configure()
        
        // Configure RevenueCat
        Purchases.logLevel = .debug
        Purchases.configure(withAPIKey: Configuration.revenueCatAPIKey)
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(userManager)
                .onAppear {
                    // Check authentication status on app launch
                    Task {
                        await authManager.checkAuthStatus()
                    }
                }
        }
    }
}

// MARK: - Configuration
struct Configuration {
    static let supabaseURL = "https://kyybudbkyuwcnebrlpwu.supabase.co"
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5eWJ1ZGJreXV3Y25lYnJscHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgyMzA1NzcsImV4cCI6MjAzMzgwNjU3N30.sKjBZFHrNdc7FpZCOMIHsQC_odQcJPnO2I-Q6aI6-vE"
    static let revenueCatAPIKey = "YOUR_REVENUECAT_IOS_API_KEY" // TODO: Add your iOS-specific RevenueCat API key
    static let apiBaseURL = "https://logyourbody.vercel.app/api"
}