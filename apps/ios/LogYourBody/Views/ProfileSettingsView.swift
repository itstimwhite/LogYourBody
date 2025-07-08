//
//  ProfileSettingsView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI
import Clerk

struct ProfileSettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss
    @State private var editableName: String = ""
    @State private var editableDateOfBirth: Date = Date()
    @State private var editableHeightFeet: Int = 5
    @State private var editableHeightInches: Int = 8
    @State private var editableGender: OnboardingData.Gender?
    @State private var showingSaveAlert = false
    @State private var hasChanges = false
    
    var body: some View {
        Form {
            // Profile Header Section
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 12) {
                        // Profile Avatar
                        ZStack {
                            Circle()
                                .fill(Color.appTextTertiary.opacity(0.2))
                                .frame(width: 80, height: 80)
                            
                            Text(profileInitials)
                                .font(.system(size: 32, weight: .semibold))
                                .foregroundColor(.appText)
                        }
                        
                        VStack(spacing: 4) {
                            Text(authManager.currentUser?.displayName ?? authManager.currentUser?.name ?? "User")
                                .font(.headline)
                            
                            Text(authManager.currentUser?.email ?? "")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            }
            
            // Basic Information
            Section("Basic Information") {
                HStack {
                    Label("Name", systemImage: "person.fill")
                    Spacer()
                    TextField("Your name", text: $editableName)
                        .multilineTextAlignment(.trailing)
                        .onChange(of: editableName) { _, _ in hasChanges = true }
                }
                
                DatePicker(
                    selection: $editableDateOfBirth,
                    displayedComponents: .date
                ) {
                    Label("Date of Birth", systemImage: "calendar")
                }
                .onChange(of: editableDateOfBirth) { _, _ in hasChanges = true }
                
                Picker(selection: $editableGender) {
                    Text("Not specified").tag(nil as OnboardingData.Gender?)
                    ForEach(OnboardingData.Gender.allCases, id: \.self) { gender in
                        Text(gender.rawValue).tag(gender as OnboardingData.Gender?)
                    }
                } label: {
                    Label("Gender", systemImage: "person.2.fill")
                }
                .onChange(of: editableGender) { _, _ in hasChanges = true }
            }
            
            // Physical Information
            Section("Physical Information") {
                HStack {
                    Label("Height", systemImage: "ruler.fill")
                    Spacer()
                    HStack(spacing: 4) {
                        Picker("Feet", selection: $editableHeightFeet) {
                            ForEach(3...8, id: \.self) { feet in
                                Text("\(feet)'").tag(feet)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .onChange(of: editableHeightFeet) { _, _ in hasChanges = true }
                        
                        Picker("Inches", selection: $editableHeightInches) {
                            ForEach(0...11, id: \.self) { inches in
                                Text("\(inches)\"").tag(inches)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .onChange(of: editableHeightInches) { _, _ in hasChanges = true }
                    }
                }
            }
            
            // Additional Actions
            Section {
                NavigationLink(destination: ExportDataView()) {
                    Label("Export Data", systemImage: "square.and.arrow.up")
                }
                
                NavigationLink(destination: DeleteAccountView()) {
                    Label("Delete Account", systemImage: "trash")
                        .foregroundColor(.red)
                }
            }
        }
        .navigationTitle("Profile Settings")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Save") {
                    saveProfile()
                }
                .disabled(!hasChanges)
            }
        }
        .onAppear {
            loadCurrentProfile()
        }
        .alert("Profile Updated", isPresented: $showingSaveAlert) {
            Button("OK") { }
        } message: {
            Text("Your profile has been successfully updated.")
        }
    }
    
    private var profileInitials: String {
        let name = authManager.currentUser?.name ?? authManager.currentUser?.email ?? ""
        let components = name.components(separatedBy: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        } else {
            return String(name.prefix(2)).uppercased()
        }
    }
    
    private func loadCurrentProfile() {
        guard let user = authManager.currentUser else { return }
        
        editableName = user.name ?? ""
        editableDateOfBirth = user.profile?.dateOfBirth ?? Date()
        
        if let height = user.profile?.height {
            editableHeightFeet = Int(height) / 12
            editableHeightInches = Int(height) % 12
        }
        
        if let genderString = user.profile?.gender {
            editableGender = OnboardingData.Gender(rawValue: genderString)
        }
        
        hasChanges = false
    }
    
    private func saveProfile() {
        guard let currentUser = authManager.currentUser else { return }
        
        let heightInInches = Double((editableHeightFeet * 12) + editableHeightInches)
        
        // Show loading while saving
        hasChanges = false
        
        Task {
            do {
                // Update name in Clerk if it changed
                if let clerkUser = Clerk.shared.user {
                    // Parse the name into first and last name
                    let nameComponents = editableName.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: " ")
                    let firstName = nameComponents.first ?? ""
                    let lastName = nameComponents.dropFirst().joined(separator: " ")
                    
                    // Update the user profile in Clerk
                    try await clerkUser.update(.init(
                        firstName: firstName.isEmpty ? nil : firstName,
                        lastName: lastName.isEmpty ? nil : lastName
                    ))
                }
                
                // Create updated profile
                let updatedProfile = UserProfile(
                    id: currentUser.id,
                    email: currentUser.email,
                    username: nil,
                    fullName: editableName.isEmpty ? nil : editableName,
                    dateOfBirth: editableDateOfBirth,
                    height: heightInInches,
                    heightUnit: "in",
                    gender: editableGender?.rawValue,
                    activityLevel: nil,
                    goalWeight: nil,
                    goalWeightUnit: nil
                )
                
                let updatedUser = User(
                    id: currentUser.id,
                    email: currentUser.email,
                    name: editableName.isEmpty ? nil : editableName,
                    profile: updatedProfile
                )
                
                await MainActor.run {
                    // Update the auth manager
                    authManager.currentUser = updatedUser
                    
                    // Save to UserDefaults
                    if let userData = try? JSONEncoder().encode(updatedUser) {
                        UserDefaults.standard.set(userData, forKey: Constants.currentUserKey)
                    }
                    
                    showingSaveAlert = true
                }
            } catch {
                await MainActor.run {
                    hasChanges = true
                    // Show error alert
                    showingSaveAlert = false
                    // You might want to add an error alert here
                    print("Failed to update profile: \(error)")
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        ProfileSettingsView()
            .environmentObject({
                let authManager = AuthManager()
                authManager.currentUser = User(
                    id: "1",
                    email: "john@example.com",
                    name: "John Doe",
                    profile: UserProfile(
                        id: "1",
                        email: "john@example.com",
                        username: nil,
                        fullName: "John Doe",
                        dateOfBirth: Calendar.current.date(byAdding: .year, value: -25, to: Date()),
                        height: 70,
                        heightUnit: "in",
                        gender: "Male",
                        activityLevel: nil,
                        goalWeight: nil,
                        goalWeightUnit: nil
                    )
                )
                return authManager
            }())
    }
}