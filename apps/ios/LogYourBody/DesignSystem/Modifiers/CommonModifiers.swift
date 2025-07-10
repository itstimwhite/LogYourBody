//
//  CommonModifiers.swift
//  LogYourBody
//
//  Common view modifiers and styles for consistent UI
//

import SwiftUI

// MARK: - Interactive Scale Modifier

struct InteractiveScale: ViewModifier {
    @Environment(\.theme) var theme
    @State private var isPressed = false
    
    let scale: CGFloat
    
    init(scale: CGFloat = 0.97) {
        self.scale = scale
    }
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? scale : 1.0)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
                withAnimation(theme.animation.ultraFast) {
                    isPressed = pressing
                }
            }, perform: {})
    }
}

// MARK: - Shake Modifier

struct Shake: ViewModifier {
    @State private var shakeOffset: CGFloat = 0
    let trigger: Bool
    
    func body(content: Content) -> some View {
        content
            .offset(x: shakeOffset)
            .onChange(of: trigger) { newValue in
                if newValue {
                    performShake()
                }
            }
    }
    
    private func performShake() {
        withAnimation(.default) {
            shakeOffset = -10
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation(.default) {
                shakeOffset = 10
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            withAnimation(.default) {
                shakeOffset = -5
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            withAnimation(.default) {
                shakeOffset = 0
            }
        }
    }
}

// MARK: - Glow Modifier

struct Glow: ViewModifier {
    let color: Color
    let radius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .shadow(color: color.opacity(0.6), radius: radius / 2)
            .shadow(color: color.opacity(0.4), radius: radius)
            .shadow(color: color.opacity(0.2), radius: radius * 2)
    }
}

// MARK: - Loading Overlay Modifier

struct LoadingOverlay: ViewModifier {
    @Environment(\.theme) var theme
    let isLoading: Bool
    let message: String?
    
    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading)
                .blur(radius: isLoading ? 3 : 0)
            
            if isLoading {
                LoadingView(
                    message: message,
                    style: .overlay
                )
                .transition(.opacity)
            }
        }
        .animation(theme.animation.fast, value: isLoading)
    }
}

// MARK: - Error Banner Modifier

struct ErrorBanner: ViewModifier {
    @Environment(\.theme) var theme
    @Binding var error: String?
    
    var body: some View {
        VStack(spacing: 0) {
            // Error banner
            if let error = error {
                HStack(spacing: theme.spacing.sm) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 16))
                    
                    Text(error)
                        .font(theme.typography.bodySmall)
                        .lineLimit(2)
                    
                    Spacer()
                    
                    Button(action: { self.error = nil }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                    }
                }
                .foregroundColor(.white)
                .padding(theme.spacing.md)
                .background(theme.colors.error)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
            
            // Main content
            content
        }
        .animation(theme.animation.medium, value: error != nil)
    }
}

// MARK: - Parallax Scroll Modifier

struct ParallaxScroll: ViewModifier {
    let multiplier: CGFloat
    @State private var scrollOffset: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .offset(y: scrollOffset * multiplier)
            .background(
                GeometryReader { geo in
                    Color.clear
                        .preference(
                            key: ScrollOffsetPreferenceKey.self,
                            value: geo.frame(in: .global).minY
                        )
                }
            )
            .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
                scrollOffset = value
            }
    }
}

// MARK: - Conditional Modifier

struct ConditionalModifier<TrueModifier: ViewModifier, FalseModifier: ViewModifier>: ViewModifier {
    let condition: Bool
    let trueModifier: TrueModifier
    let falseModifier: FalseModifier
    
    func body(content: Content) -> some View {
        if condition {
            content.modifier(trueModifier)
        } else {
            content.modifier(falseModifier)
        }
    }
}

// MARK: - Button Styles

struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.theme) var theme
    @Environment(\.isEnabled) var isEnabled
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(theme.typography.labelLarge)
            .foregroundColor(theme.colors.background)
            .padding(.horizontal, theme.spacing.lg)
            .padding(.vertical, theme.spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: theme.radius.button)
                    .fill(theme.colors.primary)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(isEnabled ? 1.0 : 0.6)
            .animation(theme.animation.ultraFast, value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    @Environment(\.theme) var theme
    @Environment(\.isEnabled) var isEnabled
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(theme.typography.labelLarge)
            .foregroundColor(theme.colors.primary)
            .padding(.horizontal, theme.spacing.lg)
            .padding(.vertical, theme.spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: theme.radius.button)
                    .fill(theme.colors.primary.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: theme.radius.button)
                            .stroke(theme.colors.primary.opacity(0.5), lineWidth: 1.5)
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(isEnabled ? 1.0 : 0.6)
            .animation(theme.animation.ultraFast, value: configuration.isPressed)
    }
}

struct GhostButtonStyle: ButtonStyle {
    @Environment(\.theme) var theme
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(theme.typography.labelMedium)
            .foregroundColor(theme.colors.primary)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(theme.animation.ultraFast, value: configuration.isPressed)
    }
}

// MARK: - View Extensions

extension View {
    // Interactive modifiers
    func interactiveScale(_ scale: CGFloat = 0.97) -> some View {
        modifier(InteractiveScale(scale: scale))
    }
    
    func shake(trigger: Bool) -> some View {
        modifier(Shake(trigger: trigger))
    }
    
    func glow(color: Color, radius: CGFloat = 10) -> some View {
        modifier(Glow(color: color, radius: radius))
    }
    
    // State modifiers
    func loadingOverlay(isLoading: Bool, message: String? = nil) -> some View {
        modifier(LoadingOverlay(isLoading: isLoading, message: message))
    }
    
    func errorBanner(_ error: Binding<String?>) -> some View {
        modifier(ErrorBanner(error: error))
    }
    
    func parallaxScroll(multiplier: CGFloat = 0.5) -> some View {
        modifier(ParallaxScroll(multiplier: multiplier))
    }
    
    // Conditional modifier
    func conditional<TM: ViewModifier, FM: ViewModifier>(
        _ condition: Bool,
        trueModifier: TM,
        falseModifier: FM
    ) -> some View {
        modifier(ConditionalModifier(
            condition: condition,
            trueModifier: trueModifier,
            falseModifier: falseModifier
        ))
    }
    
    // Common animations
    func fadeIn(delay: Double = 0) -> some View {
        opacity(0)
            .onAppear {
                withAnimation(.easeIn(duration: 0.3).delay(delay)) {
                    opacity(1)
                }
            }
    }
    
    func slideIn(from edge: Edge = .bottom, delay: Double = 0) -> some View {
        transition(.move(edge: edge).combined(with: .opacity))
            .animation(.spring(response: 0.5, dampingFraction: 0.8).delay(delay), value: true)
    }
}

// MARK: - Shape Extensions

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

// MARK: - Layout Helpers

struct LayoutReader<Content: View>: View {
    @Binding var size: CGSize
    let content: () -> Content
    
    var body: some View {
        content()
            .background(
                GeometryReader { geo in
                    Color.clear
                        .onAppear { size = geo.size }
                        .onChange(of: geo.size) { size = $0 }
                }
            )
    }
}

// MARK: - Safe Area Extension

extension View {
    var safeAreaTop: CGFloat {
        UIApplication.shared.windows.first?.safeAreaInsets.top ?? 0
    }
    
    var safeAreaBottom: CGFloat {
        UIApplication.shared.windows.first?.safeAreaInsets.bottom ?? 0
    }
}