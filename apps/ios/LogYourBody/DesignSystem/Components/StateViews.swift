//
//  StateViews.swift
//  LogYourBody
//
//  Loading, empty, and error state views
//

import SwiftUI

// MARK: - Loading View

struct LoadingView: View {
    @Environment(\.theme) var theme
    
    let message: String?
    let progress: Double?
    let style: LoadingStyle
    
    enum LoadingStyle {
        case standard
        case overlay
        case minimal
        case fullScreen
    }
    
    init(
        message: String? = nil,
        progress: Double? = nil,
        style: LoadingStyle = .standard
    ) {
        self.message = message
        self.progress = progress
        self.style = style
    }
    
    var body: some View {
        switch style {
        case .standard:
            standardLoading
        case .overlay:
            overlayLoading
        case .minimal:
            minimalLoading
        case .fullScreen:
            fullScreenLoading
        }
    }
    
    private var standardLoading: some View {
        VStack(spacing: theme.spacing.lg) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: theme.colors.primary))
                .scaleEffect(1.5)
            
            if let message = message {
                Text(message)
                    .font(theme.typography.bodyMedium)
                    .foregroundColor(theme.colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            
            if let progress = progress {
                VStack(spacing: theme.spacing.xs) {
                    ProgressBar(progress: progress)
                        .frame(width: 200)
                    
                    Text("\(Int(progress * 100))%")
                        .font(theme.typography.captionMedium)
                        .foregroundColor(theme.colors.textTertiary)
                }
            }
        }
        .padding(theme.spacing.xl)
    }
    
    private var overlayLoading: some View {
        ZStack {
            // Background blur
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture { } // Prevent tap through
            
            // Loading content
            StandardCard(style: .elevated) {
                standardLoading
            }
            .frame(maxWidth: 280)
        }
    }
    
    private var minimalLoading: some View {
        HStack(spacing: theme.spacing.sm) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: theme.colors.textSecondary))
                .scaleEffect(0.8)
            
            if let message = message {
                Text(message)
                    .font(theme.typography.captionLarge)
                    .foregroundColor(theme.colors.textSecondary)
            }
        }
        .padding(theme.spacing.md)
    }
    
    private var fullScreenLoading: some View {
        GeometryReader { geometry in
            VStack {
                Spacer()
                
                VStack(spacing: theme.spacing.xxl) {
                    // Animated logo or icon
                    Image(systemName: "heart.fill")
                        .font(.system(size: 60))
                        .foregroundColor(theme.colors.primary)
                        .scaleEffect(animatingScale)
                        .onAppear {
                            withAnimation(
                                .easeInOut(duration: 1.0)
                                .repeatForever(autoreverses: true)
                            ) {
                                animatingScale = 1.2
                            }
                        }
                    
                    VStack(spacing: theme.spacing.md) {
                        if let message = message {
                            Text(message)
                                .font(theme.typography.headlineSmall)
                                .foregroundColor(theme.colors.text)
                        }
                        
                        if let progress = progress {
                            VStack(spacing: theme.spacing.sm) {
                                ProgressBar(progress: progress)
                                    .frame(width: min(300, geometry.size.width * 0.8))
                                
                                Text("\(Int(progress * 100))%")
                                    .font(theme.typography.bodyMedium)
                                    .foregroundColor(theme.colors.textSecondary)
                            }
                        } else {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: theme.colors.primary))
                                .scaleEffect(1.2)
                        }
                    }
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(theme.colors.background)
        }
    }
    
    @State private var animatingScale: CGFloat = 1.0
}

// MARK: - Empty State View

struct EmptyStateView: View {
    @Environment(\.theme) var theme
    
    let icon: String
    let title: String
    let description: String
    let actionTitle: String?
    let action: (() -> Void)?
    
    init(
        icon: String,
        title: String,
        description: String,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.description = description
        self.actionTitle = actionTitle
        self.action = action
    }
    
    var body: some View {
        VStack(spacing: theme.spacing.lg) {
            // Icon
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(theme.colors.textTertiary)
                .padding(.bottom, theme.spacing.sm)
            
            // Text content
            VStack(spacing: theme.spacing.sm) {
                Text(title)
                    .font(theme.typography.headlineSmall)
                    .foregroundColor(theme.colors.text)
                    .multilineTextAlignment(.center)
                
                Text(description)
                    .font(theme.typography.bodyMedium)
                    .foregroundColor(theme.colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            // Action button
            if let actionTitle = actionTitle, let action = action {
                StandardButton(
                    actionTitle,
                    style: .primary,
                    action: action
                )
                .padding(.top, theme.spacing.md)
            }
        }
        .padding(theme.spacing.xl)
        .frame(maxWidth: 320)
    }
}

// MARK: - Error View

struct ErrorView: View {
    @Environment(\.theme) var theme
    
    let error: Error
    let retryAction: (() -> Void)?
    
    var body: some View {
        VStack(spacing: theme.spacing.lg) {
            // Error icon
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(theme.colors.error)
                .padding(.bottom, theme.spacing.sm)
            
            // Error message
            VStack(spacing: theme.spacing.sm) {
                Text("Something went wrong")
                    .font(theme.typography.headlineSmall)
                    .foregroundColor(theme.colors.text)
                
                Text(error.localizedDescription)
                    .font(theme.typography.bodyMedium)
                    .foregroundColor(theme.colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            // Retry button
            if let retryAction = retryAction {
                StandardButton(
                    "Try Again",
                    icon: "arrow.clockwise",
                    style: .primary,
                    action: retryAction
                )
                .padding(.top, theme.spacing.md)
            }
        }
        .padding(theme.spacing.xl)
        .frame(maxWidth: 320)
    }
}

// MARK: - Success View

struct SuccessView: View {
    @Environment(\.theme) var theme
    
    let title: String
    let description: String?
    let actionTitle: String?
    let action: (() -> Void)?
    
    @State private var showCheckmark = false
    @State private var animateCheckmark = false
    
    var body: some View {
        VStack(spacing: theme.spacing.lg) {
            // Success checkmark
            ZStack {
                Circle()
                    .fill(theme.colors.success.opacity(0.1))
                    .frame(width: 100, height: 100)
                
                Image(systemName: "checkmark")
                    .font(.system(size: 50, weight: .bold))
                    .foregroundColor(theme.colors.success)
                    .scaleEffect(showCheckmark ? 1 : 0.5)
                    .opacity(showCheckmark ? 1 : 0)
                    .rotationEffect(.degrees(animateCheckmark ? 0 : -30))
            }
            .onAppear {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.6)) {
                    showCheckmark = true
                    animateCheckmark = true
                }
            }
            
            // Text content
            VStack(spacing: theme.spacing.sm) {
                Text(title)
                    .font(theme.typography.headlineSmall)
                    .foregroundColor(theme.colors.text)
                    .multilineTextAlignment(.center)
                
                if let description = description {
                    Text(description)
                        .font(theme.typography.bodyMedium)
                        .foregroundColor(theme.colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            
            // Action button
            if let actionTitle = actionTitle, let action = action {
                StandardButton(
                    actionTitle,
                    style: .primary,
                    action: action
                )
                .padding(.top, theme.spacing.md)
            }
        }
        .padding(theme.spacing.xl)
        .frame(maxWidth: 320)
    }
}

// MARK: - Progress Bar

struct ProgressBar: View {
    @Environment(\.theme) var theme
    
    let progress: Double
    let showPercentage: Bool
    
    init(progress: Double, showPercentage: Bool = false) {
        self.progress = min(max(progress, 0), 1)
        self.showPercentage = showPercentage
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background
                RoundedRectangle(cornerRadius: theme.radius.xs)
                    .fill(theme.colors.surfaceTertiary)
                    .frame(height: 6)
                
                // Progress
                RoundedRectangle(cornerRadius: theme.radius.xs)
                    .fill(theme.colors.primary)
                    .frame(width: geometry.size.width * progress, height: 6)
                    .animation(theme.animation.medium, value: progress)
                
                // Percentage label
                if showPercentage {
                    Text("\(Int(progress * 100))%")
                        .font(theme.typography.captionSmall)
                        .foregroundColor(theme.colors.text)
                        .padding(.horizontal, theme.spacing.xs)
                        .background(
                            Capsule()
                                .fill(theme.colors.surface)
                                .overlay(
                                    Capsule()
                                        .stroke(theme.colors.border, lineWidth: 1)
                                )
                        )
                        .offset(x: (geometry.size.width * progress) - 25)
                        .offset(y: -20)
                }
            }
        }
        .frame(height: showPercentage ? 30 : 6)
    }
}

// MARK: - Skeleton Loading

struct SkeletonView: View {
    @Environment(\.theme) var theme
    
    let width: CGFloat?
    let height: CGFloat
    let cornerRadius: CGFloat
    
    @State private var isAnimating = false
    
    init(
        width: CGFloat? = nil,
        height: CGFloat = 20,
        cornerRadius: CGFloat = 4
    ) {
        self.width = width
        self.height = height
        self.cornerRadius = cornerRadius
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(theme.colors.surfaceTertiary)
            .frame(width: width, height: height)
            .overlay(
                GeometryReader { geometry in
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0),
                                    Color.white.opacity(0.1),
                                    Color.white.opacity(0)
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .offset(x: isAnimating ? geometry.size.width : -geometry.size.width)
                        .animation(
                            .linear(duration: 1.5)
                            .repeatForever(autoreverses: false),
                            value: isAnimating
                        )
                }
                .clipped()
            )
            .onAppear {
                isAnimating = true
            }
    }
}

// MARK: - Preview

struct StateViews_Previews: PreviewProvider {
    static var previews: some View {
        ThemePreview {
            ScrollView {
                VStack(spacing: 40) {
                    // Loading views
                    LoadingView(message: "Loading your data...")
                    
                    LoadingView(
                        message: "Uploading photo...",
                        progress: 0.65
                    )
                    
                    LoadingView(
                        message: "Syncing",
                        style: .minimal
                    )
                    
                    // Empty state
                    EmptyStateView(
                        icon: "photo.on.rectangle.angled",
                        title: "No Photos Yet",
                        description: "Take your first progress photo to start tracking your transformation",
                        actionTitle: "Take Photo"
                    ) { }
                    
                    // Error view
                    ErrorView(
                        error: NSError(
                            domain: "",
                            code: 0,
                            userInfo: [NSLocalizedDescriptionKey: "Unable to connect to server"]
                        )
                    ) { }
                    
                    // Success view
                    SuccessView(
                        title: "Profile Updated!",
                        description: "Your changes have been saved successfully",
                        actionTitle: "Continue"
                    ) { }
                    
                    // Progress bar
                    ProgressBar(progress: 0.7, showPercentage: true)
                        .frame(width: 200)
                    
                    // Skeleton loading
                    VStack(alignment: .leading, spacing: 12) {
                        SkeletonView(width: 150, height: 24)
                        SkeletonView(height: 16)
                        SkeletonView(height: 16)
                        SkeletonView(width: 100, height: 16)
                    }
                    .padding()
                }
                .padding()
            }
            .background(Color.black)
        }
    }
}