//
// LiquidGlassCTAButton.swift
// LogYourBody
//
// Unified CTA button component with Liquid Glass design
// for iOS 26+ with graceful fallback
// import SwiftUI

struct LiquidGlassCTAButton: View {
    let text: String
    let icon: String?
    let action: () -> Void
    let isEnabled: Bool
    
    @State private var isPressed = false
    
    // Convenience initializers
    init(
        text: String,
        action: @escaping () -> Void,
        isEnabled: Bool = true
    ) {
        self.text = text
        self.icon = nil
        self.action = action
        self.isEnabled = isEnabled
    }
    
    init(
        text: String,
        icon: String,
        action: @escaping () -> Void,
        isEnabled: Bool = true
    ) {
        self.text = text
        self.icon = icon
        self.action = action
        self.isEnabled = isEnabled
    }
    
    var body: some View {
        Button(action: {
            if isEnabled {
                HapticManager.shared.buttonTapped()
                action()
            }
        }) {
            HStack(spacing: 8) {
                Text(text)
                    .font(.system(size: 17, weight: .semibold))
                
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .medium))
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .foregroundColor(textColor)
            .background(backgroundView)
            .overlay(overlayView)
            .clipShape(RoundedRectangle(cornerRadius: 28))
        }
        .disabled(!isEnabled)
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: isPressed)
        .onLongPressGesture(
            minimumDuration: 0,
            maximumDistance: .infinity,
            pressing: { pressing in
                isPressed = pressing
            },
            perform: {}
        )
    }
    
    // MARK: - Styling Components
    
    private var textColor: Color {
        if isEnabled {
            return .black
        } else {
            return .white.opacity(0.5)
        }
    }
    
    @ViewBuilder private var backgroundView: some View {
        if #available(iOS 18.0, *) {
            // iOS 26 Liquid Glass style
            if isEnabled {
                // Enabled: Clean white with ultra thin material
                RoundedRectangle(cornerRadius: 28)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 28)
                            .fill(Material.ultraThin)
                            .opacity(0.1)
                    )
            } else {
                // Disabled: Dark glass
                RoundedRectangle(cornerRadius: 28)
                    .fill(Color.white.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 28)
                            .fill(Material.ultraThin)
                            .opacity(0.2)
                    )
            }
        } else {
            // Fallback for older iOS versions
            RoundedRectangle(cornerRadius: 28)
                .fill(
                    isEnabled ? Color.white : Color.white.opacity(0.1)
                )
        }
    }
    
    @ViewBuilder private var overlayView: some View {
        if isEnabled {
            // Only show border overlay when enabled for cleaner look
            RoundedRectangle(cornerRadius: 28)
                .stroke(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.3),
                            Color.white.opacity(0.0)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        }
    }
}

// MARK: - Convenience Extensions

extension View {
    /// Apply the unified CTA button style to any button
    func liquidGlassCTAStyle(isEnabled: Bool = true) -> some View {
        self
            .font(.system(size: 17, weight: .semibold))
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .foregroundColor(isEnabled ? .black : .white.opacity(0.5))
            .modifier(LiquidGlassCTAModifier(isEnabled: isEnabled))
    }
}

// MARK: - View Modifier for existing buttons

struct LiquidGlassCTAModifier: ViewModifier {
    let isEnabled: Bool
    
    func body(content: Content) -> some View {
        content
            .background(backgroundView)
            .overlay(overlayView)
            .clipShape(RoundedRectangle(cornerRadius: 28))
    }
    
    @ViewBuilder private var backgroundView: some View {
        if #available(iOS 18.0, *) {
            if isEnabled {
                RoundedRectangle(cornerRadius: 28)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 28)
                            .fill(Material.ultraThin)
                            .opacity(0.1)
                    )
            } else {
                RoundedRectangle(cornerRadius: 28)
                    .fill(Color.white.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 28)
                            .fill(Material.ultraThin)
                            .opacity(0.2)
                    )
            }
        } else {
            RoundedRectangle(cornerRadius: 28)
                .fill(
                    isEnabled ? Color.white : Color.white.opacity(0.1)
                )
        }
    }
    
    @ViewBuilder private var overlayView: some View {
        if isEnabled {
            RoundedRectangle(cornerRadius: 28)
                .stroke(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.3),
                            Color.white.opacity(0.0)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        }
    }
}

// MARK: - Secondary CTA Style (for skip/alternative actions)

struct LiquidGlassSecondaryCTAButton: View {
    let text: String
    let action: () -> Void
    
    var body: some View {
        Button(action: {
            HapticManager.shared.buttonTapped()
            action()
        }) {
            Text(text)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                )
        }
    }
}

// MARK: - Preview

#if DEBUG
struct LiquidGlassCTAButton_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // Primary enabled
                LiquidGlassCTAButton(
                    text: "Get Started",
                    icon: "arrow.right",
                    action: {},
                    isEnabled: true
                )
                
                // Primary disabled
                LiquidGlassCTAButton(
                    text: "Continue",
                    icon: "arrow.right",
                    action: {},
                    isEnabled: false
                )
                
                // Secondary
                LiquidGlassSecondaryCTAButton(
                    text: "Skip",
                    action: {}
                )
                
                // Using modifier on existing button
                Button(action: {}) {
                    Text("Custom Button")
                }
                .liquidGlassCTAStyle(isEnabled: true)
            }
            .padding()
        }
        .preferredColorScheme(.dark)
    }
}
#endif
