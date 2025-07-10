//
//  WelcomeStepView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI

struct WelcomeStepView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @EnvironmentObject var authManager: AuthManager
    @State private var animateIcon = false
    @State private var animateText = false
    @State private var animateButton = false
    
    var body: some View {
        ZStack {
            // Liquid Glass Background
            LiquidGlassBackground(
                opacity: 0.6,
                blurRadius: 30,
                saturation: 1.1,
                gradientColors: [
                    Color.appPrimary.opacity(0.08),
                    Color.appPrimary.opacity(0.03),
                    Color.clear
                ]
            )
            
            VStack(spacing: 0) {
                Spacer()
                
                VStack(spacing: 40) {
                    // Icon with liquid glass accent
                    ZStack {
                        // Liquid accent behind icon
                        if #available(iOS 26, *) {
                            LiquidGlassAccent(
                                color: .appPrimary,
                                opacity: 0.15,
                                size: CGSize(width: 120, height: 120)
                            )
                        }
                        
                        // Minimal icon - Linear style
                        Image(systemName: "chart.line.uptrend.xyaxis")
                            .font(.system(size: 48, weight: .regular))
                            .foregroundColor(.appPrimary)
                            .opacity(animateIcon ? 1 : 0)
                            .scaleEffect(animateIcon ? 1 : 0.9)
                            .animation(.easeOut(duration: 0.5), value: animateIcon)
                    }
                
                // Welcome text with refined typography
                VStack(spacing: 20) {
                    // User greeting if available
                    if let userName = authManager.currentUser?.displayName ?? authManager.currentUser?.name {
                        Text("Welcome back, \(userName)")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.appPrimary)
                            .opacity(animateText ? 1 : 0)
                            .offset(y: animateText ? 0 : 10)
                            .animation(.smooth.delay(0.3), value: animateText)
                    }
                    
                    VStack(spacing: 8) {
                        Text("LogYourBody")
                            .font(.system(size: 32, weight: .semibold, design: .default))
                            .foregroundColor(.appText)
                            .opacity(animateText ? 1 : 0)
                            .animation(.easeOut(duration: 0.4).delay(0.1), value: animateText)
                        
                        Text("Track your fitness journey with\nprecise body composition data")
                            .font(.system(size: 16, weight: .regular))
                            .foregroundColor(.appTextSecondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(6)
                            .opacity(animateText ? 1 : 0)
                            .animation(.easeOut(duration: 0.4).delay(0.2), value: animateText)
                    }
                }
            }
            .padding(.horizontal, Constants.paddingLarge)
            
            Spacer()
            
                // Get Started button with modern styling
                VStack(spacing: 16) {
                    LiquidGlassButton(
                        title: "Get Started",
                        action: {
                            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                            impactFeedback.impactOccurred()
                            viewModel.nextStep()
                        },
                        color: .white,
                        textColor: .black
                    )
                    .opacity(animateButton ? 1 : 0)
                    .animation(.easeOut(duration: 0.4).delay(0.3), value: animateButton)
                
                Text("Takes less than 3 minutes")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.appTextTertiary)
                    .opacity(animateButton ? 0.8 : 0)
                    .animation(.easeOut(duration: 0.4).delay(0.4), value: animateButton)
            }
            .padding(.horizontal, Constants.paddingLarge)
            .padding(.bottom, 60)
            }
        }
        .onAppear {
            animateIcon = true
            animateText = true
            animateButton = true
        }
    }
}

#Preview {
    ZStack {
        Color.appBackground
            .ignoresSafeArea()
        
        WelcomeStepView()
            .environmentObject(OnboardingViewModel())
            .environmentObject(AuthManager())
    }
}