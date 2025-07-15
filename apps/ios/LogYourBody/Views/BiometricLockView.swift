//
//  BiometricLockView.swift
//  LogYourBody
//
import LocalAuthentication

struct BiometricLockView: View {
    @Binding var isUnlocked: Bool
    @State private var isAuthenticating = false
    @State private var hasAttemptedOnce = false
    @State private var authenticationTimer: Timer?
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                // Subtle lock icon with animation
                Image(systemName: isAuthenticating ? "faceid" : "lock.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.appTextTertiary)
                    .opacity(0.6)
                    .scaleEffect(isAuthenticating ? 1.1 : 1.0)
                    .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: isAuthenticating)
                
                if hasAttemptedOnce && !isAuthenticating {
                    VStack(spacing: 8) {
                        Text("Tap to unlock")
                            .font(.appCaption)
                            .foregroundColor(.appTextTertiary)
                            .opacity(0.5)
                        
                        // Add skip option after failed attempt
                        Button(action: {
                            withAnimation(.easeOut(duration: 0.3)) {
                                isUnlocked = true
                            }
                        }) {
                            Text("Skip")
                                .font(.appCaption)
                                .foregroundColor(.appPrimary)
                                .opacity(0.8)
                        }
                        .padding(.top, 8)
                    }
                }
                
                Spacer()
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            if hasAttemptedOnce && !isAuthenticating {
                authenticate()
            }
        }
        .onAppear {
            // Small delay to let the UI settle before Face ID prompt
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                authenticate()
            }
        }
        .onDisappear {
            // Clean up timer if view disappears
            authenticationTimer?.invalidate()
        }
    }
    
    private func authenticate() {
        let context = LAContext()
        var error: NSError?
        
        // Configure context for no fallback button
        context.localizedFallbackTitle = ""
        
        // Cancel any existing timer
        authenticationTimer?.invalidate()
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            isAuthenticating = true
            
            // Set a timeout to prevent indefinite blocking
            authenticationTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: false) { _ in
                DispatchQueue.main.async {
                    if self.isAuthenticating {
                        // Timeout reached, cancel authentication
                        context.invalidate()
                        self.isAuthenticating = false
                        self.hasAttemptedOnce = true
                    }
                }
            }
            
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock LogYourBody") { success, error in
                DispatchQueue.main.async {
                    // Cancel timer since we got a response
                    self.authenticationTimer?.invalidate()
                    self.isAuthenticating = false
                    
                    if success {
                        // Smooth unlock animation
                        withAnimation(.easeOut(duration: 0.3)) {
                            self.isUnlocked = true
                        }
                    } else {
                        // Failed - mark that we've attempted once
                        self.hasAttemptedOnce = true
                        
                        // Check if it was a user cancellation
                        if let laError = error as? LAError {
                            switch laError.code {
                            case .userCancel, .systemCancel:
                                // User cancelled - show skip option immediately
                                break
                            case .biometryNotAvailable, .biometryNotEnrolled:
                                // Biometry issues - unlock immediately
                                withAnimation(.easeOut(duration: 0.3)) {
                                    self.isUnlocked = true
                                }
                            default:
                                // Other errors - let them retry
                                break
                            }
                        }
                    }
                }
            }
        } else {
            // Biometrics not available, unlock immediately
            withAnimation(.easeOut(duration: 0.3)) {
                isUnlocked = true
            }
        }
    }
}

struct BiometricLockView_Previews: PreviewProvider {
    static var previews: some View {
        BiometricLockView(isUnlocked: .constant(false))
            .preferredColorScheme(.dark)
    }
}
