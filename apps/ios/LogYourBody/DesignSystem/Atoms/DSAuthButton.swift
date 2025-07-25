//
// DSAuthButton.swift
// LogYourBody
//
import SwiftUI

// MARK: - DSAuthButton Atom

struct DSAuthButton: View {
    enum Style {
        case primary
        case secondary
        case social
        
        var backgroundColor: Color {
            switch self {
            case .primary:
                return .white
            case .secondary:
                return Color(.systemGray6)
            case .social:
                return .white
            }
        }
        
        var foregroundColor: Color {
            switch self {
            case .primary:
                return .black
            case .secondary:
                return .appText
            case .social:
                return .black
            }
        }
    }
    
    let title: String
    let style: Style
    let icon: String?
    let isLoading: Bool
    let isEnabled: Bool
    let action: () -> Void
    
    init(
        title: String,
        style: Style = .primary,
        icon: String? = nil,
        isLoading: Bool = false,
        isEnabled: Bool = true,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.style = style
        self.icon = icon
        self.isLoading = isLoading
        self.isEnabled = isEnabled
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: style.foregroundColor))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.system(size: 18))
                    }
                    
                    Text(title)
                        .font(.system(size: 17, weight: .semibold))
                }
            }
            .foregroundColor(isEnabled ? style.foregroundColor : .appTextSecondary)
            .frame(height: 48)
            .frame(maxWidth: .infinity)
            .background(isEnabled ? style.backgroundColor : Color.appBorder)
            .cornerRadius(10)
            .animation(.easeInOut(duration: 0.2), value: isEnabled)
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isLoading ? 0.98 : 1.0)
        .disabled(!isEnabled || isLoading)
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        DSAuthButton(
            title: "Sign In",
            style: .primary,
            action: {}
        )
        
        DSAuthButton(
            title: "Sign In",
            style: .primary,
            isLoading: true,
            action: {}
        )
        
        DSAuthButton(
            title: "Continue with Apple",
            style: .social,
            icon: "apple.logo",
            action: {}
        )
        
        DSAuthButton(
            title: "Sign Up",
            style: .secondary,
            action: {}
        )
        
        DSAuthButton(
            title: "Disabled",
            style: .primary,
            isEnabled: false,
            action: {}
        )
    }
    .padding()
    .background(Color.appBackground)
}
