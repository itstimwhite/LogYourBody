//
//  NameInputView.swift
//  LogYourBody
//
//  Created by Tim White on 7/4/25.
//

import SwiftUI

struct NameInputView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @FocusState private var isNameFieldFocused: Bool
    
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
                    Text("What's your name?")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.appText)
                    
                    Text("We'll use this to personalize your experience")
                        .font(.system(size: 15, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 60)
                
                // Name input
                VStack(alignment: .leading, spacing: 8) {
                    TextField("Enter your name", text: $viewModel.data.name)
                        .font(.system(size: 17, weight: .regular))
                        .modernTextFieldStyle()
                        .focused($isNameFieldFocused)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.words)
                        .submitLabel(.done)
                        .onSubmit {
                            if !viewModel.data.name.isEmpty {
                                viewModel.nextStep()
                            }
                        }
                    
                    if !viewModel.data.name.isEmpty {
                        Text("Nice to meet you, \(viewModel.data.name)!")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.appPrimary)
                            .transition(.opacity.combined(with: .move(edge: .top)))
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
                        .background(viewModel.data.name.isEmpty ? Color.appBorder : Color.appPrimary)
                        .foregroundColor(viewModel.data.name.isEmpty ? .appTextTertiary : .white)
                        .cornerRadius(6)
                }
                .disabled(viewModel.data.name.isEmpty)
                .animation(.easeOut(duration: 0.2), value: viewModel.data.name.isEmpty)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
        }
        .onAppear {
            // Auto-focus the text field after a slight delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isNameFieldFocused = true
            }
        }
    }
}

#Preview {
    NameInputView()
        .environmentObject(OnboardingViewModel())
        .background(Color.appBackground)
}