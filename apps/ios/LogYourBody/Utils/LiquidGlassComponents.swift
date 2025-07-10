//
//  LiquidGlassComponents.swift
//  LogYourBody
//
//  Combined LiquidGlass components for iOS 26+ with backwards compatibility
//

import SwiftUI

// MARK: - LiquidGlass Background

struct LiquidGlassBackground: View {
    // Customization options
    var opacity: Double = 0.8
    var blurRadius: CGFloat = 20
    var saturation: Double = 1.2
    var showGradient: Bool = true
    var gradientColors: [Color] = [
        Color.blue.opacity(0.1),
        Color.blue.opacity(0.05),
        Color.clear
    ]
    
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            // Base background color for all iOS versions
            Group {
                if colorScheme == .dark {
                    Color.black
                } else {
                    Color.white
                }
            }
            .ignoresSafeArea()
            
            // Gradient overlay for depth (all iOS versions)
            if showGradient {
                LinearGradient(
                    colors: gradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            }
            
            // LiquidGlass effect for iOS 26+
            if #available(iOS 26, *) {
                LiquidGlassView(
                    opacity: opacity,
                    blurRadius: blurRadius,
                    saturation: saturation
                )
                .ignoresSafeArea()
            }
        }
    }
}

// iOS 26+ LiquidGlass implementation
@available(iOS 26, *)
struct LiquidGlassView: View {
    let opacity: Double
    let blurRadius: CGFloat
    let saturation: Double
    
    @State private var animationPhase: Double = 0
    
    var body: some View {
        Canvas { context, size in
            // Apply filters to entire context
            context.opacity = opacity
            
            // Draw morphing shapes with animation phase
            let time = animationPhase
            
            // Primary blob
            context.drawLayer { ctx in
                let path = createLiquidPath(
                    in: CGRect(origin: .zero, size: size),
                    time: time,
                    seed: 1
                )
                ctx.fill(path, with: .color(.white))
            }
            
            // Secondary blob with reduced opacity
            context.drawLayer { ctx in
                let path = createLiquidPath(
                    in: CGRect(origin: .zero, size: size),
                    time: time * 0.7,
                    seed: 2
                )
                ctx.opacity = 0.5
                ctx.fill(path, with: .color(.white))
            }
        }
        .blur(radius: blurRadius)
        .blendMode(.plusLighter)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
        .onAppear {
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                animationPhase = .pi * 2
            }
        }
    }
    
    private func createLiquidPath(in rect: CGRect, time: TimeInterval, seed: Int) -> Path {
        var path = Path()
        
        let points = 8
        let angleStep = (2 * .pi) / Double(points)
        let centerX = rect.midX
        let centerY = rect.midY
        let baseRadius = min(rect.width, rect.height) * 0.3
        
        // Create control points for smooth curves
        var controlPoints: [(CGPoint, CGPoint, CGPoint)] = []
        
        for i in 0..<points {
            let angle = Double(i) * angleStep
            _ = Double((i + 1) % points) * angleStep
            
            // Animate radius with multiple sine waves
            let radiusVariation = sin(time * 0.5 + angle * 2 + Double(seed)) * 0.2 +
                                  sin(time * 0.8 + angle * 3) * 0.1
            let radius = baseRadius * (1 + radiusVariation)
            
            // Calculate point position
            let x = centerX + cos(angle) * radius
            let y = centerY + sin(angle) * radius
            let point = CGPoint(x: x, y: y)
            
            // Calculate control points for bezier curves
            let controlRadius = radius * 0.55
            let cp1 = CGPoint(
                x: centerX + cos(angle - angleStep * 0.3) * (radius + controlRadius),
                y: centerY + sin(angle - angleStep * 0.3) * (radius + controlRadius)
            )
            let cp2 = CGPoint(
                x: centerX + cos(angle + angleStep * 0.3) * (radius + controlRadius),
                y: centerY + sin(angle + angleStep * 0.3) * (radius + controlRadius)
            )
            
            controlPoints.append((cp1, point, cp2))
        }
        
        // Build smooth path
        if let firstPoint = controlPoints.first {
            path.move(to: firstPoint.1)
            
            for i in 0..<controlPoints.count {
                let current = controlPoints[i]
                let next = controlPoints[(i + 1) % controlPoints.count]
                
                path.addCurve(
                    to: next.1,
                    control1: current.2,
                    control2: next.0
                )
            }
            
            path.closeSubpath()
        }
        
        return path
    }
}

// MARK: - LiquidGlass Accent

struct LiquidGlassAccent: View {
    var color: Color = .blue
    var opacity: Double = 0.3
    var animationSpeed: Double = 1.0
    var size: CGSize = CGSize(width: 200, height: 200)
    
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            if #available(iOS 26, *) {
                // iOS 26+ animated liquid accent
                LiquidAccentShape(animationSpeed: animationSpeed)
                    .fill(color.opacity(opacity))
                    .frame(width: size.width, height: size.height)
                    .blur(radius: 30)
                    .rotationEffect(.degrees(isAnimating ? 360 : 0))
                    .scaleEffect(isAnimating ? 1.2 : 0.8)
                    .animation(
                        .easeInOut(duration: 20 / animationSpeed)
                        .repeatForever(autoreverses: true),
                        value: isAnimating
                    )
                    .onAppear {
                        isAnimating = true
                    }
            } else {
                // iOS 18 static gradient fallback
                RadialGradient(
                    colors: [
                        color.opacity(opacity),
                        color.opacity(opacity * 0.5),
                        Color.clear
                    ],
                    center: .center,
                    startRadius: 0,
                    endRadius: size.width / 2
                )
                .frame(width: size.width, height: size.height)
                .blur(radius: 20)
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}

// iOS 26+ animated shape
@available(iOS 26, *)
struct LiquidAccentShape: Shape {
    var animationSpeed: Double = 1.0
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let points = 6
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        
        for i in 0..<points {
            let angle = (Double(i) / Double(points)) * 2 * .pi
            let x = center.x + cos(angle) * radius
            let y = center.y + sin(angle) * radius
            
            if i == 0 {
                path.move(to: CGPoint(x: x, y: y))
            } else {
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        
        path.closeSubpath()
        return path
    }
}

// MARK: - LiquidGlass Button

struct LiquidGlassButton: View {
    let title: String
    let action: () -> Void
    var color: Color = .blue
    var textColor: Color = .white
    var height: CGFloat = 48
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            ZStack {
                // Background
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(color)
                
                // Liquid overlay
                if #available(iOS 26, *) {
                    RoundedRectangle(cornerRadius: height / 2)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(isPressed ? 0.1 : 0.2),
                                    Color.white.opacity(isPressed ? 0.05 : 0.1),
                                    Color.clear
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .animation(.easeInOut(duration: 0.2), value: isPressed)
                }
                
                // Title
                Text(title)
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundColor(textColor)
            }
            .frame(height: height)
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(
            minimumDuration: 0,
            maximumDistance: .infinity,
            pressing: { pressing in
                isPressed = pressing
            },
            perform: {}
        )
    }
}

// MARK: - Extensions

extension View {
    func liquidGlassBackground(
        opacity: Double = 0.8,
        blurRadius: CGFloat = 20,
        saturation: Double = 1.2,
        showGradient: Bool = true,
        gradientColors: [Color]? = nil
    ) -> some View {
        self.background(
            LiquidGlassBackground(
                opacity: opacity,
                blurRadius: blurRadius,
                saturation: saturation,
                showGradient: showGradient,
                gradientColors: gradientColors ?? [
                    Color.blue.opacity(0.1),
                    Color.blue.opacity(0.05),
                    Color.clear
                ]
            )
        )
    }
}