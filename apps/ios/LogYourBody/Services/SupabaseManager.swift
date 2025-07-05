//
//  SupabaseManager.swift
//  LogYourBody
//
//  Manages Supabase integration with Clerk JWT authentication
//

import Foundation
import Clerk


@MainActor
class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()
    
    private let supabaseURL = Constants.supabaseURL
    private let supabaseAnonKey = Constants.supabaseAnonKey
    
    private init() {}
    
    // MARK: - JWT Token Management
    
    private func getSupabaseJWT() async throws -> String {
        guard let session = Clerk.shared.session else {
            throw SupabaseError.notAuthenticated
        }
        
        // Get JWT token from Clerk
        // For native integration, we use the session token directly
        let tokenResource = try await session.getToken()
        
        guard let jwtString = tokenResource?.jwt else {
            throw SupabaseError.tokenGenerationFailed
        }
        
        return jwtString
    }
    
    // MARK: - Profile Operations
    
    func fetchProfile(userId: String) async throws -> UserProfile? {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/profiles?id=eq.\(userId)&select=*")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 200 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let profiles = try decoder.decode([UserProfile].self, from: data)
        
        return profiles.first
    }
    
    func upsertProfile(_ profile: UserProfile) async throws {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/profiles")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal,resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(profile)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 201 && httpResponse.statusCode != 204 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Weight Operations
    
    func fetchWeights(userId: String, limit: Int = 30) async throws -> [WeightEntry] {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/weight_logs?user_id=eq.\(userId)&order=logged_at.desc&limit=\(limit)")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 200 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        // Decode from Supabase format
        let weightLogs = try decoder.decode([WeightLog].self, from: data)
        
        // Convert to WeightEntry format
        return weightLogs.map { log in
            WeightEntry(
                id: log.id,
                userId: log.userId,
                weight: log.weight,
                weightUnit: log.weightUnit,
                notes: log.notes,
                loggedAt: log.loggedAt
            )
        }
    }
    
    func saveWeight(_ entry: WeightEntry) async throws {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/weight_logs")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
        
        // Convert to Supabase format
        let weightLog = WeightLog(
            id: entry.id,
            userId: entry.userId,
            weight: entry.weight,
            weightUnit: entry.weightUnit,
            notes: entry.notes,
            loggedAt: entry.loggedAt
        )
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(weightLog)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 201 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Body Metrics Operations
    
    func fetchBodyMetrics(userId: String, limit: Int = 30) async throws -> [BodyMetrics] {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/body_metrics?user_id=eq.\(userId)&order=date.desc&limit=\(limit)")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 200 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([BodyMetrics].self, from: data)
    }
    
    func saveBodyMetrics(_ metrics: BodyMetrics) async throws {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/body_metrics")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal,resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(metrics)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 201 && httpResponse.statusCode != 204 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Daily Metrics Operations
    
    func fetchDailyMetrics(userId: String, from date: Date) async throws -> [DailyMetrics] {
        let jwt = try await getSupabaseJWT()
        
        let dateFormatter = ISO8601DateFormatter()
        let fromDateString = dateFormatter.string(from: date)
        
        let url = URL(string: "\(supabaseURL)/rest/v1/daily_metrics?user_id=eq.\(userId)&date=gte.\(fromDateString)&order=date.desc")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 200 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([DailyMetrics].self, from: data)
    }
    
    func saveDailyMetrics(_ metrics: DailyMetrics) async throws {
        let jwt = try await getSupabaseJWT()
        
        let url = URL(string: "\(supabaseURL)/rest/v1/daily_metrics")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal,resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(metrics)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.networkError
        }
        
        if httpResponse.statusCode == 401 {
            throw SupabaseError.unauthorized
        }
        
        if httpResponse.statusCode != 201 && httpResponse.statusCode != 204 {
            throw SupabaseError.httpError(httpResponse.statusCode)
        }
    }
}

// MARK: - Supabase Models

private struct WeightLog: Codable {
    let id: String
    let userId: String
    let weight: Double
    let weightUnit: String
    let notes: String?
    let loggedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case weight
        case weightUnit = "weight_unit"
        case notes
        case loggedAt = "logged_at"
    }
}

