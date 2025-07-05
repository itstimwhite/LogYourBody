//
//  CompletionStepView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI

struct CompletionStepView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @EnvironmentObject var authManager: AuthManager
    @State private var animateCheckmark = false
    @State private var animateContent = false
    @State private var animateCard = false
    @State private var checkmarkScale: CGFloat = 0
    
    // Computed properties for cleaner code
    private var hasProfileData: Bool {
        !viewModel.data.name.isEmpty || 
        viewModel.data.dateOfBirth != nil || 
        viewModel.data.totalHeightInInches > 0 ||
        viewModel.data.gender != nil
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 80)
                
                VStack(spacing: 40) {
                    // Minimalist success checkmark
                    ZStack {
                        Circle()
                            .fill(Color.appPrimary.opacity(0.1))
                            .frame(width: 80, height: 80)
                            .scaleEffect(checkmarkScale)
                            .animation(.easeOut(duration: 0.3), value: checkmarkScale)
                        
                        Image(systemName: "checkmark")
                            .font(.system(size: 36, weight: .medium))
                            .foregroundColor(.appPrimary)
                            .scaleEffect(animateCheckmark ? 1 : 0)
                            .opacity(animateCheckmark ? 1 : 0)
                            .animation(.easeOut(duration: 0.3).delay(0.1), value: animateCheckmark)
                            .frame(width: 40, height: 40)
                            .animation(.easeOut(duration: 0.6).delay(0.3), value: animateCheckmark)
                    }
                    
                    // Header content with refined animation
                    VStack(spacing: 16) {
                        Text("Welcome to LogYourBody")
                            .font(.system(size: 28, weight: .semibold, design: .default))
                            .foregroundColor(.appText)
                            .opacity(animateContent ? 1 : 0)
                            .offset(y: animateContent ? 0 : 20)
                            .animation(.smooth.delay(0.5), value: animateContent)
                        
                        Text("Your journey to better health starts now")
                            .font(.system(size: 15, weight: .regular))
                            .foregroundColor(.appTextSecondary)
                            .opacity(animateContent ? 1 : 0)
                            .offset(y: animateContent ? 0 : 20)
                            .animation(.smooth.delay(0.6), value: animateContent)
                    }
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Constants.paddingLarge)
                    
                    // Profile summary card with modern design
                    if hasProfileData {
                        VStack(spacing: 0) {
                            // Profile data rows with icons
                            VStack(spacing: 20) {
                                // Name
                                if !viewModel.data.name.isEmpty {
                                    ModernDataRow(
                                        icon: "person.fill",
                                        iconColor: .blue,
                                        label: "Name",
                                        value: viewModel.data.name
                                    )
                                }
                                
                                // Age
                                if let dob = viewModel.data.dateOfBirth {
                                    let age = Calendar.current.dateComponents([.year], from: dob, to: Date()).year ?? 0
                                    ModernDataRow(
                                        icon: "calendar",
                                        iconColor: .orange,
                                        label: "Age",
                                        value: "\(age) years"
                                    )
                                }
                                
                                // Height
                                if viewModel.data.totalHeightInInches > 0 {
                                    ModernDataRow(
                                        icon: "ruler",
                                        iconColor: .green,
                                        label: "Height",
                                        value: "\(viewModel.data.heightFeet)' \(viewModel.data.heightInches)\""
                                    )
                                }
                                
                                // Gender
                                if let gender = viewModel.data.gender {
                                    ModernDataRow(
                                        icon: "figure.stand",
                                        iconColor: .purple,
                                        label: "Gender",
                                        value: gender.rawValue
                                    )
                                }
                            }
                            .padding(24)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.appCard.opacity(0.3))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.appBorder.opacity(0.2), lineWidth: 1)
                                )
                        )
                        .shadow(
                            color: Color.black.opacity(0.02),
                            radius: 4,
                            x: 0,
                            y: 2
                        )
                        .padding(.horizontal, Constants.paddingLarge)
                        .scaleEffect(animateCard ? 1 : 0.95)
                        .opacity(animateCard ? 1 : 0)
                        .animation(.smooth.delay(0.8), value: animateCard)
                    }
                }
                
                Spacer()
                    .frame(height: 60)
                
                // Get Started button with modern styling
                VStack(spacing: 20) {
                    Button(action: {
                        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                        impactFeedback.impactOccurred()
                        
                        Task {
                            await viewModel.completeOnboarding(authManager: authManager)
                        }
                    }) {
                        HStack {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            } else {
                                Text("Start Your Journey")
                                    .font(.system(size: 15, weight: .medium))
                                
                                Image(systemName: "arrow.right")
                                    .font(.system(size: 14, weight: .medium))
                            }
                        }
                    }
                    .modernPrimaryButtonStyle()
                    .disabled(viewModel.isLoading)
                    .scaleEffect(animateCard ? 1 : 0.9)
                    .opacity(animateCard ? 1 : 0)
                    .animation(.smooth.delay(1.0), value: animateCard)
                    
                    HStack(spacing: 16) {
                        Image(systemName: "lock.shield.fill")
                            .font(.system(size: 14))
                        Text("Your data is secure and private")
                            .font(.system(size: 14))
                    }
                    .foregroundColor(.appTextTertiary)
                    .opacity(animateCard ? 0.8 : 0)
                    .animation(.smooth.delay(1.1), value: animateCard)
                }
                .padding(.horizontal, Constants.paddingLarge)
                .padding(.bottom, 60)
            }
        }
        .onAppear {
            // Staggered animations
            withAnimation {
                checkmarkScale = 1
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                animateCheckmark = true
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                animateContent = true
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                animateCard = true
            }
        }
    }
}

// MARK: - Checkmark Shape
struct CheckmarkShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.size.width
        let height = rect.size.height
        
        path.move(to: CGPoint(x: width * 0.2, y: height * 0.5))
        path.addLine(to: CGPoint(x: width * 0.4, y: height * 0.7))
        path.addLine(to: CGPoint(x: width * 0.8, y: height * 0.3))
        
        return path
    }
}

// MARK: - Modern Data Row Component
struct ModernDataRow: View {
    let icon: String
    let iconColor: Color
    let label: String
    let value: String
    
    var body: some View {
        HStack(spacing: 16) {
            // Icon container
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(iconColor.opacity(0.1))
                    .frame(width: 40, height: 40)
                
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(iconColor)
            }
            
            // Label and Value
            HStack {
                Text(label)
                    .font(.system(size: 15))
                    .foregroundColor(.appTextSecondary)
                
                Spacer()
                
                Text(value)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.appText)
            }
        }
    }
}

#Preview {
    ZStack {
        Color.appBackground
            .ignoresSafeArea()
        
        CompletionStepView()
            .environmentObject({
                let vm = OnboardingViewModel()
                vm.data.name = "John Doe"
                vm.data.dateOfBirth = Calendar.current.date(byAdding: .year, value: -25, to: Date())
                vm.data.heightFeet = 5
                vm.data.heightInches = 10
                vm.data.gender = .male
                return vm
            }())
            .environmentObject(AuthManager())
    }
}