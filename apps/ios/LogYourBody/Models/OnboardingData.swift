//
//  OnboardingData.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import Foundation

struct OnboardingData {
    var name: String = ""
    var dateOfBirth: Date?
    var heightFeet: Int = 5
    var heightInches: Int = 8
    var gender: Gender? = .male  // Default to male
    var notificationsEnabled: Bool = false
    var healthKitEnabled: Bool = false
    var hasUploadedPhotos: Bool = false
    
    enum Gender: String, CaseIterable {
        case male = "Male"
        case female = "Female"
        
        var icon: String {
            switch self {
            case .male: return "♂"
            case .female: return "♀"
            }
        }
    }
    
    var totalHeightInInches: Int {
        return (heightFeet * 12) + heightInches
    }
    
    var isProfileComplete: Bool {
        return !name.isEmpty && dateOfBirth != nil && gender != nil
    }
}