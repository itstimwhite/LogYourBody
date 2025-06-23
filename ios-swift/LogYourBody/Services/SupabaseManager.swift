import Foundation
import Supabase

class SupabaseManager {
    static let shared = SupabaseManager()
    
    private(set) var client: SupabaseClient!
    
    private init() {}
    
    func configure() {
        client = SupabaseClient(
            supabaseURL: URL(string: Configuration.supabaseURL)!,
            supabaseKey: Configuration.supabaseAnonKey
        )
    }
}

// MARK: - Auth Extensions
extension SupabaseManager {
    func signIn(email: String, password: String) async throws -> Session {
        let response = try await client.auth.signIn(email: email, password: password)
        return response.session
    }
    
    func signUp(email: String, password: String) async throws -> Session {
        let response = try await client.auth.signUp(email: email, password: password)
        return response.session
    }
    
    func signOut() async throws {
        try await client.auth.signOut()
    }
    
    func getCurrentSession() async throws -> Session? {
        return try await client.auth.session
    }
}

// MARK: - Database Extensions
extension SupabaseManager {
    func fetchProfile(userId: String) async throws -> UserProfile? {
        let response = try await client
            .from("profiles")
            .select()
            .eq("id", value: userId)
            .single()
            .execute()
        
        return try? JSONDecoder().decode(UserProfile.self, from: response.data)
    }
    
    func updateProfile(_ profile: UserProfile) async throws {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(profile)
        
        try await client
            .from("profiles")
            .upsert(data)
            .execute()
    }
    
    func fetchBodyMetrics(userId: String, limit: Int = 30) async throws -> [BodyMetric] {
        let response = try await client
            .from("body_metrics")
            .select()
            .eq("user_id", value: userId)
            .order("date", ascending: false)
            .limit(limit)
            .execute()
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode([BodyMetric].self, from: response.data)
    }
    
    func insertBodyMetric(_ metric: BodyMetric) async throws {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(metric)
        
        try await client
            .from("body_metrics")
            .insert(data)
            .execute()
    }
}