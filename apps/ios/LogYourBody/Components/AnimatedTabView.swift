//
//  AnimatedTabView.swift
//  LogYourBody
//
//  Tab view with matchedGeometryEffect for smooth transitions
//

import SwiftUI

struct AnimatedTabView: View {
    @Binding var selectedTab: Tab
    @Namespace private var namespace
    
    enum Tab: Int, CaseIterable {
        case dashboard = 0
        case log = 1
        case settings = 2
        
        var icon: String {
            switch self {
            case .dashboard: return "house"
            case .log: return "plus"
            case .settings: return "gearshape"
            }
        }
        
        var title: String {
            switch self {
            case .dashboard: return "Dashboard"
            case .log: return "Log"
            case .settings: return "Settings"
            }
        }
    }
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(Tab.allCases, id: \.self) { tab in
                TabButton(
                    tab: tab,
                    isSelected: selectedTab == tab,
                    namespace: namespace
                ) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        selectedTab = tab
                    }
                }
            }
        }
        .padding(.horizontal, 8)
        .frame(height: 49)
        .background(
            Color.appCard
                .cornerRadius(25)
                .overlay(
                    RoundedRectangle(cornerRadius: 25)
                        .stroke(Color.appBorder.opacity(0.2), lineWidth: 0.5)
                )
        )
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 2)
    }
}

struct TabButton: View {
    let tab: AnimatedTabView.Tab
    let isSelected: Bool
    let namespace: Namespace.ID
    let action: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                // Selection indicator - removed for cleaner look
                
                Image(systemName: tab.icon)
                    .font(.system(size: 24, weight: isSelected ? .medium : .regular))
                    .foregroundColor(isSelected ? .white : Color(white: 0.5))
                    .scaleEffect(isSelected ? 1.0 : 1.0)
            }
            .frame(height: 44)
        }
        .frame(maxWidth: .infinity)
        .scaleEffect(isPressed ? 0.9 : 1.0)
        .onTapGesture {
            action()
        }
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

// MARK: - Animated Card Transitions
struct AnimatedCard<Content: View>: View {
    let id: String
    let namespace: Namespace.ID
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        content()
            .matchedGeometryEffect(id: id, in: namespace)
            .transition(.asymmetric(
                insertion: .scale(scale: 0.8).combined(with: .opacity),
                removal: .scale(scale: 1.1).combined(with: .opacity)
            ))
    }
}

// MARK: - Animated Progress Ring
struct AnimatedProgressRing: View {
    let progress: Double
    let size: CGFloat
    let lineWidth: CGFloat
    @State private var animatedProgress: Double = 0
    
    var body: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.appBorder, lineWidth: lineWidth)
                .frame(width: size, height: size)
            
            // Progress ring
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(
                    AngularGradient(
                        gradient: Gradient(colors: [
                            Color.appPrimary,
                            Color.appPrimary.opacity(0.8)
                        ]),
                        center: .center,
                        startAngle: .degrees(0),
                        endAngle: .degrees(360)
                    ),
                    style: StrokeStyle(
                        lineWidth: lineWidth,
                        lineCap: .round
                    )
                )
                .frame(width: size, height: size)
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 0.8, dampingFraction: 0.8), value: animatedProgress)
        }
        .onAppear {
            animatedProgress = progress
        }
        .onChange(of: progress) { newValue in
            animatedProgress = newValue
        }
    }
}

// MARK: - Smooth State Change Container
struct SmoothStateContainer<Content: View>: View {
    @Namespace private var namespace
    let id: AnyHashable
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        content()
            .matchedGeometryEffect(id: id, in: namespace)
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: id)
    }
}