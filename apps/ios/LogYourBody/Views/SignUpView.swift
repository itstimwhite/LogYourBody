//
// SignUpView.swift
// LogYourBody
//
// Created by Tim White on 7/1/25.
// import SwiftUI
import AuthenticationServices
import SafariServices

struct SignUpView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss)
    var dismiss    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var agreedToTerms = false
    @State private var agreedToPrivacy = false
    @State private var agreedToHealthDisclaimer = false
    @State private var showTermsSheet = false
    @State private var showPrivacySheet = false
    @State private var showHealthDisclaimerSheet = false
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
                        
                        // Privacy Consent Checkboxes
                        VStack(spacing: 16) {
                            // Terms of Service
                            HStack(alignment: .top, spacing: 12) {
                                Button(action: { agreedToTerms.toggle() }) {
                                    Image(systemName: agreedToTerms ? "checkmark.square.fill" : "square")
                                        .font(.system(size: 20))
                                        .foregroundColor(agreedToTerms ? .white : .appBorder)
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 4) {
                                        Text("I agree to the")
                                            .font(.appCaption)
                                            .foregroundColor(.appTextSecondary)
                                        
                                        Button("Terms of Service") {
                                            showTermsSheet = true
                                        }
                                        .font(.appCaption)
                                        .foregroundColor(.white)
                                        .underline()
                                    }
                                }
                                
                                Spacer()
                            }
                            
                            // Privacy Policy
                            HStack(alignment: .top, spacing: 12) {
                                Button(action: { agreedToPrivacy.toggle() }) {
                                    Image(systemName: agreedToPrivacy ? "checkmark.square.fill" : "square")
                                        .font(.system(size: 20))
                                        .foregroundColor(agreedToPrivacy ? .white : .appBorder)
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 4) {
                                        Text("I have read and accept the")
                                            .font(.appCaption)
                                            .foregroundColor(.appTextSecondary)
                                        
                                        Button("Privacy Policy") {
                                            showPrivacySheet = true
                                        }
                                        .font(.appCaption)
                                        .foregroundColor(.white)
                                        .underline()
                                    }
                                    
                                    Text("Including data collection for fitness tracking")
                                        .font(.system(size: 11))
                                        .foregroundColor(.appTextTertiary)
                                }
                                
                                Spacer()
                            }
                            
                            // Health Disclaimer
                            HStack(alignment: .top, spacing: 12) {
                                Button(action: { agreedToHealthDisclaimer.toggle() }) {
                                    Image(systemName: agreedToHealthDisclaimer ? "checkmark.square.fill" : "square")
                                        .font(.system(size: 20))
                                        .foregroundColor(agreedToHealthDisclaimer ? .white : .appBorder)
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("I understand LogYourBody is not a medical device")
                                        .font(.appCaption)
                                        .foregroundColor(.appTextSecondary)
                                    
                                    Text("Consult healthcare professionals for medical advice")
                                        .font(.system(size: 11))
                                        .foregroundColor(.appTextTertiary)
                                }
                                
                                Spacer()
                            }
                        }
                        .padding(.vertical, 8)
                        
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
                        Button(action: {
                            Task {
                                await authManager.signInWithAppleOAuth()
                            }
                        }) {
                            HStack {
                                Image(systemName: "apple.logo")
                                    .font(.system(size: 18))
                                Text("Continue with Apple")
                                    .font(.system(size: 17, weight: .medium))
                            }
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(Color.white)
                            .cornerRadius(Constants.cornerRadius)
                        }
                        .buttonStyle(PlainButtonStyle())
                        
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
        .sheet(isPresented: $showTermsSheet) {
            SafariView(url: URL(string: "https://logyourbody.com/terms")!)
                .ignoresSafeArea()
        }
        .sheet(isPresented: $showPrivacySheet) {
            SafariView(url: URL(string: "https://logyourbody.com/privacy")!)
                .ignoresSafeArea()
        }
    }
    
    private var isValidForm: Bool {
        !email.isEmpty &&
        email.contains("@") &&
        password.count >= 8 &&
        hasUpperAndLower &&
        hasNumberOrSymbol &&
        agreedToTerms &&
        agreedToPrivacy &&
        agreedToHealthDisclaimer
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

// Safari View wrapper for showing web content
struct SafariView: UIViewControllerRepresentable {
    let url: URL
    
    func makeUIViewController(context: Context) -> SFSafariViewController {
        let config = SFSafariViewController.Configuration()
        config.entersReaderIfAvailable = false
        config.barCollapsingEnabled = true
        
        let controller = SFSafariViewController(url: url, configuration: config)
        controller.preferredControlTintColor = .white
        controller.preferredBarTintColor = UIColor(Color.appBackground)
        controller.dismissButtonStyle = .close
        
        return controller
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

#Preview {
    NavigationView {
        SignUpView()
            .environmentObject(AuthManager.shared)
    }
}
