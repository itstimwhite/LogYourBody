//
//  EmailVerificationView.swift
//  LogYourBody
//
//  Created by Assistant on 7/2/25.
//

import SwiftUI

struct EmailVerificationView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var verificationCode = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    @State private var resendCooldown = 0
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ZStack {
            // Background
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "envelope.badge.shield.half.filled")
                            .font(.system(size: 60))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.linearPurple, .linearBlue],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .padding(.top, 80)
                        
                        Text("Verify Your Email")
                            .font(.system(size: 36, weight: .bold, design: .default))
                            .foregroundColor(.appText)
                        
                        Text("We've sent a verification code to your email address")
                            .font(.appBody)
                            .foregroundColor(.appTextSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding(.bottom, 50)
                    
                    // Verification Form
                    VStack(spacing: 20) {
                        // Verification Code Input
                        VStack(spacing: 16) {
                            Text("Enter verification code")
                                .font(.appBodySmall)
                                .foregroundColor(.appTextSecondary)
                            
                            OTPInputView(
                                otpCode: $verificationCode,
                                onComplete: {
                                    // Auto-submit when all digits are entered
                                    if verificationCode.count == 6 {
                                        verifyCode()
                                    }
                                }
                            )
                            
                            if let errorMessage = errorMessage {
                                Text(errorMessage)
                                    .font(.appBodySmall)
                                    .foregroundColor(.error)
                                    .padding(.top, 4)
                            }
                            
                            if let successMessage = successMessage {
                                Text(successMessage)
                                    .font(.appBodySmall)
                                    .foregroundColor(.success)
                                    .padding(.top, 4)
                            }
                        }
                        
                        // Loading indicator when verifying
                        if isLoading {
                            HStack {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .appTextSecondary))
                                    .scaleEffect(0.8)
                                Text("Verifying...")
                                    .font(.appBodySmall)
                                    .foregroundColor(.appTextSecondary)
                            }
                            .padding(.top, 8)
                        }
                        
                        // Resend Code Button
                        Button(action: resendCode) {
                            if resendCooldown > 0 {
                                Text("Resend code in \(resendCooldown)s")
                                    .font(.appBodySmall)
                                    .foregroundColor(.appTextTertiary)
                            } else {
                                Text("Didn't receive the code? Resend")
                                    .font(.appBodySmall)
                                    .foregroundColor(.appTextSecondary)
                            }
                        }
                        .disabled(isLoading || resendCooldown > 0)
                    }
                    .padding(.horizontal, 24)
                    
                    Spacer(minLength: 100)
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .onReceive(timer) { _ in
            if resendCooldown > 0 {
                resendCooldown -= 1
            }
        }
    }
    
    private func verifyCode() {
        guard !verificationCode.isEmpty, !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        Task { @MainActor in
            do {
                try await authManager.verifyEmail(code: verificationCode)
                successMessage = "Email verified! Logging you in..."
                // Keep loading state true as the session observer will handle navigation
            } catch {
                errorMessage = error.localizedDescription
                isLoading = false
                // Clear the code on error for retry
                verificationCode = ""
            }
        }
    }
    
    private func resendCode() {
        guard !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        Task { @MainActor in
            do {
                try await authManager.resendVerificationEmail()
                successMessage = "Verification code sent successfully"
                isLoading = false
                resendCooldown = 60  // 60 second cooldown
                // Clear success message after 3 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    successMessage = nil
                }
            } catch {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }
}

struct EmailVerificationView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            EmailVerificationView()
        }
        .environmentObject(AuthManager.shared)
        .preferredColorScheme(.dark)
    }
}