//
//  ProgressPhotoCutoutView.swift
//  LogYourBody
//
//  Created for displaying AI-processed cutout photos with Apple-style presentation
//

import SwiftUI

struct ProgressPhotoCutoutView: View {
    let currentMetric: BodyMetrics?
    let historicalMetrics: [BodyMetrics]
    @State private var selectedIndex: Int = 0
    @State private var dragOffset: CGSize = .zero
    @State private var isDragging = false
    @EnvironmentObject var authManager: AuthManager
    
    // Computed properties
    private var displayMetrics: [BodyMetrics] {
        historicalMetrics.filter { $0.photoUrl != nil }
    }
    
    private var currentBodyFat: Double {
        currentMetric?.bodyFatPercentage ?? 20.0
    }
    
    private var spotlightGradient: LinearGradient {
        // Dynamic gradient based on body fat percentage
        // Green (low) -> Yellow (medium) -> Orange/Red (high)
        let hue: Double = {
            if currentBodyFat < 10 {
                return 120 // Green
            } else if currentBodyFat < 15 {
                return 90 // Yellow-Green
            } else if currentBodyFat < 20 {
                return 60 // Yellow
            } else if currentBodyFat < 25 {
                return 30 // Orange
            } else {
                return 0 // Red
            }
        }()
        
        return LinearGradient(
            gradient: Gradient(colors: [
                Color(hue: hue/360, saturation: 0.6, brightness: 0.8).opacity(0.3),
                Color(hue: hue/360, saturation: 0.4, brightness: 0.6).opacity(0.1),
                Color.clear
            ]),
            startPoint: .bottom,
            endPoint: .top
        )
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Dynamic gradient spotlight
                Circle()
                    .fill(spotlightGradient)
                    .frame(width: geometry.size.width * 1.2, height: geometry.size.width * 1.2)
                    .blur(radius: 40)
                    .offset(y: geometry.size.height * 0.3)
                    .animation(.easeInOut(duration: 1.0), value: currentBodyFat)
                
                if displayMetrics.isEmpty {
                    // Placeholder when no photos
                    PlaceholderSilhouetteView(gender: authManager.currentUser?.profile?.gender ?? "male")
                } else {
                    // Progress stack and carousel
                    ZStack {
                        // Historical photos stack (behind current)
                        ForEach(Array(displayMetrics.suffix(3).enumerated()), id: \.element.id) { index, metric in
                            if index < displayMetrics.count - 1 {
                                CutoutPhotoView(
                                    photoUrl: metric.photoUrl,
                                    scale: 0.92 + (Double(index) * 0.02),
                                    offset: CGSize(
                                        width: 0,
                                        height: -20 * Double(displayMetrics.count - 1 - index)
                                    ),
                                    opacity: 0.3 + (Double(index) * 0.2),
                                    tintColor: Color.appPrimary.opacity(0.1)
                                )
                                .allowsHitTesting(false)
                            }
                        }
                        
                        // Current photo (interactive carousel)
                        if selectedIndex < displayMetrics.count {
                            HStack(spacing: -geometry.size.width * 0.6) {
                                ForEach(Array(displayMetrics.enumerated()), id: \.element.id) { index, metric in
                                    CutoutPhotoView(
                                        photoUrl: metric.photoUrl,
                                        scale: index == selectedIndex ? 1.0 : 0.8,
                                        offset: .zero,
                                        opacity: index == selectedIndex ? 1.0 : 0.3,
                                        showShadow: index == selectedIndex
                                    )
                                    .frame(width: geometry.size.width * 0.8)
                                    .scaleEffect(index == selectedIndex ? 1.0 : 0.8)
                                    .opacity(abs(Double(index - selectedIndex)) <= 1 ? 1.0 : 0.0)
                                }
                            }
                            .offset(x: CGFloat(-selectedIndex) * (geometry.size.width * 0.2) + dragOffset.width)
                            .animation(.interactiveSpring(), value: selectedIndex)
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        dragOffset = value.translation
                                        isDragging = true
                                    }
                                    .onEnded { value in
                                        let threshold: CGFloat = 50
                                        withAnimation(.spring()) {
                                            if value.translation.width > threshold && selectedIndex > 0 {
                                                selectedIndex -= 1
                                            } else if value.translation.width < -threshold && selectedIndex < displayMetrics.count - 1 {
                                                selectedIndex += 1
                                            }
                                            dragOffset = .zero
                                        }
                                        isDragging = false
                                    }
                            )
                        }
                    }
                }
                
                // Metrics overlay
                if let metric = currentMetric {
                    VStack {
                        Spacer()
                        MetricsOverlayView(metric: metric)
                            .padding(.bottom, 40)
                    }
                }
            }
        }
    }
}

struct CutoutPhotoView: View {
    let photoUrl: String?
    var scale: Double = 1.0
    var offset: CGSize = .zero
    var opacity: Double = 1.0
    var tintColor: Color? = nil
    var showShadow: Bool = true
    
    var body: some View {
        OptimizedProgressPhotoView(
            photoUrl: photoUrl,
            maxHeight: UIScreen.main.bounds.height * 0.6
        )
        .scaleEffect(scale)
        .offset(offset)
        .opacity(opacity)
        .overlay(tintColor)
        .if(showShadow) { view in
            view.shadow(
                color: Color.black.opacity(0.15),
                radius: 8,
                x: 0,
                y: 4
            )
        }
    }
}

struct PlaceholderSilhouetteView: View {
    let gender: String
    
    var body: some View {
        Image(systemName: gender.lowercased() == "male" ? "figure.stand" : "figure.stand.dress")
            .font(.system(size: 200, weight: .thin))
            .foregroundColor(Color.appTextTertiary.opacity(0.3))
            .shadow(
                color: Color.black.opacity(0.1),
                radius: 8,
                x: 0,
                y: 4
            )
    }
}

struct MetricsOverlayView: View {
    let metric: BodyMetrics
    
    var body: some View {
        HStack(spacing: 20) {
            MetricPill(
                label: "Body Fat",
                value: String(format: "%.1f%%", metric.bodyFatPercentage ?? 0),
                color: colorForBodyFat(metric.bodyFatPercentage ?? 20)
            )
            
            if let weight = metric.weight {
                MetricPill(
                    label: "Weight",
                    value: String(format: "%.1f lbs", weight),
                    color: .appTextSecondary
                )
            }
        }
        .padding(.horizontal)
    }
    
    func colorForBodyFat(_ percentage: Double) -> Color {
        if percentage < 10 {
            return .green
        } else if percentage < 15 {
            return .yellow
        } else if percentage < 20 {
            return .orange
        } else {
            return .red
        }
    }
}

struct MetricPill: View {
    let label: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.appTextSecondary)
            Text(value)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(color)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(Color.appCard.opacity(0.9))
                .overlay(
                    Capsule()
                        .stroke(color.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// Helper extension for conditional modifiers
extension View {
    @ViewBuilder
    func `if`<Transform: View>(_ condition: Bool, transform: (Self) -> Transform) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

#Preview {
    ProgressPhotoCutoutView(
        currentMetric: BodyMetrics(
            id: "1",
            userId: "user1",
            date: Date(),
            weight: 180,
            weightUnit: "lbs",
            bodyFatPercentage: 15,
            bodyFatMethod: "Navy",
            muscleMass: nil,
            boneMass: nil,
            notes: nil,
            photoUrl: nil,
            dataSource: "Manual",
            createdAt: Date(),
            updatedAt: Date()
        ),
        historicalMetrics: []
    )
    .environmentObject(AuthManager.shared)
    .preferredColorScheme(.dark)
}