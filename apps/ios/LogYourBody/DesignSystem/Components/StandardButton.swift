//
//  StandardButton.swift
//  LogYourBody
//
//  Reusable button component following Apple's design guidelines
//

import SwiftUI

// MARK: - Button Style Enum

enum ButtonStyle {
    case primary
    case secondary
    case tertiary
    case destructive
    case ghost
}

// MARK: - Button Size Enum

enum ButtonSize {
    case small
    case medium
    case large
    
    var height: CGFloat {
        switch self {
        case .small: return 36
        case .medium: return 44
        case .large: return 56
        }
    }
    
    var horizontalPadding: CGFloat {
        switch self {
        case .small: return 16
        case .medium: return 20
        case .large: return 24
        }
    }
    
    var fontSize: CGFloat {
        switch self {
        case .small: return 14
        case .medium: return 16
        case .large: return 18
        }
    }
}

// MARK: - Standard Button

struct StandardButton: View {
    @Environment(\.theme) var theme
    @Environment(\.isEnabled) var isEnabled
    
    let title: String
    let icon: String?
    let style: ButtonStyle
    let size: ButtonSize
    let isLoading: Bool
    let fullWidth: Bool
    let action: () -> Void
    
    @State private var isPressed = false
    
    init(
        _ title: String,
        icon: String? = nil,
        style: ButtonStyle = .primary,
        size: ButtonSize = .medium,
        isLoading: Bool = false,
        fullWidth: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.style = style
        self.size = size
        self.isLoading = isLoading
        self.fullWidth = fullWidth
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            if !isLoading {
                theme.haptics.impact(.light)
                action()
            }
        }) {
            HStack(spacing: theme.spacing.xs) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: foregroundColor))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.system(size: size.fontSize * 0.9, weight: .medium))
                    }
                    
                    Text(title)
                        .font(.system(size: size.fontSize, weight: .semibold, design: .rounded))
                }
            }
            .foregroundColor(foregroundColor)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .frame(height: size.height)
            .padding(.horizontal, size.horizontalPadding)
            .background(backgroundView)
            .cornerRadius(theme.radius.button)
            .overlay(overlayView)
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .animation(theme.animation.interactive, value: isPressed)
            .opacity(isEnabled && !isLoading ? 1.0 : 0.6)
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(isLoading || !isEnabled)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(theme.animation.ultraFast) {
                isPressed = pressing
            }
        }, perform: {})
    }
    
    // MARK: - Computed Properties
    
    private var foregroundColor: Color {
        switch style {
        case .primary:
            return theme.colors.background
        case .secondary:
            return theme.colors.primary
        case .tertiary:
            return theme.colors.text
        case .destructive:
            return .white
        case .ghost:
            return theme.colors.text
        }
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        switch style {
        case .primary:
            theme.colors.primary
        case .secondary:
            theme.colors.primary.opacity(0.1)
        case .tertiary:
            theme.colors.surface
        case .destructive:
            theme.colors.error
        case .ghost:
            Color.clear
        }
    }
    
    @ViewBuilder
    private var overlayView: some View {
        switch style {
        case .secondary:
            RoundedRectangle(cornerRadius: theme.radius.button)
                .stroke(theme.colors.primary.opacity(0.5), lineWidth: 1.5)
        case .tertiary:
            RoundedRectangle(cornerRadius: theme.radius.button)
                .stroke(theme.colors.border, lineWidth: 1)
        default:
            EmptyView()
        }
    }
}

// MARK: - Icon Button

struct IconButton: View {
    @Environment(\.theme) var theme
    @Environment(\.isEnabled) var isEnabled
    
    let icon: String
    let size: CGFloat
    let action: () -> Void
    
    @State private var isPressed = false
    
    init(
        icon: String,
        size: CGFloat = 24,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.size = size
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            theme.haptics.impact(.light)
            action()
        }) {
            Image(systemName: icon)
                .font(.system(size: size, weight: .medium))
                .foregroundColor(theme.colors.text)
                .frame(width: size * 1.8, height: size * 1.8)
                .background(
                    Circle()
                        .fill(theme.colors.surface)
                        .overlay(
                            Circle()
                                .stroke(theme.colors.border, lineWidth: 1)
                        )
                )
                .scaleEffect(isPressed ? 0.9 : 1.0)
                .opacity(isEnabled ? 1.0 : 0.6)
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(!isEnabled)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(theme.animation.ultraFast) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

// MARK: - Text Button

struct TextButton: View {
    @Environment(\.theme) var theme
    
    let title: String
    let color: Color?
    let action: () -> Void
    
    init(
        _ title: String,
        color: Color? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.color = color
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            theme.haptics.selection()
            action()
        }) {
            Text(title)
                .font(theme.typography.labelMedium)
                .foregroundColor(color ?? theme.colors.primary)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Floating Action Button

struct FloatingActionButton: View {
    @Environment(\.theme) var theme
    
    let icon: String
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            theme.haptics.impact(.medium)
            action()
        }) {
            Image(systemName: icon)
                .font(.system(size: 24, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 56, height: 56)
                .background(
                    Circle()
                        .fill(theme.colors.primary)
                        .shadow(
                            color: theme.colors.primary.opacity(0.3),
                            radius: 8,
                            x: 0,
                            y: 4
                        )
                )
                .scaleEffect(isPressed ? 0.9 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(theme.animation.interactive) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

// MARK: - Preview

struct StandardButton_Previews: PreviewProvider {
    static var previews: some View {
        ThemePreview {
            VStack(spacing: 20) {
                // Primary buttons
                StandardButton("Get Started", style: .primary) {}
                StandardButton("Continue", icon: "arrow.right", style: .primary) {}
                StandardButton("Loading", style: .primary, isLoading: true) {}
                
                // Secondary buttons
                StandardButton("Learn More", style: .secondary) {}
                StandardButton("Upload", icon: "arrow.up", style: .secondary) {}
                
                // Tertiary buttons
                StandardButton("Cancel", style: .tertiary) {}
                
                // Destructive button
                StandardButton("Delete", icon: "trash", style: .destructive) {}
                
                // Ghost button
                StandardButton("Skip", style: .ghost) {}
                
                // Size variations
                StandardButton("Small", size: .small) {}
                StandardButton("Medium", size: .medium) {}
                StandardButton("Large", size: .large) {}
                
                // Full width
                StandardButton("Full Width", style: .primary, fullWidth: true) {}
                
                // Icon buttons
                HStack {
                    IconButton(icon: "plus") {}
                    IconButton(icon: "camera") {}
                    IconButton(icon: "gear") {}
                }
                
                // Text button
                TextButton("Forgot password?") {}
                
                // Floating action button
                FloatingActionButton(icon: "plus") {}
            }
            .padding()
            .background(Color.black)
        }
    }
}