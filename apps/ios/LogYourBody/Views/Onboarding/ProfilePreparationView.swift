//
//  ProfilePreparationView.swift
//  LogYourBody
//
//  Shows upload progress and prepares profile at end of onboarding
//

import SwiftUI

struct ProfilePreparationView: View {
    @Binding var onboardingData: OnboardingData
    let onComplete: () -> Void
    
    @StateObject private var uploadService = BackgroundPhotoUploadService.shared
    @State private var preparationSteps: [PreparationStep] = []
    @State private var showContinueButton = false
    @State private var minimumLoadTime = false
    @State private var currentStepIndex = 0
    
    struct PreparationStep: Identifiable {
        let id = UUID()
        let title: String
        let icon: String
        var status: StepStatus = .pending
    }
    
    enum StepStatus {
        case pending
        case inProgress
        case completed
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Horizontal stepper at top
            HStack(spacing: 0) {
                ForEach(0..<4) { index in
                    if index > 0 {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 0.5)
                            .frame(maxWidth: .infinity)
                    }
                    
                    ZStack {
                        Circle()
                            .stroke(currentStepIndex >= index ? Color.accentColor : Color.gray.opacity(0.3), lineWidth: 2)
                            .frame(width: 28, height: 28)
                            .background(
                                Circle()
                                    .fill(currentStepIndex > index ? Color.accentColor : Color.clear)
                            )
                        
                        Image(systemName: stepIcon(for: index))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(currentStepIndex > index ? .white : (currentStepIndex == index ? .accentColor : .gray))
                    }
                }
            }
            .padding(.horizontal, 40)
            .padding(.top, 20)
            .padding(.bottom, 32)
            
            // Title & subtitle
            VStack(alignment: .leading, spacing: 12) {
                Text("Getting Your Profile Ready")
                    .font(.system(size: 34, weight: .bold, design: .default))
                    .foregroundColor(.primary)
                
                Text("Just a moment while we set everything up...")
                    .font(.system(size: 17))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
            
            // Step list
            List {
                ForEach(Array(preparationSteps.enumerated()), id: \.element.id) { index, step in
                    HStack(spacing: 16) {
                        // Icon or progress indicator
                        ZStack {
                            if step.status == .inProgress {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .accentColor))
                                    .scaleEffect(0.8)
                                    .transition(.opacity)
                            } else if step.status == .completed {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 17, weight: .semibold))
                                    .foregroundColor(.primary)
                                    .transition(.scale.combined(with: .opacity))
                                    .scaleEffect(step.status == .completed ? 1 : 0.5)
                                    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: step.status)
                            } else {
                                Image(systemName: step.icon)
                                    .font(.system(size: 17))
                                    .foregroundStyle(.tertiary)
                            }
                        }
                        .frame(width: 24, height: 24)
                        
                        Text(step.title)
                            .font(.system(size: 17))
                            .foregroundStyle(
                                step.status == .completed ? AnyShapeStyle(.primary) :
                                step.status == .inProgress ? AnyShapeStyle(.primary) :
                                AnyShapeStyle(.tertiary)
                            )
                        
                        Spacer()
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 20, bottom: 8, trailing: 20))
                    .accessibilityLabel("Step \(index + 1) of 4: \(step.title)—\(accessibilityStatus(for: step.status))")
                }
            }
            .listStyle(PlainListStyle())
            .scrollDisabled(true)
            .frame(height: CGFloat(preparationSteps.count) * 56)
            
            // Photo upload progress (if applicable)
            if uploadService.totalCount > 0 {
                VStack(spacing: 8) {
                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: 4)
                            
                            Rectangle()
                                .fill(Color.accentColor)
                                .frame(width: geometry.size.width * uploadService.totalProgress, height: 4)
                                .animation(.linear(duration: 0.3), value: uploadService.totalProgress)
                        }
                    }
                    .frame(height: 4)
                    .padding(.horizontal, 20)
                    
                    Text(uploadService.uploadSummary)
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                }
                .padding(.top, 16)
            }
            
            Spacer()
            
            // Continue button (shows when ready)
            if showContinueButton {
                VStack(spacing: 12) {
                    Button(action: onComplete) {
                        Text("Go to Dashboard")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.accentColor)
                            .cornerRadius(12)
                    }
                    
                    if uploadService.isUploading {
                        Text("Photos will continue uploading in the background")
                            .font(.system(size: 13))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
        .onAppear {
            setupPreparationSteps()
            startPreparation()
        }
    }
    
    private func setupPreparationSteps() {
        preparationSteps = [
            PreparationStep(title: "Creating your profile", icon: "person.circle"),
            PreparationStep(title: "Setting up your dashboard", icon: "chart.line.uptrend.xyaxis"),
            PreparationStep(title: "Configuring health sync", icon: "heart.text.square")
        ]
        
        if uploadService.totalCount > 0 {
            preparationSteps.append(
                PreparationStep(title: "Processing \(uploadService.totalCount) photos", icon: "photo.stack")
            )
        }
    }
    
    private func startPreparation() {
        Task {
            // Simulate preparation steps
            for index in preparationSteps.indices {
                withAnimation(.easeInOut(duration: 0.3)) {
                    preparationSteps[index].status = .inProgress
                    currentStepIndex = index
                }
                
                // Different delays for different steps
                let delay: UInt64 = index == preparationSteps.count - 1 && uploadService.totalCount > 0
                    ? 2_000_000_000  // 2 seconds for photo processing
                    : 800_000_000    // 0.8 seconds for other steps
                
                try? await Task.sleep(nanoseconds: delay)
                
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    preparationSteps[index].status = .completed
                }
            }
            
            // Ensure minimum display time
            if !minimumLoadTime {
                try? await Task.sleep(nanoseconds: 500_000_000)
            }
            
            withAnimation(.spring(response: 0.4)) {
                showContinueButton = true
            }
        }
        
        // Track minimum display time
        Task {
            try? await Task.sleep(nanoseconds: 3_000_000_000) // 3 seconds minimum
            minimumLoadTime = true
        }
    }
    
    private func stepIcon(for index: Int) -> String {
        switch index {
        case 0: return "person.circle"
        case 1: return "chart.line.uptrend.xyaxis"
        case 2: return "heart.text.square"
        case 3: return "photo.stack"
        default: return "circle"
        }
    }
    
    private func accessibilityStatus(for status: StepStatus) -> String {
        switch status {
        case .pending:
            return "Not started"
        case .inProgress:
            return "In progress"
        case .completed:
            return "Completed"
        }
    }
}

#Preview {
    ProfilePreparationView(
        onboardingData: .constant(OnboardingData()),
        onComplete: {}
    )
    .preferredColorScheme(.dark)
}