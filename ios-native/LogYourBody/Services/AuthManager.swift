//
//  AuthManager.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import Foundation
import Combine
import AuthenticationServices
import UIKit
import CryptoKit
import Clerk

typealias LocalUser = LogYourBody.User  // Disambiguate between Clerk SDK User and our User model

typealias ASPresentationAnchor = UIWindow

enum AuthError: LocalizedError {
    case clerkNotInitialized
    case invalidCredentials
    
    var errorDescription: String? {
        switch self {
        case .clerkNotInitialized:
            return "Clerk SDK is not initialized"
        case .invalidCredentials:
            return "Invalid authentication credentials"
        }
    }
}

@MainActor
class AuthManager: NSObject, ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated = false
    @Published var currentUser: LocalUser?
    @Published var clerkSession: Session?
    @Published var needsEmailVerification = false
    @Published var isClerkLoaded = false
    
    private var currentSignUp: SignUp?
    private var pendingSignUpCredentials: (email: String, password: String)?
    private let clerk = Clerk.shared
    private let supabase = SupabaseClient.shared  // Keep for data operations
    private let userDefaults = UserDefaults.standard
    private let userKey = Constants.currentUserKey
    private var cancellables = Set<AnyCancellable>()
    private var sessionObservationTask: Task<Void, Never>?
    
    override init() {
        super.init()
        print("🔐 AuthManager initialized")
        
        // Always start with no authentication until Clerk confirms session
        self.isAuthenticated = false
        self.currentUser = nil
        self.clerkSession = nil
        
        // Clear any stale user data
        userDefaults.removeObject(forKey: userKey)
    }
    
    func initializeClerk() async {
        print("🔧 Initializing Clerk SDK")
        
        // Configure Clerk with publishable key
        clerk.configure(publishableKey: Constants.clerkPublishableKey)
        
        // Load Clerk
        do {
            try await clerk.load()
            print("✅ Clerk SDK loaded successfully")
            
            await MainActor.run {
                self.isClerkLoaded = true
                self.observeSessionChanges()
            }
        } catch {
            print("❌ Failed to load Clerk: \(error)")
        }
    }
    
    private func observeSessionChanges() {
        // Cancel any existing observation
        sessionObservationTask?.cancel()
        
        // Observe Clerk instance for changes
        sessionObservationTask = Task { @MainActor in
            // Initial check
            self.updateSessionState()
            
            // Periodically check for session changes
            // Since Clerk doesn't expose objectWillChange, we'll use a timer
            Timer.publish(every: 1.0, on: .main, in: .common)
                .autoconnect()
                .sink { [weak self] _ in
                    self?.updateSessionState()
                }
                .store(in: &cancellables)
        }
    }
    
    @MainActor
    private func updateSessionState() {
        _ = clerk.session != nil
        let previousSessionId = self.clerkSession?.id
        let currentSessionId = clerk.session?.id
        
        // Only update if session actually changed
        if previousSessionId != currentSessionId {
            print("🔄 Session change detected: \(previousSessionId ?? "nil") -> \(currentSessionId ?? "nil")")
            
            self.clerkSession = clerk.session
            
            if let _ = clerk.session, let user = clerk.user {
                // Only authenticate if we have both a valid session AND user
                print("🔄 Clerk session state: signed in with user \(user.id)")
                self.updateLocalUser(clerkUser: user)
                // isAuthenticated will be set by updateLocalUser if successful
                
                // Clear any remaining sign up state
                self.currentSignUp = nil
                self.pendingSignUpCredentials = nil
                self.needsEmailVerification = false
            } else {
                // No valid session or user
                print("🔄 Clerk session state: signed out")
                self.isAuthenticated = false
                self.currentUser = nil
                userDefaults.removeObject(forKey: userKey)
            }
        }
    }
    
    private func updateLocalUser(clerkUser: Any) {
        // Use Mirror to access properties dynamically due to type naming conflict
        let mirror = Mirror(reflecting: clerkUser)
        
        // Extract properties using Mirror
        var userId = ""
        var emailAddresses: [Any] = []
        var firstName: String?
        var lastName: String?
        var username: String?
        
        for child in mirror.children {
            switch child.label {
            case "id":
                userId = child.value as? String ?? ""
            case "emailAddresses":
                emailAddresses = child.value as? [Any] ?? []
            case "firstName":
                firstName = child.value as? String
            case "lastName":
                lastName = child.value as? String
            case "username":
                username = child.value as? String
            default:
                break
            }
        }
        
        // Extract email from first email address
        var email = ""
        if let firstEmailAddress = emailAddresses.first {
            let emailMirror = Mirror(reflecting: firstEmailAddress)
            for child in emailMirror.children {
                if child.label == "emailAddress" {
                    email = child.value as? String ?? ""
                    break
                }
            }
        }
        
        let displayName = [firstName, lastName]
            .compactMap { $0 }
            .joined(separator: " ")
            .trimmingCharacters(in: .whitespaces)
        
        // Don't proceed if we don't have a valid email
        guard !email.isEmpty else {
            print("❌ No email found in Clerk user object")
            self.currentUser = nil
            self.isAuthenticated = false
            return
        }
        
        // Create user object with Clerk data
        let localUser = LocalUser(
            id: userId,
            email: email,
            name: displayName.isEmpty ? email.components(separatedBy: "@").first ?? "User" : displayName,
            profile: UserProfile(
                id: userId,
                email: email,
                username: username,
                fullName: displayName.isEmpty ? email.components(separatedBy: "@").first ?? "User" : displayName,
                dateOfBirth: nil,
                height: nil,
                heightUnit: "cm",
                gender: nil,
                activityLevel: nil,
                goalWeight: nil,
                goalWeightUnit: "kg"
            )
        )
        
        self.currentUser = localUser
        self.isAuthenticated = true  // Set authenticated only after successful user creation
        
        // Store user data
        if let encoded = try? JSONEncoder().encode(localUser) {
            userDefaults.set(encoded, forKey: userKey)
        }
        
        print("✅ Updated local user: \(email)")
        
        // TODO: Load full profile from Supabase when API is ready
        // Disabled to prevent repeated failed API calls
        // Task {
        //     await self.loadUserProfile(userId: userId)
        // }
    }
    
    func login(email: String, password: String) async throws {
        // Mock authentication for development
        if Constants.useMockAuth {
            print("🧪 Using mock authentication for development")
            
            // Create mock user
            let mockUser = LocalUser(
                id: "mock_user_123",
                email: email,
                name: "Test User",
                profile: UserProfile(
                    id: "mock_user_123",
                    email: email,
                    username: nil,
                    fullName: "Test User",
                    dateOfBirth: nil,
                    height: nil,
                    heightUnit: "cm",
                    gender: nil,
                    activityLevel: nil,
                    goalWeight: nil,
                    goalWeightUnit: "kg"
                )
            )
            
            await MainActor.run {
                self.currentUser = mockUser
                self.isAuthenticated = true
                print("✅ Mock authentication successful")
            }
            return
        }
        
        // Real authentication using Clerk SDK
        guard isClerkLoaded else {
            throw AuthError.clerkNotInitialized
        }
        
        do {
            // Create a sign in with email and password
            _ = try await SignIn.create(
                strategy: .identifier(email, password: password)
            )
            
            print("✅ Sign in successful")
            // The session observer will automatically update isAuthenticated
        } catch {
            print("❌ Login failed: \(error)")
            throw error
        }
    }
    
    func signUp(email: String, password: String, name: String) async throws {
        // Mock authentication for development
        if Constants.useMockAuth {
            print("🧪 Using mock sign up for development")
            
            // Simulate the sign up process
            try await Task.sleep(nanoseconds: 500_000_000) // 0.5 second delay
            
            // Create mock user
            let mockUser = LocalUser(
                id: "mock_user_123",
                email: email,
                name: name.isEmpty ? "Test User" : name,
                profile: UserProfile(
                    id: "mock_user_123",
                    email: email,
                    username: nil,
                    fullName: name.isEmpty ? "Test User" : name,
                    dateOfBirth: nil,
                    height: nil,
                    heightUnit: "cm",
                    gender: nil,
                    activityLevel: nil,
                    goalWeight: nil,
                    goalWeightUnit: "kg"
                )
            )
            
            await MainActor.run {
                self.currentUser = mockUser
                self.isAuthenticated = true
                print("✅ Mock sign up successful")
            }
            return
        }
        
        // Real sign up using Clerk SDK
        guard isClerkLoaded else {
            throw AuthError.clerkNotInitialized
        }
        
        do {
            // Create sign up with email and password
            // Note: If your Clerk instance requires legal acceptance, 
            // you may need to pass additional parameters here
            let signUp = try await SignUp.create(
                strategy: .standard(
                    emailAddress: email,
                    password: password
                )
            )
            
            // Store the sign up instance and credentials for verification
            self.currentSignUp = signUp
            self.pendingSignUpCredentials = (email: email, password: password)
            
            // Prepare email verification
            try await signUp.prepareVerification(strategy: .emailCode)
            
            await MainActor.run {
                self.needsEmailVerification = true
            }
            
            print("✅ Sign up created, email verification required")
        } catch {
            print("❌ Sign up failed: \(error)")
            throw error
        }
    }
    
    func logout() async {
        do {
            try await clerk.signOut()
            print("✅ Signed out successfully")
        } catch {
            print("❌ Logout error: \(error)")
        }
        
        await MainActor.run {
            self.clerkSession = nil
            self.currentUser = nil
            self.isAuthenticated = false
            self.currentSignUp = nil
            self.pendingSignUpCredentials = nil
            self.needsEmailVerification = false
        }
        
        // Clear stored data
        userDefaults.removeObject(forKey: userKey)
    }
    
    private func loadUserProfile(userId: String) async {
        guard let token = await getSupabaseToken() else {
            print("❌ No Supabase token available")
            return
        }
        
        do {
            let profiles: [Profile] = try await supabase.query(
                table: "profiles",
                accessToken: token,
                filter: "id=eq.\(userId)"
            )
            
            if let profile = profiles.first {
                let user = LocalUser(
                    id: profile.id,
                    email: profile.email,
                    name: profile.fullName,
                    profile: UserProfile(
                        id: profile.id,
                        email: profile.email,
                        username: profile.username,
                        fullName: profile.fullName,
                        dateOfBirth: profile.dateOfBirth,
                        height: profile.height,
                        heightUnit: profile.heightUnit ?? "cm",
                        gender: profile.gender,
                        activityLevel: profile.activityLevel,
                        goalWeight: profile.goalWeight,
                        goalWeightUnit: profile.goalWeightUnit ?? "kg"
                    )
                )
                
                await MainActor.run {
                    self.currentUser = user
                }
                
                // Store user data
                if let encoded = try? JSONEncoder().encode(user) {
                    userDefaults.set(encoded, forKey: userKey)
                }
            } else {
                // Profile doesn't exist, create it
                if let clerkUser = await MainActor.run(body: { clerk.user }) {
                    // Use Mirror to extract properties to avoid type conflicts
                    let mirror = Mirror(reflecting: clerkUser)
                    var email = ""
                    var username: String?
                    var firstName: String?
                    var lastName: String?
                    for child in mirror.children {
                        switch child.label {
                        case "emailAddresses":
                            if let emailAddresses = child.value as? [Any], let firstEmail = emailAddresses.first {
                                let emailMirror = Mirror(reflecting: firstEmail)
                                for emailChild in emailMirror.children {
                                    if emailChild.label == "emailAddress" {
                                        email = emailChild.value as? String ?? ""
                                        break
                                    }
                                }
                            }
                        case "username":
                            username = child.value as? String
                        case "firstName":
                            firstName = child.value as? String
                        case "lastName":
                            lastName = child.value as? String
                        default:
                            break
                        }
                    }
                    
                    let fullName = [firstName, lastName].compactMap { $0 }.joined(separator: " ")
                    
                    let profile = Profile(
                        id: userId,
                        email: email,
                        username: username,
                        fullName: fullName,
                        dateOfBirth: nil,
                        height: nil,
                        heightUnit: nil,
                        gender: nil,
                        activityLevel: nil,
                        goalWeight: nil,
                        goalWeightUnit: nil,
                        avatarUrl: nil,
                        createdAt: Date(),
                        updatedAt: Date()
                    )
                    
                    try await supabase.insert(table: "profiles", data: profile, accessToken: token)
                    await loadUserProfile(userId: userId)  // Reload after creating
                }
            }
        } catch {
            print("❌ Failed to load user profile: \(error)")
        }
    }
    
    // MARK: - Apple Sign In
    
    func startAppleSignIn() {
        print("🍎 startAppleSignIn called")
        
        guard isClerkLoaded else {
            print("❌ Clerk not initialized")
            return
        }
        
        Task {
            do {
                // Use Clerk SDK for Apple Sign In
                let signIn = try await SignIn.create(strategy: .oauth(provider: .apple))
                try await signIn.authenticateWithRedirect()
                print("✅ Apple Sign In initiated through Clerk SDK")
            } catch {
                print("❌ Apple Sign In failed: \(error)")
            }
        }
    }
    
    func signInWithAppleCredentials(_ appleIDCredential: ASAuthorizationAppleIDCredential) async throws {
        print("🍎 Native Apple Sign In with credentials")
        print("🍎 User ID: \(appleIDCredential.user)")
        
        guard isClerkLoaded else {
            print("❌ Clerk not initialized")
            throw AuthError.clerkNotInitialized
        }
        
        // Extract the identity token
        guard let identityToken = appleIDCredential.identityToken,
              let idTokenString = String(data: identityToken, encoding: .utf8) else {
            print("❌ Failed to get Apple ID token")
            throw AuthError.invalidCredentials
        }
        
        print("🍎 ID Token received: \(idTokenString.prefix(20))...")
        
        do {
            // Use Clerk's ID token authentication
            let result = try await SignIn.authenticateWithIdToken(provider: .apple, idToken: idTokenString)
            
            // Handle the transfer flow result
            switch result {
            case .signIn(_):
                print("✅ Apple Sign In successful")
                // The session observer will handle updating the auth state
                
                // Store the user's name if this is their first sign in
                if let fullName = appleIDCredential.fullName {
                    let name = [fullName.givenName, fullName.familyName]
                        .compactMap { $0 }
                        .joined(separator: " ")
                    
                    if !name.isEmpty {
                        UserDefaults.standard.set(name, forKey: "appleSignInName")
                    }
                }
                
            case .signUp(_):
                print("📝 New user - completing sign up")
                // For new users, we might need to complete the sign up process
                // The session observer will handle the auth state
                
                // Store the user's name for onboarding
                if let fullName = appleIDCredential.fullName {
                    let name = [fullName.givenName, fullName.familyName]
                        .compactMap { $0 }
                        .joined(separator: " ")
                    
                    if !name.isEmpty {
                        UserDefaults.standard.set(name, forKey: "appleSignInName")
                    }
                }
            }
        } catch {
            print("❌ Apple Sign In with ID token failed: \(error)")
            print("❌ Error details: \(String(describing: error))")
            print("❌ Error type: \(type(of: error))")
            
            // Log the full error description
            if let nsError = error as NSError? {
                print("❌ Error domain: \(nsError.domain)")
                print("❌ Error code: \(nsError.code)")
                print("❌ Error userInfo: \(nsError.userInfo)")
            }
            
            // Show user-friendly error for authorization issues
            let errorString = String(describing: error).lowercased()
            if errorString.contains("authorization_invalid") {
                showAuthError("Apple Sign In is not properly configured. Please try signing in with email instead.")
            } else {
                showAuthError("Sign in failed. Please try again.")
            }
            
            throw error
        }
    }
    
    
    // MARK: - Helper Methods
    
    private func showAuthError(_ message: String) {
        DispatchQueue.main.async {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootViewController = windowScene.windows.first?.rootViewController {
                let alert = UIAlertController(title: "Authentication Error", message: message, preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .default))
                rootViewController.present(alert, animated: true)
            }
        }
    }
    
    // MARK: - Email Verification
    
    func verifyEmail(code: String) async throws {
        guard let signUp = currentSignUp else {
            print("❌ No active sign up to verify")
            throw AuthError.clerkNotInitialized
        }
        
        do {
            let result = try await signUp.attemptVerification(strategy: .emailCode(code: code))
            
            print("📧 Verification result status: \(result.status)")
            print("📧 Created session ID: \(result.createdSessionId ?? "nil")")
            print("📧 Verifications: \(String(describing: signUp.verifications))")
            print("📧 Missing fields: \(String(describing: signUp.missingFields))")
            
            // Check verification status
            switch result.status {
            case .complete:
                print("✅ Verification complete")
                if let createdSessionId = result.createdSessionId {
                    // Set the session as active to complete the sign up flow
                    try await clerk.setActive(sessionId: createdSessionId)
                    print("✅ Email verified and session activated successfully")
                    
                    // Force an immediate session state update
                    await MainActor.run {
                        self.updateSessionState()
                    }
                } else {
                    print("⚠️ Sign up complete but no session ID returned")
                    // Try to sign in with credentials
                    if let credentials = pendingSignUpCredentials {
                        print("🔄 Attempting to sign in after verification")
                        try await login(email: credentials.email, password: credentials.password)
                    }
                }
                
            case .missingRequirements:
                print("⚠️ Missing requirements after verification")
                print("📝 Missing fields: \(signUp.missingFields ?? [])")
                
                // For now, show an error to the user about missing requirements
                // In a production app, you would handle legal acceptance properly
                let missingFieldsString = (signUp.missingFields ?? []).joined(separator: ", ")
                let errorMessage = missingFieldsString.isEmpty 
                    ? "Additional requirements needed to complete sign up." 
                    : "Please accept the terms of service to continue. Missing: \(missingFieldsString)"
                let error = NSError(
                    domain: "AuthManager",
                    code: 1001,
                    userInfo: [NSLocalizedDescriptionKey: errorMessage]
                )
                throw error
                
            default:
                print("❓ Unexpected verification status: \(result.status)")
            }
            
            // Clear email verification flag only when we're actually done
            // Don't clear it if we're still in the sign up process
            await MainActor.run {
                if self.isAuthenticated {
                    self.needsEmailVerification = false
                    self.currentSignUp = nil
                    self.pendingSignUpCredentials = nil
                }
            }
            
            // The session observer will now detect the active session and update isAuthenticated
        } catch {
            print("❌ Email verification failed: \(error)")
            // Don't clear the verification state on error
            // This keeps the user on the verification screen
            throw error
        }
    }
    
    func resendVerificationEmail() async throws {
        guard let signUp = currentSignUp else {
            print("❌ No active sign up to resend verification")
            throw AuthError.clerkNotInitialized
        }
        
        do {
            try await signUp.prepareVerification(strategy: .emailCode)
            print("✅ Verification email resent successfully")
        } catch {
            print("❌ Failed to resend verification email: \(error)")
            throw error
        }
    }
    
    // MARK: - Supabase Integration
    
    private func getSupabaseToken() async -> String? {
        // For now, we'll use the Supabase anon key
        // In production, you'd want to exchange the Clerk token for a Supabase token
        // through your backend API
        return Constants.supabaseAnonKey
    }
}

