//
//  HeightInputView.swift
//  LogYourBody
//
//  Created by Tim White on 7/4/25.
//

import SwiftUI

struct HeightInputView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @State private var showingPicker = false
    @State private var isEditing = false
    @State private var hasHealthKitData = false
    
    private var heightDisplay: String {
        if viewModel.data.heightFeet > 0 || viewModel.data.heightInches > 0 {
            return "\(viewModel.data.heightFeet)' \(viewModel.data.heightInches)\""
        }
        return "Select height"
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
                    Text("How tall are you?")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.appText)
                    
                    Text("We'll use this to calculate your FFMI")
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
                                Text("Height")
                                    .font(.system(size: 14))
                                    .foregroundColor(.appTextSecondary)
                                
                                Text(heightDisplay)
                                    .font(.system(size: 24, weight: .semibold))
                                    .foregroundColor(.appText)
                                
                                Text("\(viewModel.data.totalHeightInInches) inches")
                                    .font(.system(size: 16))
                                    .foregroundColor(.adaptiveGreen)
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                withAnimation(.spring(response: 0.3)) {
                                    isEditing = true
                                    showingPicker = true
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
                    // Height input button for manual entry
                    Button(action: {
                        showingPicker = true
                    }) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Height")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.appTextSecondary)
                                
                                Text(heightDisplay)
                                    .font(.system(size: 22, weight: .medium))
                                    .foregroundColor(viewModel.data.totalHeightInInches > 0 ? .appText : .appTextTertiary)
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .font(.system(size: 16, weight: .regular))
                                .foregroundColor(.appTextSecondary)
                        }
                        .padding(20)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.appCard.opacity(0.3))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.appBorder.opacity(0.2), lineWidth: 1)
                                )
                        )
                    }
                    .padding(.horizontal, 24)
                }
                
                // Visual representation
                if viewModel.data.totalHeightInInches > 0 {
                    VStack(spacing: 8) {
                        Image(systemName: "figure.stand")
                            .font(.system(size: 60, weight: .light))
                            .foregroundColor(.appPrimary)
                        
                        Text("\(viewModel.data.totalHeightInInches) inches total")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.appTextSecondary)
                    }
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
                        .background(viewModel.data.totalHeightInInches > 0 ? Color.appPrimary : Color.appBorder)
                        .foregroundColor(viewModel.data.totalHeightInInches > 0 ? .white : .appTextTertiary)
                        .cornerRadius(6)
                }
                .disabled(viewModel.data.totalHeightInInches == 0)
                .animation(.easeOut(duration: 0.2), value: viewModel.data.totalHeightInInches > 0)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
        }
        .sheet(isPresented: $showingPicker) {
            HeightPickerSheet(
                feet: $viewModel.data.heightFeet,
                inches: $viewModel.data.heightInches,
                isPresented: $showingPicker
            )
        }
        .onChange(of: showingPicker) { _, isShowing in
            if !isShowing && hasHealthKitData {
                // Reset editing state when sheet dismisses
                withAnimation(.spring(response: 0.3)) {
                    isEditing = false
                }
            }
        }
        .onAppear {
            // Check if we have HealthKit data
            hasHealthKitData = viewModel.data.healthKitEnabled && viewModel.data.totalHeightInInches > 0
        }
    }
}

struct HeightPickerSheet: View {
    @Binding var feet: Int
    @Binding var inches: Int
    @Binding var isPresented: Bool
    
    var body: some View {
        NavigationView {
            VStack {
                HStack(spacing: 0) {
                    // Feet picker
                    Picker("Feet", selection: $feet) {
                        ForEach(3...8, id: \.self) { value in
                            Text("\(value) ft")
                                .tag(value)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(maxWidth: .infinity)
                    
                    // Inches picker
                    Picker("Inches", selection: $inches) {
                        ForEach(0...11, id: \.self) { value in
                            Text("\(value) in")
                                .tag(value)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(maxWidth: .infinity)
                }
                .padding()
            }
            .navigationTitle("Select Height")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        isPresented = false
                    }
                    .font(.system(size: 17, weight: .semibold))
                }
            }
        }
        .presentationDetents([.height(300)])
        .presentationDragIndicator(.visible)
    }
}

#Preview {
    HeightInputView()
        .environmentObject(OnboardingViewModel())
        .background(Color.appBackground)
}