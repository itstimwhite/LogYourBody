//
//  NotificationsStepView.swift
//  LogYourBody
//
//  Created by Tim White on 7/2/25.
//

import SwiftUI
import UserNotifications

struct NotificationsStepView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @State private var notificationStatus: UNAuthorizationStatus = .notDetermined
    
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
                
                Button("Skip") {
                    viewModel.nextStep()
                }
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.appTextSecondary)
                .padding(.trailing, 16)
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            
            Spacer()
            
            VStack(spacing: 40) {
                // Icon - minimalist
                Image(systemName: "bell")
                    .font(.system(size: 48, weight: .light))
                    .foregroundColor(.appPrimary)
                
                // Title
                VStack(spacing: 12) {
                    Text("Stay on track")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.appText)
                    
                    Text("Get reminders to log your weight and track your progress")
                        .font(.system(size: 15, weight: .regular))
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
                
                // Benefits
                VStack(alignment: .leading, spacing: 20) {
                    NotificationBenefitRow(
                        icon: "calendar.badge.clock",
                        text: "Daily weight tracking reminders"
                    )
                    
                    NotificationBenefitRow(
                        icon: "chart.line.uptrend.xyaxis",
                        text: "Weekly progress summaries"
                    )
                    
                    NotificationBenefitRow(
                        icon: "trophy.fill",
                        text: "Achievement celebrations"
                    )
                }
                .padding(.horizontal, 40)
            }
            
            Spacer()
            
            // Enable button
            VStack(spacing: 16) {
                Button(action: {
                    requestNotificationPermission()
                }) {
                    Text("Enable Notifications")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Color.appPrimary)
                        .foregroundColor(.white)
                        .cornerRadius(6)
                }
                
                Text("You can change this anytime in Settings")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.appTextTertiary)
                    .opacity(0.8)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
        }
        .onAppear {
            checkNotificationStatus()
        }
    }
    
    private func checkNotificationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                notificationStatus = settings.authorizationStatus
            }
        }
    }
    
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            DispatchQueue.main.async {
                viewModel.data.notificationsEnabled = granted
                viewModel.nextStep()
            }
        }
    }
}

struct NotificationBenefitRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .regular))
                .foregroundColor(.appTextSecondary)
                .frame(width: 28)
            
            Text(text)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.appText)
            
            Spacer()
        }
    }
}

#Preview {
    NotificationsStepView()
        .environmentObject(OnboardingViewModel())
        .background(Color.appBackground)
}