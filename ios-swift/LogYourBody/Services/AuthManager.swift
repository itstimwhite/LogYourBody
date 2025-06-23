import Foundation
import Supabase
import Combine

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated = false
    @Published var isLoading = true
    @Published var currentUser: User?
    @Published var currentSession: Session?
    
    private var authStateListener: Task<Void, Never>?
    
    private init() {
        setupAuthListener()
    }
    
    deinit {
        authStateListener?.cancel()
    }
    
    private func setupAuthListener() {
        authStateListener = Task {
            for await (event, session) in SupabaseManager.shared.client.auth.authStateChanges {
                await MainActor.run {
                    switch event {
                    case .signedIn:
                        self.currentSession = session
                        self.currentUser = session?.user
                        self.isAuthenticated = true
                    case .signedOut:
                        self.currentSession = nil
                        self.currentUser = nil
                        self.isAuthenticated = false
                    case .userUpdated:
                        self.currentUser = session?.user
                    default:
                        break
                    }
                }
            }
        }
    }
    
    func checkAuthStatus() async {
        do {
            let session = try await SupabaseManager.shared.getCurrentSession()
            await MainActor.run {
                self.currentSession = session
                self.currentUser = session?.user
                self.isAuthenticated = session != nil
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.isAuthenticated = false
                self.isLoading = false
            }
        }
    }
    
    func signIn(email: String, password: String) async throws {
        let session = try await SupabaseManager.shared.signIn(email: email, password: password)
        await MainActor.run {
            self.currentSession = session
            self.currentUser = session.user
            self.isAuthenticated = true
        }
    }
    
    func signUp(email: String, password: String) async throws {
        let session = try await SupabaseManager.shared.signUp(email: email, password: password)
        await MainActor.run {
            self.currentSession = session
            self.currentUser = session.user
            self.isAuthenticated = true
        }
    }
    
    func signOut() async throws {
        try await SupabaseManager.shared.signOut()
        await MainActor.run {
            self.currentSession = nil
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }
}