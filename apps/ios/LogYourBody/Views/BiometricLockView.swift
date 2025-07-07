//
//  BiometricLockView.swift
//  LogYourBody
//
//  Created by Assistant on 7/6/25.
//

import SwiftUI
import LocalAuthentication

struct BiometricLockView: View {
    @Binding var isUnlocked: Bool
    @State private var isAuthenticating = false
    @State private var hasAttemptedOnce = false
    
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
                    // Only show tap instruction after first failed attempt
                    Text("Tap to unlock")
                        .font(.appCaption)
                        .foregroundColor(.appTextTertiary)
                        .opacity(0.5)
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
    }
    
    private func authenticate() {
        let context = LAContext()
        var error: NSError?
        
        // Configure context for no fallback button
        context.localizedFallbackTitle = ""
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            isAuthenticating = true
            
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock LogYourBody") { success, error in
                DispatchQueue.main.async {
                    isAuthenticating = false
                    
                    if success {
                        // Smooth unlock animation
                        withAnimation(.easeOut(duration: 0.3)) {
                            isUnlocked = true
                        }
                    } else {
                        // Failed - mark that we've attempted once
                        hasAttemptedOnce = true
                        
                        // If user cancelled or there was an error, do nothing
                        // No alerts, no error messages - just let them tap to try again
                    }
                }
            }
        } else {
            // Biometrics not available, unlock immediately
            isUnlocked = true
        }
    }
}

struct BiometricLockView_Previews: PreviewProvider {
    static var previews: some View {
        BiometricLockView(isUnlocked: .constant(false))
            .preferredColorScheme(.dark)
    }
}