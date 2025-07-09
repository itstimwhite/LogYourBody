//
//  SignUpView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI
import AuthenticationServices

struct SignUpView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @FocusState private var focusedField: Field?
    
    enum Field {
        case email, password
    }
    
    var body: some View {
        ZStack {
            // Background
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button(action: { dismiss() }) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 20))
                                .foregroundColor(.appText)
                                .frame(width: 44, height: 44)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                    
                    // Title
                    VStack(spacing: 16) {
                        Text("Create Account")
                            .font(.appTitle)
                            .foregroundColor(.appText)
                            .fontWeight(.semibold)
                        
                        Text("Start tracking your fitness progress")
                            .font(.appBody)
                            .foregroundColor(.appTextSecondary)
                    }
                    .padding(.top, 20)
                    .padding(.bottom, 40)
                    
                    // Sign Up Form
                    VStack(spacing: 20) {
                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.appBodySmall)
                                .foregroundColor(.appTextSecondary)
                            
                            TextField("you@example.com", text: $email)
                                .modernTextFieldStyle()
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                                .textContentType(.emailAddress)
                                .focused($focusedField, equals: .email)
                                .onSubmit {
                                    focusedField = .password
                                }
                        }
                        
                        // Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.appBodySmall)
                                .foregroundColor(.appTextSecondary)
                            
                            SecureField("••••••••", text: $password)
                                .modernTextFieldStyle()
                                .textContentType(.newPassword)
                                .focused($focusedField, equals: .password)
                                .onSubmit {
                                    if isValidForm {
                                        signUp()
                                    }
                                }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 4) {
                                    Image(systemName: password.count >= 8 ? "checkmark.circle.fill" : "circle")
                                        .font(.system(size: 12))
                                        .foregroundColor(password.count >= 8 ? .green : .linearTextTertiary)
                                    Text("At least 8 characters")
                                        .font(.appCaption)
                                        .foregroundColor(password.count >= 8 ? .appTextSecondary : .linearTextTertiary)
                                }
                                
                                HStack(spacing: 4) {
                                    Image(systemName: hasUpperAndLower ? "checkmark.circle.fill" : "circle")
                                        .font(.system(size: 12))
                                        .foregroundColor(hasUpperAndLower ? .green : .linearTextTertiary)
                                    Text("Mix of uppercase and lowercase letters")
                                        .font(.appCaption)
                                        .foregroundColor(hasUpperAndLower ? .appTextSecondary : .linearTextTertiary)
                                }
                                
                                HStack(spacing: 4) {
                                    Image(systemName: hasNumberOrSymbol ? "checkmark.circle.fill" : "circle")
                                        .font(.system(size: 12))
                                        .foregroundColor(hasNumberOrSymbol ? .green : .linearTextTertiary)
                                    Text("At least one number or special character")
                                        .font(.appCaption)
                                        .foregroundColor(hasNumberOrSymbol ? .appTextSecondary : .linearTextTertiary)
                                }
                            }
                        }
                        
                        // Terms Text
                        Text("By creating an account, you agree to our Terms of Service and Privacy Policy")
                            .font(.appCaption)
                            .foregroundColor(.appTextSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        // Sign Up Button
                        Button(action: signUp) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: isValidForm ? .black : .white))
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Create account")
                                        .font(.appBody)
                                        .fontWeight(.semibold)
                                        .foregroundColor(isValidForm ? .black : .white)
                                }
                            }
                            .frame(height: 48)
                            .frame(maxWidth: .infinity)
                            .background(isValidForm ? Color.white : Color.appBorder)
                            .cornerRadius(Constants.cornerRadius)
                            .animation(.easeInOut(duration: 0.2), value: isValidForm)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .scaleEffect(isLoading ? 0.98 : 1.0)
                        .disabled(!isValidForm || isLoading)
                        
                        // Divider
                        HStack(spacing: 16) {
                            Rectangle()
                                .fill(Color.appBorder)
                                .frame(height: 1)
                            
                            Text("or")
                                .font(.appCaption)
                                .foregroundColor(.linearTextTertiary)
                            
                            Rectangle()
                                .fill(Color.appBorder)
                                .frame(height: 1)
                        }
                        .padding(.vertical, 8)
                        
                        // Apple Sign In
                        AppleSignInButton()
                            .frame(height: 48)
                            .allowsHitTesting(true)
                        
                        // Already have account
                        HStack(spacing: 4) {
                            Text("Already have an account?")
                                .font(.appBody)
                                .foregroundColor(.appTextSecondary)
                            
                            Button("Sign in") {
                                dismiss()
                            }
                            .font(.appBody)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                        }
                        .padding(.top, 8)
                    }
                    .padding(.horizontal, 24)
                    
                    Spacer(minLength: 40)
                }
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .navigationBarHidden(true)
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .onTapGesture {
            focusedField = nil
        }
    }
    
    private var isValidForm: Bool {
        !email.isEmpty &&
        email.contains("@") &&
        password.count >= 8 &&
        hasUpperAndLower &&
        hasNumberOrSymbol
    }
    
    private var hasUpperAndLower: Bool {
        let hasUpper = password.rangeOfCharacter(from: .uppercaseLetters) != nil
        let hasLower = password.rangeOfCharacter(from: .lowercaseLetters) != nil
        return hasUpper && hasLower
    }
    
    private var hasNumberOrSymbol: Bool {
        let hasNumber = password.rangeOfCharacter(from: .decimalDigits) != nil
        let hasSymbol = password.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) != nil
        return hasNumber || hasSymbol
    }
    
    private func signUp() {
        // Prevent multiple submissions
        guard !isLoading else { return }
        
        focusedField = nil
        isLoading = true
        
        Task { @MainActor in
            do {
                try await authManager.signUp(email: email, password: password, name: "")
                // Reset loading state on success
                isLoading = false
            } catch {
                isLoading = false
                // If we need verification, the AuthManager will handle navigation
                if authManager.needsEmailVerification {
                    // Email verification screen will show automatically
                } else {
                    // Check if it's a password strength error
                    if error.localizedDescription.contains("not strong enough") {
                        errorMessage = "Please choose a stronger password. Use at least 8 characters with a mix of uppercase, lowercase, and numbers or symbols."
                    } else {
                        errorMessage = error.localizedDescription
                    }
                    showError = true
                }
            }
        }
    }
}


#Preview {
    NavigationView {
        SignUpView()
            .environmentObject(AuthManager.shared)
    }
}