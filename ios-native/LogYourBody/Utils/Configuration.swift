//
//  Configuration.swift
//  LogYourBody
//
//  Configuration values from Config.xcconfig
//

import Foundation

enum Configuration {
    enum Error: Swift.Error {
        case missingKey, invalidValue
    }
    
    static func value<T>(for key: String) throws -> T where T: LosslessStringConvertible {
        guard let object = Bundle.main.object(forInfoDictionaryKey: key) else {
            throw Error.missingKey
        }
        
        switch object {
        case let value as T:
            return value
        case let string as String:
            guard let value = T(string) else { fallthrough }
            return value
        default:
            throw Error.invalidValue
        }
    }
    
    static var supabaseURL: String {
        do {
            return try Configuration.value(for: "SUPABASE_URL")
        } catch {
            print("⚠️ SUPABASE_URL not configured in Config.xcconfig")
            return ""
        }
    }
    
    static var supabaseAnonKey: String {
        do {
            return try Configuration.value(for: "SUPABASE_ANON_KEY")
        } catch {
            print("⚠️ SUPABASE_ANON_KEY not configured in Config.xcconfig")
            return ""
        }
    }
    
    static var apiBaseURL: String {
        do {
            #if DEBUG
            return try Configuration.value(for: "API_BASE_URL_DEBUG")
            #else
            return try Configuration.value(for: "API_BASE_URL_RELEASE")
            #endif
        } catch {
            print("⚠️ API_BASE_URL not configured in Config.xcconfig")
            #if DEBUG
            return "http://localhost:3000"
            #else
            return "https://logyourbody.com"
            #endif
        }
    }
}