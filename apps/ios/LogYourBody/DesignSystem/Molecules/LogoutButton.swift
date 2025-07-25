//
// LogoutButton.swift
// LogYourBody
//
import SwiftUI

// MARK: - Logout Button Molecule

struct LogoutButton: View {
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Label("Log Out", systemImage: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 16))
                    .foregroundColor(.red)
                Spacer()
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        LogoutButton {
            // Logout action
        }
        
        LogoutButton {
            // Logout action
        }
        .disabled(true)
    }
    .padding()
    .background(Color.appBackground)
}
