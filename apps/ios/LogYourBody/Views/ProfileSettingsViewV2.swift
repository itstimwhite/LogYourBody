//
//  ProfileSettingsViewV2.swift
//  LogYourBody
//
//  Redesigned profile settings with greyscale theme and improved UX
//

import SwiftUI
import Clerk
import PhotosUI

struct ProfileSettingsViewV2: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss
    // @StateObject private var syncManager = RealtimeSyncManager.shared // TODO: Add RealtimeSyncManager to Xcode project
    
    // Editable fields
    @State private var editableName: String = ""
    @State private var editableDateOfBirth: Date = Date()
    @State private var editableHeightCm: Int = 170
    @State private var editableGender: OnboardingData.Gender = .male
    @State private var useMetricHeight: Bool = false
    
    // UI State
    @State private var showingHeightPicker = false
    @State private var showingDatePicker = false
    @State private var hasChanges = false
    @State private var isSaving = false
    @State private var showingSaveSuccess = false
    
    // Photo picker
    @State private var showingPhotoPicker = false
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var isUploadingPhoto = false
    @State private var profileImageURL: String? = nil
    
    var body: some View {
        ZStack {
            // Background
            Color(.systemGroupedBackground)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Profile Header
                    profileHeader
                        .padding(.top)
                    
                    // Basic Information Card
                    basicInformationCard
                    
                    // Physical Information Card
                    physicalInformationCard
                    
                    // Sync Status
                    // TODO: Uncomment when RealtimeSyncManager is added to project
                    // if syncManager.pendingSyncCount > 0 || syncManager.error != nil {
                    //     HStack {
                    //         SyncStatusView()
                    //         Spacer()
                    //     }
                    //     .padding(.horizontal)
                    // }
                    
                    // Additional Actions
                    additionalActionsSection
                }
                .padding(.horizontal)
                .padding(.bottom, 30)
            }
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if isSaving {
                    ProgressView()
                        .scaleEffect(0.8)
                } else if hasChanges {
                    Button("Save") {
                        saveProfile()
                    }
                    .fontWeight(.medium)
                }
            }
        }
        .sheet(isPresented: $showingHeightPicker) {
            ProfileHeightPickerSheet(
                heightCm: $editableHeightCm,
                useMetric: $useMetricHeight,
                hasChanges: $hasChanges
            )
        }
        .sheet(isPresented: $showingDatePicker) {
            DatePickerSheet(
                date: $editableDateOfBirth,
                hasChanges: $hasChanges
            )
        }
        .photosPicker(
            isPresented: $showingPhotoPicker,
            selection: $selectedPhotoItem,
            matching: .images,
            photoLibrary: .shared()
        )
        .onChange(of: selectedPhotoItem) { _, newItem in
            if let newItem {
                Task {
                    await handlePhotoSelection(newItem)
                }
            }
        }
        .onAppear {
            loadCurrentProfile()
        }
        .overlay(
            Group {
                if showingSaveSuccess {
                    successOverlay
                }
            }
        )
    }
    
    // MARK: - View Components
    
    private var basicInformationCard: some View {
        VStack(spacing: 0) {
            sectionHeader("Basic Information")
            
            VStack(spacing: 0) {
                // Name Field
                settingsRow(
                    label: "Full Name",
                    value: editableName.isEmpty ? "Not set" : editableName,
                    showDisclosure: false
                ) {
                    AnyView(
                        TextField("Your name", text: $editableName)
                            .multilineTextAlignment(.trailing)
                            .onChange(of: editableName) { _, _ in hasChanges = true }
                    )
                }
                
                Divider()
                    .padding(.leading, 16)
                
                // Email (read-only)
                settingsRow(
                    label: "Email",
                    value: authManager.currentUser?.email ?? "",
                    showDisclosure: false,
                    isDisabled: true
                )
                
                Divider()
                    .padding(.leading, 16)
                
                // Gender Selector
                genderSelector
            }
            .background(Color(.systemBackground))
            .cornerRadius(10)
        }
    }
    
    private var genderSelector: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Biological Sex")
                .font(.footnote)
                .foregroundColor(.secondary)
                .padding(.horizontal, 16)
                .padding(.top, 12)
            
            HStack(spacing: 0) {
                ForEach(OnboardingData.Gender.allCases, id: \.self) { gender in
                    Button {
                        editableGender = gender
                        hasChanges = true
                    } label: {
                        Text(gender.rawValue)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(editableGender == gender ? .primary : .secondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(
                                editableGender == gender ?
                                Color(.systemGray5) : Color.clear
                            )
                            .cornerRadius(6)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 4)
            .background(Color(.systemGray6))
            .cornerRadius(8)
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
        }
    }
    
    private var physicalInformationCard: some View {
        VStack(spacing: 0) {
            sectionHeader("Physical Information")
            
            VStack(spacing: 0) {
                // Height
                Button {
                    showingHeightPicker = true
                } label: {
                    HStack {
                        Text("Height")
                            .foregroundColor(.primary)
                        Spacer()
                        HStack(spacing: 4) {
                            Text(formattedHeight)
                                .foregroundColor(.primary)
                                .fontWeight(.medium)
                            Image(systemName: "ruler")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Image(systemName: "chevron.right")
                            .font(.caption2)
                            .foregroundColor(Color(.tertiaryLabel))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }
                
                Divider()
                    .padding(.leading, 16)
                
                // Age/Date of Birth
                Button {
                    showingDatePicker = true
                } label: {
                    HStack {
                        Text("Age")
                            .foregroundColor(.primary)
                        Spacer()
                        HStack(spacing: 4) {
                            Text(formattedAge)
                                .foregroundColor(.primary)
                                .fontWeight(.medium)
                            Image(systemName: "calendar")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Image(systemName: "chevron.right")
                            .font(.caption2)
                            .foregroundColor(Color(.tertiaryLabel))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }
            }
            .background(Color(.systemBackground))
            .cornerRadius(10)
        }
    }
    
    private var additionalActionsSection: some View {
        VStack(spacing: 12) {
            NavigationLink(destination: ExportDataView()) {
                HStack {
                    Label("Export Data", systemImage: "square.and.arrow.up")
                        .foregroundColor(.primary)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundColor(Color(.tertiaryLabel))
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
            }
            
            NavigationLink(destination: DeleteAccountView()) {
                HStack {
                    Label("Delete Account", systemImage: "trash")
                        .foregroundColor(.red)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundColor(Color(.tertiaryLabel))
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
            }
        }
        .padding(.top, 10)
    }
    
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                if let urlString = profileImageURL ?? authManager.currentUser?.avatarUrl,
                   let url = URL(string: urlString) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 80, height: 80)
                            .clipShape(Circle())
                    } placeholder: {
                        Circle()
                            .fill(Color(.systemGray5))
                            .frame(width: 80, height: 80)
                            .overlay(
                                ProgressView()
                                    .scaleEffect(0.8)
                            )
                    }
                } else {
                    Circle()
                        .fill(Color(.systemGray5))
                        .frame(width: 80, height: 80)
                    
                    Text(profileInitials)
                        .font(.system(size: 32, weight: .semibold))
                        .foregroundColor(.secondary)
                }
                
                if isUploadingPhoto {
                    Circle()
                        .fill(Color.black.opacity(0.5))
                        .frame(width: 80, height: 80)
                        .overlay(
                            ProgressView()
                                .tint(.white)
                        )
                }
            }
            .overlay(
                Button {
                    showingPhotoPicker = true
                } label: {
                    Circle()
                        .fill(Color(.systemBackground))
                        .frame(width: 28, height: 28)
                        .overlay(
                            Image(systemName: "camera.fill")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        )
                        .shadow(color: .black.opacity(0.1), radius: 2)
                }
                .offset(x: 28, y: 28)
                .disabled(isUploadingPhoto)
            )
            
            // Name and email
            VStack(spacing: 4) {
                Text(authManager.currentUser?.displayName ?? authManager.currentUser?.name ?? "User")
                    .font(.headline)
                
                Text(authManager.currentUser?.email ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private func sectionHeader(_ title: String) -> some View {
        HStack {
            Text(title)
                .font(.footnote)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
                .textCase(.uppercase)
            Spacer()
        }
        .padding(.horizontal)
        .padding(.bottom, 8)
    }
    
    @ViewBuilder
    private func settingsRow(
        label: String,
        value: String,
        showDisclosure: Bool = true,
        isDisabled: Bool = false,
        customContent: (() -> AnyView)? = nil
    ) -> some View {
        HStack {
            Text(label)
                .foregroundColor(isDisabled ? .secondary : .primary)
            
            Spacer()
            
            if let customContent = customContent {
                customContent()
            } else {
                Text(value)
                    .foregroundColor(isDisabled ? Color(.tertiaryLabel) : .secondary)
            }
            
            if showDisclosure && !isDisabled {
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundColor(Color(.tertiaryLabel))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
    
    private var successOverlay: some View {
        VStack {
            Spacer()
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                Text("Profile Updated")
                    .fontWeight(.medium)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
            .shadow(radius: 10)
            .padding(.bottom, 50)
        }
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                    showingSaveSuccess = false
                }
            }
        }
    }
    
    // MARK: - Computed Properties
    
    private var profileInitials: String {
        let name = authManager.currentUser?.name ?? authManager.currentUser?.email ?? ""
        let components = name.components(separatedBy: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        } else {
            return String(name.prefix(2)).uppercased()
        }
    }
    
    private var formattedHeight: String {
        if useMetricHeight {
            return "\(editableHeightCm) cm"
        } else {
            let totalInches = Int(Double(editableHeightCm) / 2.54)
            let feet = totalInches / 12
            let inches = totalInches % 12
            return "\(feet)'\(inches)\""
        }
    }
    
    private var formattedAge: String {
        let age = Calendar.current.dateComponents([.year], from: editableDateOfBirth, to: Date()).year ?? 0
        return age > 0 ? "\(age) years" : "Not set"
    }
    
    // MARK: - Methods
    
    private func loadCurrentProfile() {
        guard let user = authManager.currentUser else { return }
        
        editableName = user.name ?? ""
        editableDateOfBirth = user.profile?.dateOfBirth ?? Date()
        
        if let height = user.profile?.height {
            // Height is stored in inches, convert to cm
            editableHeightCm = Int(height * 2.54)
            useMetricHeight = user.profile?.heightUnit == "cm"
        }
        
        if let genderString = user.profile?.gender {
            editableGender = OnboardingData.Gender(rawValue: genderString) ?? .male
        }
        
        hasChanges = false
    }
    
    private func saveProfile() {
        guard let currentUser = authManager.currentUser else { return }
        
        isSaving = true
        hasChanges = false
        
        Task {
            do {
                // Update Clerk user if name changed
                if let clerkUser = Clerk.shared.user {
                    let nameComponents = editableName.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: " ")
                    let firstName = nameComponents.first ?? ""
                    let lastName = nameComponents.dropFirst().joined(separator: " ")
                    
                    try await clerkUser.update(.init(
                        firstName: firstName.isEmpty ? nil : firstName,
                        lastName: lastName.isEmpty ? nil : lastName
                    ))
                }
                
                // Calculate height in inches for storage
                let heightInInches = useMetricHeight ? Double(editableHeightCm) / 2.54 : Double(editableHeightCm) / 2.54
                
                // Create updated profile
                let updatedProfile = UserProfile(
                    id: currentUser.id,
                    email: currentUser.email,
                    username: currentUser.profile?.username,
                    fullName: editableName.isEmpty ? nil : editableName,
                    dateOfBirth: editableDateOfBirth,
                    height: heightInInches,
                    heightUnit: useMetricHeight ? "cm" : "in",
                    gender: editableGender.rawValue,
                    activityLevel: currentUser.profile?.activityLevel,
                    goalWeight: currentUser.profile?.goalWeight,
                    goalWeightUnit: currentUser.profile?.goalWeightUnit
                )
                
                // Save to Core Data
                CoreDataManager.shared.saveProfile(updatedProfile, userId: currentUser.id, email: currentUser.email)
                
                // Update auth manager
                let updatedUser = User(
                    id: currentUser.id,
                    email: currentUser.email,
                    name: editableName.isEmpty ? nil : editableName,
                    avatarUrl: currentUser.avatarUrl,
                    profile: updatedProfile,
                    onboardingCompleted: currentUser.onboardingCompleted
                )
                
                await MainActor.run {
                    authManager.currentUser = updatedUser
                    
                    // Save to UserDefaults
                    if let userData = try? JSONEncoder().encode(updatedUser) {
                        UserDefaults.standard.set(userData, forKey: Constants.currentUserKey)
                    }
                    
                    isSaving = false
                    withAnimation {
                        showingSaveSuccess = true
                    }
                    
                    // Trigger sync
                    // TODO: Uncomment when RealtimeSyncManager is added to project
                    // syncManager.syncAll()
                }
            } catch {
                await MainActor.run {
                    isSaving = false
                    hasChanges = true
                    print("Failed to update profile: \(error)")
                }
            }
        }
    }
    
    private func handlePhotoSelection(_ item: PhotosPickerItem) async {
        isUploadingPhoto = true
        
        do {
            // Load the image data
            if let data = try await item.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                
                // Upload to Clerk
                if let newImageURL = try await authManager.uploadProfilePicture(image) {
                    await MainActor.run {
                        profileImageURL = newImageURL
                        isUploadingPhoto = false
                        
                        // Show success feedback
                        withAnimation {
                            showingSaveSuccess = true
                        }
                        
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            withAnimation {
                                showingSaveSuccess = false
                            }
                        }
                    }
                } else {
                    await MainActor.run {
                        isUploadingPhoto = false
                    }
                }
            } else {
                await MainActor.run {
                    isUploadingPhoto = false
                }
            }
        } catch {
            print("Failed to upload photo: \(error)")
            await MainActor.run {
                isUploadingPhoto = false
            }
        }
        
        // Clear selection
        await MainActor.run {
            selectedPhotoItem = nil
        }
    }
}

// MARK: - Height Picker Sheet

struct ProfileHeightPickerSheet: View {
    @Binding var heightCm: Int
    @Binding var useMetric: Bool
    @Binding var hasChanges: Bool
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                unitSelector
                heightDisplay
                heightPicker
            }
            .navigationTitle("Set Height")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        hasChanges = true
                        dismiss()
                    }
                    .fontWeight(.medium)
                }
            }
        }
    }
    
    private var unitSelector: some View {
        Picker("Unit", selection: $useMetric) {
            Text("Imperial (ft/in)").tag(false)
            Text("Metric (cm)").tag(true)
        }
        .pickerStyle(SegmentedPickerStyle())
        .padding()
    }
    
    private var heightDisplay: some View {
        VStack(spacing: 8) {
            Text(formattedHeight)
                .font(.system(size: 36, weight: .semibold))
            
            Text(alternateHeight)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
    
    private var heightPicker: some View {
        Group {
            if useMetric {
                Picker("Height", selection: $heightCm) {
                    ForEach(100...250, id: \.self) { cm in
                        Text("\(cm) cm").tag(cm)
                    }
                }
                .pickerStyle(WheelPickerStyle())
                .labelsHidden()
            } else {
                imperialHeightPicker
            }
        }
    }
    
    private var imperialHeightPicker: some View {
        let feetBinding = Binding(
            get: { Int(Double(heightCm) / 30.48) },
            set: { feet in
                let totalInches = Double(heightCm) / 2.54
                let currentInches = Int(totalInches.truncatingRemainder(dividingBy: 12))
                heightCm = Int((Double(feet) * 30.48) + (Double(currentInches) * 2.54))
            }
        )
        
        let inchesBinding = Binding(
            get: { 
                let totalInches = Double(heightCm) / 2.54
                return Int(totalInches.truncatingRemainder(dividingBy: 12))
            },
            set: { inches in
                let feet = Int(Double(heightCm) / 30.48)
                heightCm = Int((Double(feet) * 30.48) + (Double(inches) * 2.54))
            }
        )
        
        return HStack {
            Picker("Feet", selection: feetBinding) {
                ForEach(3...8, id: \.self) { feet in
                    Text("\(feet) ft").tag(feet)
                }
            }
            .pickerStyle(WheelPickerStyle())
            .frame(width: 100)
            
            Picker("Inches", selection: inchesBinding) {
                ForEach(0...11, id: \.self) { inches in
                    Text("\(inches) in").tag(inches)
                }
            }
            .pickerStyle(WheelPickerStyle())
            .frame(width: 100)
        }
    }
    
    private var formattedHeight: String {
        if useMetric {
            return "\(heightCm) cm"
        } else {
            let totalInches = Int(Double(heightCm) / 2.54)
            let feet = totalInches / 12
            let inches = totalInches % 12
            return "\(feet)'\(inches)\""
        }
    }
    
    private var alternateHeight: String {
        if useMetric {
            let totalInches = Int(Double(heightCm) / 2.54)
            let feet = totalInches / 12
            let inches = totalInches % 12
            return "\(feet)'\(inches)\" in imperial"
        } else {
            return "\(heightCm) cm in metric"
        }
    }
}

// MARK: - Date Picker Sheet

struct DatePickerSheet: View {
    @Binding var date: Date
    @Binding var hasChanges: Bool
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack {
                DatePicker(
                    "",
                    selection: $date,
                    displayedComponents: .date
                )
                .datePickerStyle(WheelDatePickerStyle())
                .labelsHidden()
                
                Spacer()
            }
            .navigationTitle("Date of Birth")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        hasChanges = true
                        dismiss()
                    }
                    .fontWeight(.medium)
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        ProfileSettingsViewV2()
            .environmentObject({
                let authManager = AuthManager()
                authManager.currentUser = User(
                    id: "1",
                    email: "john@example.com",
                    name: "John Doe",
                    avatarUrl: nil,
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
                    ),
                    onboardingCompleted: true
                )
                return authManager
            }())
    }
}