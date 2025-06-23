import Foundation

// MARK: - User Profile
struct UserProfile: Codable {
    let id: String
    let email: String?
    let fullName: String?
    let dateOfBirth: String?
    let height: Double?
    let heightUnit: String?
    let gender: String?
    let onboardingCompleted: Bool
    let settings: UserSettings?
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case fullName = "full_name"
        case dateOfBirth = "date_of_birth"
        case height
        case heightUnit = "height_unit"
        case gender
        case onboardingCompleted = "onboarding_completed"
        case settings
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - User Settings
struct UserSettings: Codable {
    let units: UnitSettings?
    let notifications: NotificationSettings?
    let privacy: PrivacySettings?
}

struct UnitSettings: Codable {
    let weight: String  // "kg" or "lbs"
    let height: String  // "cm" or "ft"
    let measurements: String  // "cm" or "in"
}

struct NotificationSettings: Codable {
    let dailyReminders: Bool
    let weeklyProgress: Bool
    let achievements: Bool
    let reminderTime: String?
}

struct PrivacySettings: Codable {
    let shareProgress: Bool
    let publicProfile: Bool
}

// MARK: - Body Metrics
struct BodyMetric: Codable, Identifiable {
    let id: String
    let userId: String
    let date: String
    let weight: Double?
    let weightUnit: String?
    let bodyFatPercentage: Double?
    let bodyFatMethod: String?
    let muscleMass: Double?
    let boneMass: Double?
    let waist: Double?
    let neck: Double?
    let hip: Double?
    let notes: String?
    let photoUrl: String?
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case date
        case weight
        case weightUnit = "weight_unit"
        case bodyFatPercentage = "body_fat_percentage"
        case bodyFatMethod = "body_fat_method"
        case muscleMass = "muscle_mass"
        case boneMass = "bone_mass"
        case waist
        case neck
        case hip
        case notes
        case photoUrl = "photo_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    // Computed properties
    var leanBodyMass: Double? {
        guard let weight = weight,
              let bodyFat = bodyFatPercentage else { return nil }
        return weight * (1 - bodyFat / 100)
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: date) else { return date }
        
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - Progress Photos
struct ProgressPhoto: Codable, Identifiable {
    let id: String
    let userId: String
    let date: String
    let photoUrl: String
    let angle: String?
    let lighting: String?
    let notes: String?
    let createdAt: String
    let updatedAt: String
}