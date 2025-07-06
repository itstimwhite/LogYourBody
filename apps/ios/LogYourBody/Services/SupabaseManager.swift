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

    private func performRequest(
        path: String,
        method: String,
        token: String,
        prefer: String? = nil,
        body: Data? = nil
    ) async throws -> (Data, HTTPURLResponse) {
        let url = URL(string: "\(supabaseURL)/rest/v1/\(path)")!
        var headers: [String: String] = [
            "apikey": supabaseAnonKey,
            "Authorization": "Bearer \(token)",
            "Content-Type": "application/json"
        ]
        if let prefer = prefer {
            headers["Prefer"] = prefer
        }
        return try await HTTPClient.shared.sendRequest(
            url: url,
            method: method,
            headers: headers,
            body: body
        )
    }
    
    // MARK: - JWT Token Management
    
    private func getSupabaseJWT() async throws -> String {
        guard let session = Clerk.shared.session else {
            throw SupabaseError.notAuthenticated
        }
        
        // Get JWT token from Clerk using the new native integration pattern
        // No template parameter needed - Supabase will validate the Clerk session token directly
        let tokenResource = try await session.getToken()
        
        guard let jwtString = tokenResource?.jwt else {
            throw SupabaseError.tokenGenerationFailed
        }
        
        return jwtString
    }
    
    // MARK: - Batch Operations
    
    func upsertBodyMetricsBatch(_ metrics: [[String: Any]], token: String) async throws -> [[String: Any]] {
        let jsonData = try JSONSerialization.data(withJSONObject: metrics)

        print("📤 Sending \(metrics.count) body metrics to Supabase")
        if let jsonString = String(data: jsonData, encoding: .utf8) {
            print("📄 Request body preview: \(String(jsonString.prefix(500)))")
        }

        let (data, response) = try await performRequest(
            path: "body_metrics",
            method: "POST",
            token: token,
            prefer: "return=representation,resolution=merge-duplicates",
            body: jsonData
        )

        print("📡 Supabase body_metrics response: Status \(response.statusCode)")

        guard (200...299).contains(response.statusCode) else {
            if let errorData = String(data: data, encoding: .utf8) {
                print("❌ Supabase body_metrics error: \(errorData)")
            }
            throw SupabaseError.requestFailed
        }

        let result = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] ?? []
        print("✅ Supabase returned \(result.count) body metrics")
        return result
    }
    
    func upsertDailyMetricsBatch(_ metrics: [[String: Any]], token: String) async throws -> [[String: Any]] {
        let jsonData = try JSONSerialization.data(withJSONObject: metrics)

        if let jsonString = String(data: jsonData, encoding: .utf8) {
            print("📤 Sending to Supabase body_metrics:\n   Body: \(jsonString)")
        }

        let (data, response) = try await performRequest(
            path: "daily_metrics",
            method: "POST",
            token: token,
            prefer: "return=representation,resolution=merge-duplicates",
            body: jsonData
        )

        guard (200...299).contains(response.statusCode) else {
            throw SupabaseError.requestFailed
        }

        let result = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] ?? []
        return result
    }
    
    func fetchBodyMetrics(userId: String, since: Date, token: String) async throws -> [[String: Any]] {
        let sinceString = ISO8601DateFormatter().string(from: since)

        let path = "body_metrics?user_id=eq.\(userId)&updated_at=gte.\(sinceString)&order=created_at.desc"
        let (data, response) = try await performRequest(
            path: path,
            method: "GET",
            token: token
        )

        guard (200...299).contains(response.statusCode) else {
            throw SupabaseError.requestFailed
        }

        let result = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] ?? []
        return result
    }
    
    func fetchDailyMetrics(userId: String, since: Date, token: String) async throws -> [[String: Any]] {
        let sinceString = ISO8601DateFormatter().string(from: since)

        let path = "daily_metrics?user_id=eq.\(userId)&updated_at=gte.\(sinceString)&order=date.desc"
        let (data, response) = try await performRequest(
            path: path,
            method: "GET",
            token: token
        )

        guard (200...299).contains(response.statusCode) else {
            throw SupabaseError.requestFailed
        }

        let result = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] ?? []
        return result
    }
    
    func fetchProfile(userId: String, token: String) async throws -> [String: Any]? {
        let (data, response) = try await performRequest(
            path: "user_profiles?id=eq.\(userId)",
            method: "GET",
            token: token
        )

        guard (200...299).contains(response.statusCode) else {
            throw SupabaseError.requestFailed
        }

        let result = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] ?? []
        return result.first
    }
    
    func updateProfile(_ profile: [String: Any], token: String) async throws {
        guard let userId = profile["id"] as? String else { throw SupabaseError.invalidData }
        
        let url = URL(string: "\(supabaseURL)/rest/v1/user_profiles?id=eq.\(userId)")!
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let jsonData = try JSONSerialization.data(withJSONObject: profile)
        request.httpBody = jsonData
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw SupabaseError.requestFailed
        }
    }
    
    func upsertData(table: String, data: Data, token: String) async throws {
        let (_, response) = try await performRequest(
            path: table,
            method: "POST",
            token: token,
            prefer: "resolution=merge-duplicates",
            body: data
        )

        guard (200...299).contains(response.statusCode) else {
            throw SupabaseError.requestFailed
        }
    }

    func deleteData(table: String, id: String, token: String) async throws {
        let (_, response) = try await performRequest(
            path: "\(table)?id=eq.\(id)",
            method: "DELETE",
            token: token
        )

        guard (200...299).contains(response.statusCode) else {
            throw SupabaseError.requestFailed
        }
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

