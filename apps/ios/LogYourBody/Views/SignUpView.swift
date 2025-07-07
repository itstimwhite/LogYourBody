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
                            
                            Text("At least 6 characters")
                                .font(.appCaption)
                                .foregroundColor(.linearTextTertiary)
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
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Create account")
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
        password.count >= 6
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
                    errorMessage = error.localizedDescription
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