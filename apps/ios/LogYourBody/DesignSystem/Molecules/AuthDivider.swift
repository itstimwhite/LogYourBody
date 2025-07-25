//
// AuthDivider.swift
// LogYourBody
//
import SwiftUI

// MARK: - AuthDivider Molecule

struct AuthDivider: View {
    let text: String
    
    init(text: String = "or") {
        self.text = text
    }
    
    var body: some View {
        HStack(spacing: 16) {
            Rectangle()
                .fill(Color.appBorder)
                .frame(height: 1)
            
            Text(text)
                .font(.system(size: 14))
                .foregroundColor(.appTextSecondary)
            
            Rectangle()
                .fill(Color.appBorder)
                .frame(height: 1)
        }
        .padding(.vertical, 20)
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 40) {
        AuthDivider()
        
        AuthDivider(text: "or continue with")
        
        VStack(spacing: 16) {
            DSAuthButton(title: "Sign In", action: {})
            AuthDivider()
            SocialLoginButton(provider: .apple, action: {})
        }
    }
    .padding()
    .background(Color.appBackground)
}
