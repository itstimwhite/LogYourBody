//
//  DateOfBirthInputView.swift
//  LogYourBody
//
//  Created by Tim White on 7/4/25.
//

import SwiftUI

struct DateOfBirthInputView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @State private var selectedDate = Date()
    @State private var isEditing = false
    @State private var hasHealthKitData = false
    
    private var age: Int? {
        guard let dob = viewModel.data.dateOfBirth else { return nil }
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: dob, to: Date())
        return ageComponents.year
    }
    
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
                    Text("When were you born?")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.appText)
                    
                    Text("This helps us provide age-appropriate insights")
                        .font(.system(size: 15, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 60)
                
                // Show pre-populated data or picker
                if hasHealthKitData && !isEditing {
                    // Read-only summary view
                    VStack(spacing: 20) {
                        HStack {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Date of Birth")
                                    .font(.system(size: 14))
                                    .foregroundColor(.appTextSecondary)
                                
                                if let dob = viewModel.data.dateOfBirth {
                                    Text(dob, style: .date)
                                        .font(.system(size: 24, weight: .semibold))
                                        .foregroundColor(.appText)
                                }
                                
                                if let age = age {
                                    Text("\(age) years old")
                                        .font(.system(size: 16))
                                        .foregroundColor(.adaptiveGreen)
                                }
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                withAnimation(.spring(response: 0.3)) {
                                    isEditing = true
                                }
                                HapticManager.shared.buttonTapped()
                            }) {
                                Text("Edit")
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(.appPrimary)
                            }
                        }
                        .padding(20)
                        .background(Color.appCard)
                        .cornerRadius(12)
                        
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.adaptiveGreen)
                            Text("Imported from Apple Health")
                                .font(.system(size: 14))
                                .foregroundColor(.appTextSecondary)
                        }
                    }
                    .padding(.horizontal, 24)
                    .transition(.opacity.combined(with: .scale))
                } else {
                    // Date picker for manual entry or editing
                    VStack(spacing: 16) {
                        DatePicker("", selection: Binding(
                            get: { viewModel.data.dateOfBirth ?? Date() },
                            set: { viewModel.data.dateOfBirth = $0 }
                        ), displayedComponents: .date)
                        .datePickerStyle(.wheel)
                        .labelsHidden()
                        .frame(maxHeight: 200)
                        
                        if let age = age {
                            Text("\(age) years old")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.appPrimary)
                                .padding(.top, 8)
                                .transition(.opacity)
                        }
                        
                        if hasHealthKitData && isEditing {
                            Button(action: {
                                withAnimation(.spring(response: 0.3)) {
                                    isEditing = false
                                }
                            }) {
                                Text("Cancel")
                                    .font(.system(size: 15))
                                    .foregroundColor(.appTextSecondary)
                            }
                            .padding(.top, 8)
                        }
                    }
                    .padding(.horizontal, 24)
                    .transition(.opacity.combined(with: .scale))
                }
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
                        .background(viewModel.data.dateOfBirth != nil ? Color.appPrimary : Color.appBorder)
                        .foregroundColor(viewModel.data.dateOfBirth != nil ? .white : .appTextTertiary)
                        .cornerRadius(6)
                }
                .disabled(viewModel.data.dateOfBirth == nil)
                .animation(.easeOut(duration: 0.2), value: viewModel.data.dateOfBirth != nil)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
        }
        .onAppear {
            // Initialize with user's date if available
            if let dob = viewModel.data.dateOfBirth {
                selectedDate = dob
                // Check if this came from HealthKit (we have it pre-populated)
                hasHealthKitData = viewModel.data.healthKitEnabled
            } else {
                // Default to 25 years ago
                selectedDate = Calendar.current.date(byAdding: .year, value: -25, to: Date()) ?? Date()
                viewModel.data.dateOfBirth = selectedDate
                hasHealthKitData = false
            }
        }
    }
}

#Preview {
    DateOfBirthInputView()
        .environmentObject(OnboardingViewModel())
        .background(Color.appBackground)
}