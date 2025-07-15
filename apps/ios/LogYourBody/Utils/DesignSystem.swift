//
// DesignSystem.swift
// LogYourBody
//
import SwiftUI
import UIKit

// MARK: - Adaptive Color System

extension Color {
    // Context-specific accent colors
    static let adaptiveGreen = Color(uiColor: .systemGreen)
    static let adaptiveOrange = Color(uiColor: .systemOrange)
    static let adaptiveGray = Color(uiColor: .systemGray)
    
    // Semantic colors for different states
    static func accentForState(_ state: MetricState) -> Color {
        switch state {
        case .inTarget:
            return .adaptiveGreen
        case .estimated, .processing:
            return .adaptiveOrange
        case .disabled, .inactive:
            return .adaptiveGray
        }
    }
    
    // Progress-based color
    static func progressColor(for value: Double, target: Double, tolerance: Double = 0.1) -> Color {
        let ratio = value / target
        if abs(ratio - 1.0) <= tolerance {
            return .adaptiveGreen // In target range
        } else if ratio < 0.9 || ratio > 1.1 {
            return .adaptiveOrange // Far from target
        } else {
            return .accentColor // Default accent
        }
    }
}

enum MetricState {
    case inTarget
    case estimated
    case processing
    case disabled
    case inactive
}

// MARK: - Haptic Feedback Manager

class HapticManager {
    static let shared = HapticManager()
    
    private let impactLight = UIImpactFeedbackGenerator(style: .light)
    private let impactMedium = UIImpactFeedbackGenerator(style: .medium)
    private let selection = UISelectionFeedbackGenerator()
    private let notification = UINotificationFeedbackGenerator()
    
    private init() {
        impactLight.prepare()
        impactMedium.prepare()
        selection.prepare()
        notification.prepare()
    }
    
    // Ring threshold crossing
    func ringThresholdCrossed(entering: Bool) {
        if entering {
            notification.notificationOccurred(.success)
        } else {
            impactLight.impactOccurred()
        }
    }
    
    // Slider interactions
    func sliderStarted() {
        impactMedium.impactOccurred()
    }
    
    func sliderChanged() {
        selection.selectionChanged()
    }
    
    func sliderEnded() {
        impactLight.impactOccurred()
    }
    
    // General interactions
    func buttonTapped() {
        impactLight.impactOccurred()
    }
    
    func toggleChanged() {
        impactMedium.impactOccurred()
    }
    
    func success() {
        notification.notificationOccurred(.success)
    }
    
    func warning() {
        notification.notificationOccurred(.warning)
    }
    
    func error() {
        notification.notificationOccurred(.error)
    }
}

// MARK: - Edge-to-Edge View Modifier

struct EdgeToEdgeModifier: ViewModifier {
    let edges: Edge.Set
    let respectingSafeArea: Bool
    
    func body(content: Content) -> some View {
        if respectingSafeArea {
            content
                .ignoresSafeArea(.container, edges: edges)
        } else {
            content
                .ignoresSafeArea(.all, edges: edges)
        }
    }
}

extension View {
    func edgeToEdge(_ edges: Edge.Set = .all, respectingSafeArea: Bool = true) -> some View {
        modifier(EdgeToEdgeModifier(edges: edges, respectingSafeArea: respectingSafeArea))
    }
}

// MARK: - Smart Background Blur

struct SmartBlurModifier: ViewModifier {
    let isPresented: Bool
    let radius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .blur(radius: isPresented ? radius : 0)
            .animation(.easeInOut(duration: 0.3), value: isPresented)
            .allowsHitTesting(!isPresented)
    }
}

extension View {
    func smartBlur(isPresented: Bool, radius: CGFloat = 8) -> some View {
        modifier(SmartBlurModifier(isPresented: isPresented, radius: radius))
    }
}

// MARK: - Matched Geometry Namespace Helper

struct MatchedGeometryNamespace {
    static let photoSelection = "photoSelection"
    static let metricRing = "metricRing"
    static let progressCard = "progressCard"
}

// MARK: - Haptic View Modifiers

struct HapticOnChangeModifier<Value: Equatable>: ViewModifier {
    let value: Value
    let action: (Value, Value) -> Void
    @State private var previousValue: Value
    
    init(value: Value, action: @escaping (Value, Value) -> Void) {
        self.value = value
        self.action = action
        self._previousValue = State(initialValue: value)
    }
    
    func body(content: Content) -> some View {
        content
            .onChange(of: value) { oldValue, newValue in
                action(oldValue, newValue)
                previousValue = newValue
            }
    }
}

extension View {
    func hapticOnChange<Value: Equatable>(of value: Value, perform: @escaping (Value, Value) -> Void) -> some View {
        modifier(HapticOnChangeModifier(value: value, action: perform))
    }
    
    // Specific haptic helpers
    func hapticOnTap() -> some View {
        self.onTapGesture {
            HapticManager.shared.buttonTapped()
        }
    }
    
    func hapticOnToggle() -> some View {
        self.onChange(of: true) { _, _ in
            HapticManager.shared.toggleChanged()
        }
    }
}
