//
//  GenderInputView.swift
//  LogYourBody
//
//  Created by Tim White on 7/4/25.
//

import SwiftUI

struct GenderInputView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {
                    viewModel.previousStep()
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .frame(width: 40, height: 40)
                        .contentShape(Rectangle())
                }
                
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            
            // Content
            VStack(spacing: 40) {
                // Title and subtitle
                VStack(spacing: 12) {
                    Text("What's your biological sex?")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.appText)
                    
                    Text("This is required for accurate FFMI calculations")
                        .font(.system(size: 15, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 60)
                
                // Gender options
                VStack(spacing: 12) {
                    ForEach(OnboardingData.Gender.allCases, id: \.self) { gender in
                        GenderOptionButton(
                            gender: gender,
                            isSelected: viewModel.data.gender == gender,
                            action: {
                                withAnimation(.easeOut(duration: 0.2)) {
                                    viewModel.data.gender = gender
                                }
                            }
                        )
                    }
                    
                }
                .padding(.horizontal, 24)
            }
            
            Spacer()
            
            // Continue button
            VStack(spacing: 16) {
                Button(action: {
                    viewModel.nextStep()
                }) {
                    Text("Continue")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(viewModel.data.gender != nil ? Color.appPrimary : Color.appBorder)
                        .foregroundColor(viewModel.data.gender != nil ? .white : .appTextTertiary)
                        .cornerRadius(6)
                }
                .disabled(viewModel.data.gender == nil)
                .animation(.easeOut(duration: 0.2), value: viewModel.data.gender != nil)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
        }
    }
}

struct GenderOptionButton: View {
    let gender: OnboardingData.Gender
    let isSelected: Bool
    let action: () -> Void
    
    private var icon: String {
        switch gender {
        case .male:
            return "figure.stand"
        case .female:
            return "figure.stand.dress"
        }
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 24, weight: .regular))
                    .foregroundColor(isSelected ? .appPrimary : .appTextSecondary)
                    .frame(width: 30)
                
                Text(gender.rawValue)
                    .font(.system(size: 17, weight: isSelected ? .medium : .regular))
                    .foregroundColor(isSelected ? .appText : .appTextSecondary)
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.appPrimary)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.appCard.opacity(isSelected ? 0.5 : 0.3))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(
                                isSelected ? Color.appPrimary.opacity(0.3) : Color.appBorder.opacity(0.2),
                                lineWidth: 1
                            )
                    )
            )
        }
    }
}

#Preview {
    GenderInputView()
        .environmentObject(OnboardingViewModel())
        .background(Color.appBackground)
}