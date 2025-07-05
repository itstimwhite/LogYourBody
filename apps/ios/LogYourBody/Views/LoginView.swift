//
//  LoginView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
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
                    // Logo and Title
                    VStack(spacing: 12) {
                        Text("LogYourBody")
                            .font(.system(size: 36, weight: .bold, design: .default))
                            .foregroundColor(.appText)
                            .padding(.top, 80)
                        
                        Text("Track your fitness journey")
                            .font(.appBody)
                            .foregroundColor(.appTextSecondary)
                    }
                    .padding(.bottom, 50)
                    
                    // Login Form
                    VStack(spacing: 20) {
                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.appBodySmall)
                                .foregroundColor(.appTextSecondary)
                            
                            TextField("", text: $email)
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
                            
                            SecureField("", text: $password)
                                .modernTextFieldStyle()
                                .textContentType(.password)
                                .focused($focusedField, equals: .password)
                                .onSubmit {
                                    if !email.isEmpty && !password.isEmpty {
                                        login()
                                    }
                                }
                        }
                        
                        // Forgot Password Link
                        HStack {
                            Spacer()
                            NavigationLink("Forgot password?") {
                                Text("Forgot Password View - Coming Soon")
                            }
                            .font(.appBodySmall)
                            .foregroundColor(.appTextSecondary)
                        }
                        
                        // Login Button
                        Button(action: login) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Sign in")
                                        .font(.appBody)
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(height: 48)
                            .frame(maxWidth: .infinity)
                            .background(isEnabled ? Color.white : Color.appBorder)
                            .foregroundColor(isEnabled ? .black : .white)
                            .cornerRadius(Constants.cornerRadius)
                            .animation(.easeInOut(duration: 0.2), value: isEnabled)
                        }
                        .disabled(!isEnabled)
                        
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
                        .padding(.vertical, 20)
                        
                        // Apple Sign In
                        AppleSignInButton()
                            .frame(height: 48)
                            .environmentObject(authManager)
                            .allowsHitTesting(true)
                        
                        // Sign Up Link
                        HStack(spacing: 4) {
                            Text("Don't have an account?")
                                .font(.appBody)
                                .foregroundColor(.appTextSecondary)
                            
                            NavigationLink("Sign up") {
                                SignUpView()
                            }
                            .font(.appBody)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                        }
                        .padding(.top, 20)
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
    
    private var isEnabled: Bool {
        !email.isEmpty && !password.isEmpty && !isLoading
    }
    
    private func login() {
        focusedField = nil
        isLoading = true
        
        Task { @MainActor in
            do {
                try await AuthManager.shared.login(
                    email: self.email,
                    password: self.password
                )
            } catch {
                errorMessage = "Invalid email or password. Please try again."
                showError = true
                isLoading = false
            }
        }
    }
}

#Preview {
    NavigationView {
        LoginView()
            .environmentObject(AuthManager.shared)
    }
}