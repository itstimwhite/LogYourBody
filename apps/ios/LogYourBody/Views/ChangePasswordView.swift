//
//  ChangePasswordView.swift
//  LogYourBody
//
//  Modern password change interface using Clerk
//

import SwiftUI
import Clerk

struct ChangePasswordView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showSuccess = false
    @FocusState private var focusedField: Field?
    
    enum Field {
        case current, new, confirm
    }
    
    private var isValidForm: Bool {
        !currentPassword.isEmpty &&
        newPassword.count >= 8 &&
        newPassword == confirmPassword &&
        hasUpperAndLower &&
        hasNumberOrSymbol
    }
    
    private var hasUpperAndLower: Bool {
        let hasUpper = newPassword.rangeOfCharacter(from: .uppercaseLetters) != nil
        let hasLower = newPassword.rangeOfCharacter(from: .lowercaseLetters) != nil
        return hasUpper && hasLower
    }
    
    private var hasNumberOrSymbol: Bool {
        let hasNumber = newPassword.rangeOfCharacter(from: .decimalDigits) != nil
        let hasSymbol = newPassword.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) != nil
        return hasNumber || hasSymbol
    }
    
    private var passwordsMatch: Bool {
        !newPassword.isEmpty && newPassword == confirmPassword
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header Icon
                ZStack {
                    Circle()
                        .fill(Color.appPrimary.opacity(0.1))
                        .frame(width: 80, height: 80)
                    
                    Image(systemName: "lock.shield")
                        .font(.system(size: 36, weight: .medium))
                        .foregroundColor(.appPrimary)
                }
                .padding(.top, 40)
                .padding(.bottom, 24)
                
                // Title
                VStack(spacing: 8) {
                    Text("Change Password")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.appText)
                    
                    Text("Create a strong password to protect your account")
                        .font(.appBody)
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
                .padding(.bottom, 40)
                
                // Form Fields
                VStack(spacing: 20) {
                    // Current Password
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Current Password")
                            .font(.appBodySmall)
                            .foregroundColor(.appTextSecondary)
                        
                        SecureField("Enter current password", text: $currentPassword)
                            .modernTextFieldStyle()
                            .textContentType(.password)
                            .focused($focusedField, equals: .current)
                            .onSubmit {
                                focusedField = .new
                            }
                    }
                    
                    Divider()
                        .padding(.vertical, 8)
                    
                    // New Password
                    VStack(alignment: .leading, spacing: 8) {
                        Text("New Password")
                            .font(.appBodySmall)
                            .foregroundColor(.appTextSecondary)
                        
                        SecureField("Enter new password", text: $newPassword)
                            .modernTextFieldStyle()
                            .textContentType(.newPassword)
                            .focused($focusedField, equals: .new)
                            .onSubmit {
                                focusedField = .confirm
                            }
                        
                        // Password Requirements
                        VStack(alignment: .leading, spacing: 6) {
                            PasswordRequirement(
                                text: "At least 8 characters",
                                isMet: newPassword.count >= 8
                            )
                            
                            PasswordRequirement(
                                text: "Mix of uppercase and lowercase",
                                isMet: hasUpperAndLower
                            )
                            
                            PasswordRequirement(
                                text: "At least one number or symbol",
                                isMet: hasNumberOrSymbol
                            )
                        }
                    }
                    
                    // Confirm Password
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Confirm New Password")
                            .font(.appBodySmall)
                            .foregroundColor(.appTextSecondary)
                        
                        SecureField("Re-enter new password", text: $confirmPassword)
                            .modernTextFieldStyle()
                            .textContentType(.newPassword)
                            .focused($focusedField, equals: .confirm)
                            .onSubmit {
                                if isValidForm {
                                    changePassword()
                                }
                            }
                        
                        if !confirmPassword.isEmpty && !passwordsMatch {
                            HStack(spacing: 4) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(.red)
                                Text("Passwords don't match")
                                    .font(.appCaption)
                                    .foregroundColor(.red)
                            }
                        }
                    }
                }
                .padding(.horizontal, 24)
                
                // Submit Button
                Button(action: changePassword) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                .scaleEffect(0.8)
                        } else {
                            Text("Update Password")
                                .font(.appBody)
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(height: 48)
                    .frame(maxWidth: .infinity)
                    .background(isValidForm ? Color.white : Color.appBorder)
                    .foregroundColor(isValidForm ? .black : .white)
                    .cornerRadius(Constants.cornerRadius)
                    .animation(.easeInOut(duration: 0.2), value: isValidForm)
                }
                .disabled(!isValidForm || isLoading)
                .padding(.horizontal, 24)
                .padding(.top, 32)
                
                Spacer(minLength: 40)
            }
        }
        .scrollDismissesKeyboard(.interactively)
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(isLoading)
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .alert("Password Updated", isPresented: $showSuccess) {
            Button("OK", role: .cancel) {
                dismiss()
            }
        } message: {
            Text("Your password has been successfully changed.")
        }
        .onTapGesture {
            focusedField = nil
        }
    }
    
    private func changePassword() {
        guard isValidForm else { return }
        
        focusedField = nil
        isLoading = true
        
        Task { @MainActor in
            do {
                guard let user = Clerk.shared.user else {
                    throw PasswordError.notAuthenticated
                }
                
                // Update password using Clerk
                try await user.updatePassword(.init(
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    signOutOfOtherSessions: true
                ))
                
                isLoading = false
                showSuccess = true
                
            } catch {
                isLoading = false
                
                // Handle specific Clerk errors
                if let clerkError = error as? ClerkAPIError {
                    switch clerkError.code {
                    case "form_password_incorrect":
                        errorMessage = "Current password is incorrect"
                    case "form_password_not_strong_enough":
                        errorMessage = "Please choose a stronger password"
                    default:
                        errorMessage = clerkError.message ?? "Failed to update password"
                    }
                } else {
                    errorMessage = error.localizedDescription
                }
                
                showError = true
            }
        }
    }
}

struct PasswordRequirement: View {
    let text: String
    let isMet: Bool
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 14))
                .foregroundColor(isMet ? .green : .appTextTertiary)
            
            Text(text)
                .font(.appCaption)
                .foregroundColor(isMet ? .appTextSecondary : .appTextTertiary)
        }
    }
}

enum PasswordError: LocalizedError {
    case notAuthenticated
    
    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "You must be logged in to change your password"
        }
    }
}

#Preview {
    NavigationView {
        ChangePasswordView()
            .preferredColorScheme(.dark)
    }
}