//
//  ProgressPhotosStepView.swift
//  LogYourBody
//
//  Onboarding step for uploading progress photos
//

import SwiftUI
import PhotosUI

struct ProgressPhotosStepView: View {
    @Binding var onboardingData: OnboardingData
    let onNext: () -> Void
    let onSkip: () -> Void
    
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showPhotoGrid = false
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var uploadService = BackgroundPhotoUploadService.shared
    @Namespace private var photoAnimation
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 16) {
                Image(systemName: "photo.stack.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.appPrimary)
                    .padding(.top, 40)
                
                Text("Import Progress Photos")
                    .font(.appTitle)
                    .multilineTextAlignment(.center)
                
                Text("Have any progress photos? Import them now to see your transformation journey right away!")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            .padding(.bottom, 40)
            
            // Content
            VStack(spacing: 24) {
                if selectedPhotos.isEmpty && !showPhotoGrid {
                    // Photo picker button with matched geometry
                    PhotosPicker(
                        selection: $selectedPhotos,
                        maxSelectionCount: 50,
                        matching: .images
                    ) {
                        VStack(spacing: 12) {
                            Image(systemName: "photo.badge.plus")
                                .font(.system(size: 48))
                                .foregroundColor(.adaptiveGreen)
                            
                            Text("Select Photos")
                                .font(.appHeadline)
                                .foregroundColor(.primary)
                            
                            Text("Choose multiple photos at once")
                                .font(.appCaption)
                                .foregroundColor(.appTextSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 180)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.adaptiveGreen.opacity(0.1))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .strokeBorder(Color.adaptiveGreen.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [8]))
                                )
                        )
                        .matchedGeometryEffect(id: MatchedGeometryNamespace.photoSelection, in: photoAnimation)
                    }
                    .padding(.horizontal, 24)
                    .hapticOnTap()
                    .onChange(of: selectedPhotos) { oldValue, newValue in
                        if !oldValue.isEmpty || !newValue.isEmpty {
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                                showPhotoGrid = !newValue.isEmpty
                            }
                            if !newValue.isEmpty {
                                HapticManager.shared.success()
                            }
                        }
                    }
                } else if !selectedPhotos.isEmpty && uploadService.totalCount > 0 {
                    // Show upload queued message
                    VStack(spacing: 16) {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.green)
                            
                            Text("\(selectedPhotos.count) photos queued for upload")
                                .font(.appHeadline)
                        }
                        
                        Text("Photos will upload in the background while you complete setup")
                            .font(.appBody)
                            .foregroundColor(.appTextSecondary)
                            .multilineTextAlignment(.center)
                        
                        PhotosPicker(
                            selection: $selectedPhotos,
                            maxSelectionCount: 50,
                            matching: .images
                        ) {
                            Text("Change Selection")
                                .font(.appBody)
                                .foregroundColor(.appPrimary)
                        }
                    }
                    .padding(.horizontal, 24)
                } else {
                    // Selected photos count
                    VStack(spacing: 16) {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.green)
                            
                            Text("\(selectedPhotos.count) photos selected")
                                .font(.appHeadline)
                        }
                        
                        PhotosPicker(
                            selection: $selectedPhotos,
                            maxSelectionCount: 50,
                            matching: .images
                        ) {
                            Text("Change Selection")
                                .font(.appBody)
                                .foregroundColor(.appPrimary)
                        }
                        
                        Text("Photos will be automatically dated based on when they were taken")
                            .font(.appCaption)
                            .foregroundColor(.appTextSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 24)
                }
            }
            
            Spacer()
            
            // Bottom buttons
            VStack(spacing: 12) {
                Button(action: handleContinue) {
                    Text(selectedPhotos.isEmpty ? "Skip for Now" : "Continue")
                        .font(.appBody)
                        .fontWeight(.semibold)
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(Color.white)
                        .cornerRadius(Constants.cornerRadius)
                }
                    
                    if selectedPhotos.isEmpty {
                        Text("You can always add photos later")
                            .font(.appCaption)
                            .foregroundColor(.appTextSecondary)
                    }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }
    
    private func handleContinue() {
        if selectedPhotos.isEmpty {
            onSkip()
        } else {
            // Queue photos for background upload
            Task {
                await uploadService.queuePhotosForUpload(selectedPhotos)
                onboardingData.hasUploadedPhotos = true
            }
            onNext()
        }
    }
}

#Preview {
    ProgressPhotosStepView(
        onboardingData: .constant(OnboardingData()),
        onNext: {},
        onSkip: {}
    )
    .environmentObject(AuthManager.shared)
    .preferredColorScheme(.dark)
}