//
// DesignSystem.swift
// LogYourBody
//
// Central import for all design system components
//

import SwiftUI

// MARK: - Design System Namespace

public enum DesignSystem {
    // This enum serves as a namespace for the design system
}

// MARK: - Theme Setup

extension View {
    /// Applies the LogYourBody theme to the view hierarchy
    func applyTheme() -> some View {
        self
            .theme(DefaultTheme())
            .preferredColorScheme(.dark)
            .tint(DefaultTheme().colors.primary)
    }
}

// MARK: - Common Component Typealiases

typealias DSButton = StandardButton
typealias DSCard = StandardCard
typealias DSTextField = StandardTextField
typealias DSHeader = StandardHeader
// MetricCard is already available in StandardCard.swift
typealias DSSettingsRow = DesignSettingsRow
typealias DSLoadingView = DesignLoadingView
typealias DSEmptyState = EmptyStateView

// MARK: - Quick Access Extensions

extension DesignSystem {
    /// Quick access to theme colors
    static var colors: ColorTheme {
        DefaultTheme().colors
    }
    
    /// Quick access to theme typography
    static var typography: TypographyTheme {
        DefaultTheme().typography
    }
    
    /// Quick access to theme spacing
    static var spacing: SpacingTheme {
        DefaultTheme().spacing
    }
    
    /// Quick access to theme radius
    static var radius: RadiusTheme {
        DefaultTheme().radius
    }
    
    /// Quick access to theme animations
    static var animation: AnimationTheme {
        DefaultTheme().animation
    }
}

// MARK: - Preview Helpers

/// A container view for previewing components with the design system theme
struct DesignSystemPreview<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    
    init(_ title: String = "", @ViewBuilder content: @escaping () -> Content) {
        self.title = title
        self.content = content
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            if !title.isEmpty {
                Text(title)
                    .font(.title3)
                    .bold()
                    .foregroundColor(.white)
            }
            
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.black)
        .applyTheme()
    }
}

// MARK: - Component Factory

extension DesignSystem {
    /// Factory methods for creating common components with default styling
    enum Components {
        // MARK: - Buttons
        
        static func primaryButton(_ title: String, action: @escaping () -> Void) -> some View {
            StandardButton(title, style: .primary, action: action)
        }
        
        static func secondaryButton(_ title: String, action: @escaping () -> Void) -> some View {
            StandardButton(title, style: .secondary, action: action)
        }
        
        static func destructiveButton(_ title: String, action: @escaping () -> Void) -> some View {
            StandardButton(title, style: .destructive, action: action)
        }
        
        // MARK: - Cards
        
        static func card<Content: View>(@ViewBuilder content: @escaping () -> Content) -> some View {
            StandardCard(content: content)
        }
        
        static func elevatedCard<Content: View>(@ViewBuilder content: @escaping () -> Content) -> some View {
            StandardCard(style: .elevated, content: content)
        }
        
        static func glassCard<Content: View>(@ViewBuilder content: @escaping () -> Content) -> some View {
            StandardCard(style: .glass, content: content)
        }
        
        // MARK: - Text Fields
        
        static func textField(
            text: Binding<String>,
            placeholder: String,
            label: String? = nil,
            icon: String? = nil
        ) -> some View {
            StandardTextField(
                text: text,
                placeholder: placeholder,
                label: label,
                icon: icon
            )
        }
        
        static func emailField(
            text: Binding<String>,
            label: String = "Email"
        ) -> some View {
            StandardTextField(
                text: text,
                placeholder: "Enter your email",
                label: label,
                icon: "envelope",
                keyboardType: .emailAddress,
                textContentType: .emailAddress
            )
        }
        
        static func passwordField(
            text: Binding<String>,
            label: String = "Password"
        ) -> some View {
            StandardTextField(
                text: text,
                placeholder: "Enter your password",
                label: label,
                icon: "lock",
                textContentType: .password
            )
        }
        
        // MARK: - Headers
        
        static func header(title: String, showBackButton: Bool = true) -> some View {
            StandardHeader(title: title, showBackButton: showBackButton)
        }
        
        static func largeHeader(title: String, subtitle: String? = nil) -> some View {
            StandardHeader(title: title, subtitle: subtitle, style: .large)
        }
        
        // MARK: - State Views
        
        static func loading(message: String? = "Loading...") -> some View {
            DesignLoadingView(message: message, style: .standard)
        }
        
        static func empty(
            icon: String,
            title: String,
            description: String
        ) -> some View {
            EmptyStateView(
                icon: icon,
                title: title,
                description: description
            )
        }
    }
}

// MARK: - Layout Utilities

extension DesignSystem {
    /// Common layout configurations
    enum Layout {
        /// Standard screen padding
        static let screenPadding: CGFloat = 16
        
        /// Standard content width for forms
        static let contentMaxWidth: CGFloat = 600
        
        /// Standard list item height
        static let listItemHeight: CGFloat = 56
        
        /// Standard card aspect ratios
        static let cardAspectRatio: CGFloat = 1.6
        static let squareAspectRatio: CGFloat = 1.0
        static let wideAspectRatio: CGFloat = 2.4
    }
}

// MARK: - Accessibility

extension View {
    /// Applies standard accessibility modifiers for interactive elements
    func accessibleInteractive(
        label: String,
        hint: String? = nil,
        traits: AccessibilityTraits = .isButton
    ) -> some View {
        self
            .accessibilityLabel(label)
            .accessibilityHint(hint ?? "")
            .accessibilityAddTraits(traits)
    }
    
    /// Applies standard accessibility modifiers for text elements
    func accessibleText(
        label: String? = nil,
        traits: AccessibilityTraits = .isStaticText
    ) -> some View {
        self
            .accessibilityLabel(label ?? "")
            .accessibilityAddTraits(traits)
    }
}
