//
//  DeleteAccountView.swift
//  LogYourBody
//
//  Created by Assistant on 7/2/25.
//

import SwiftUI
import Clerk

struct DeleteAccountView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var showConfirmation = false
    @State private var confirmationText = ""
    @State private var isDeleting = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    private let confirmationPhrase = "DELETE"
    
    var body: some View {
        List {
            Section {
                VStack(spacing: 20) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.red)
                        .padding(.top, 20)
                    
                    Text("Delete Account")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("This action cannot be undone. All your data will be permanently deleted.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .listRowBackground(Color.clear)
            }
            
            Section("What will be deleted") {
                Label("All weight entries", systemImage: "scalemass")
                Label("Your profile information", systemImage: "person.circle")
                Label("Health data", systemImage: "heart.fill")
            }
            
            Section("Confirm deletion") {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Type \"\(confirmationPhrase)\" to confirm account deletion:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    TextField("Type \(confirmationPhrase)", text: $confirmationText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.allCharacters)
                        .disableAutocorrection(true)
                }
                
                Button(action: {
                    deleteAccount()
                }) {
                    if isDeleting {
                        HStack {
                            Spacer()
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            Text("Deleting...")
                                .foregroundColor(.white)
                            Spacer()
                        }
                    } else {
                        Text("Delete My Account")
                            .frame(maxWidth: .infinity)
                    }
                }
                .foregroundColor(.white)
                .padding()
                .background(confirmationText == confirmationPhrase ? Color.red : Color.gray)
                .cornerRadius(10)
                .disabled(confirmationText != confirmationPhrase || isDeleting)
                .listRowInsets(EdgeInsets())
                .listRowBackground(Color.clear)
            }
        }
        .navigationTitle("Delete Account")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .confirmationDialog("Delete Account?", isPresented: $showConfirmation) {
            Button("Delete", role: .destructive) {
                performDeletion()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Are you sure you want to delete your account? This cannot be undone.")
        }
    }
    
    private func deleteAccount() {
        guard confirmationText == confirmationPhrase else { return }
        showConfirmation = true
    }
    
    private func performDeletion() {
        isDeleting = true
        
        Task {
            do {
                // Delete from Clerk
                try await deleteClerkAccount()
                
                // Clear local data
                await MainActor.run {
                    // Clear Core Data
                    CoreDataManager.shared.deleteAllData()
                    
                    // Clear UserDefaults
                    UserDefaults.standard.removeObject(forKey: Constants.currentUserKey)
                    UserDefaults.standard.removeObject(forKey: Constants.authTokenKey)
                    UserDefaults.standard.removeObject(forKey: Constants.hasCompletedOnboardingKey)
                    UserDefaults.standard.removeObject(forKey: Constants.preferredWeightUnitKey)
                    UserDefaults.standard.removeObject(forKey: Constants.preferredMeasurementSystemKey)
                    UserDefaults.standard.removeObject(forKey: "healthKitSyncEnabled")
                    
                    // Sign out
                    Task {
                        await authManager.logout()
                    }
                }
            } catch {
                await MainActor.run {
                    isDeleting = false
                    errorMessage = "Failed to delete account: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
    }
    
    private func deleteClerkAccount() async throws {
        // Use Clerk SDK to delete the user account
        guard let user = Clerk.shared.user else {
            throw NSError(domain: "DeleteAccount", code: 1, userInfo: [NSLocalizedDescriptionKey: "No user found"])
        }
        
        // Delete the user through Clerk
        try await user.delete()
    }
}

#Preview {
    NavigationView {
        DeleteAccountView()
            .environmentObject(AuthManager())
    }
}