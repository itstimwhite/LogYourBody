//
// SocialLoginButton.swift
// LogYourBody
//
import SwiftUI

// MARK: - SocialLoginButton Molecule

struct SocialLoginButton: View {
    enum Provider {
        case apple
        case google
        case facebook
        
        var title: String {
            switch self {
            case .apple:
                return "Continue with Apple"
            case .google:
                return "Continue with Google"
            case .facebook:
                return "Continue with Facebook"
            }
        }
        
        var icon: String {
            switch self {
            case .apple:
                return "apple.logo"
            case .google:
                return "globe"
            case .facebook:
                return "f.circle.fill"
            }
        }
        
        var backgroundColor: Color {
            switch self {
            case .apple:
                return .white
            case .google:
                return .white
            case .facebook:
                return Color(red: 0.258, green: 0.406, blue: 0.697)
            }
        }
        
        var foregroundColor: Color {
            switch self {
            case .apple, .google:
                return .black
            case .facebook:
                return .white
            }
        }
    }
    
    let provider: Provider
    let isLoading: Bool
    let action: () -> Void
    
    init(
        provider: Provider,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.provider = provider
        self.isLoading = isLoading
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: provider.foregroundColor))
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: provider.icon)
                        .font(.system(size: 18, weight: .medium))
                    
                    Text(provider.title)
                        .font(.system(size: 17, weight: .medium))
                }
            }
            .foregroundColor(provider.foregroundColor)
            .frame(height: 48)
            .frame(maxWidth: .infinity)
            .background(provider.backgroundColor)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.appBorder, lineWidth: provider == .apple || provider == .google ? 1 : 0)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isLoading ? 0.98 : 1.0)
        .disabled(isLoading)
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 16) {
        SocialLoginButton(provider: .apple) {
            // Action
        }
        
        SocialLoginButton(provider: .google) {
            // Action
        }
        
        SocialLoginButton(provider: .facebook) {
            // Action
        }
        
        SocialLoginButton(provider: .apple, isLoading: true) {
            // Action
        }
    }
    .padding()
    .background(Color.appBackground)
}
