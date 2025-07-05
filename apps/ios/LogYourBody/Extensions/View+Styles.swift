//
//  View+Styles.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

// MARK: - Linear-Inspired Text Field Style
struct ModernTextFieldStyle: TextFieldStyle {
    @FocusState private var isFocused: Bool
    
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.appCard.opacity(0.5))
            )
            .foregroundColor(.appText)
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(
                        isFocused ? Color.appPrimary : Color.appBorder,
                        lineWidth: 1
                    )
            )
            .focused($isFocused)
            .animation(.easeOut(duration: 0.15), value: isFocused)
    }
}

// MARK: - Linear-Inspired Primary Button Style
struct ModernPrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled
    
    func makeBody(configuration: Self.Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .medium))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(
                Color.appPrimary.opacity(isEnabled ? 1 : 0.5)
            )
            .cornerRadius(6)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Secondary Button Style
struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Self.Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .medium))
            .foregroundColor(.appTextSecondary)
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
            .background(
                Color.appCard.opacity(configuration.isPressed ? 0.5 : 0)
            )
            .cornerRadius(6)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Modern Card Style
struct ModernCardStyle: ViewModifier {
    var noPadding: Bool = false
    
    func body(content: Content) -> some View {
        content
            .padding(noPadding ? 0 : 20)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.appCard.opacity(0.5))
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        Color.appBorder.opacity(0.3),
                                        Color.appBorder.opacity(0.1)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )
            )
            .shadow(
                color: Color.black.opacity(0.05),
                radius: 10,
                x: 0,
                y: 4
            )
    }
}

// MARK: - Glassmorphism Style
struct GlassmorphismStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.appCard.opacity(0.2))
                    .background(
                        Color.appCard.opacity(0.1)
                            .blur(radius: 10)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.1),
                                        Color.white.opacity(0.05)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )
            )
    }
}

// MARK: - Subtle Shadow
struct SubtleShadow: ViewModifier {
    func body(content: Content) -> some View {
        content
            .shadow(
                color: Color.black.opacity(0.04),
                radius: 8,
                x: 0,
                y: 2
            )
            .shadow(
                color: Color.black.opacity(0.02),
                radius: 4,
                x: 0,
                y: 1
            )
    }
}

extension View {
    func modernPrimaryButtonStyle() -> some View {
        self.buttonStyle(ModernPrimaryButtonStyle())
    }
    
    func secondaryButtonStyle() -> some View {
        self.buttonStyle(SecondaryButtonStyle())
    }
    
    func modernCardStyle(noPadding: Bool = false) -> some View {
        modifier(ModernCardStyle(noPadding: noPadding))
    }
    
    func modernTextFieldStyle() -> some View {
        textFieldStyle(ModernTextFieldStyle())
    }
    
    func glassmorphism() -> some View {
        modifier(GlassmorphismStyle())
    }
    
    func subtleShadow() -> some View {
        modifier(SubtleShadow())
    }
    
    // Haptic feedback helper
    func withHapticFeedback(style: UIImpactFeedbackGenerator.FeedbackStyle = .light) -> some View {
        self.onTapGesture {
            let impactFeedback = UIImpactFeedbackGenerator(style: style)
            impactFeedback.impactOccurred()
        }
    }
}

// MARK: - Animation Extensions
extension Animation {
    static var smooth: Animation {
        .spring(response: 0.4, dampingFraction: 0.8)
    }
    
    static var bouncy: Animation {
        .spring(response: 0.5, dampingFraction: 0.6)
    }
    
    static var gentle: Animation {
        .easeInOut(duration: 0.3)
    }
}