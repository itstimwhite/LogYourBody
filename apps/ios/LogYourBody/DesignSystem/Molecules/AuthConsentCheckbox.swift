//
// AuthConsentCheckbox.swift
// LogYourBody
//
import SwiftUI

// MARK: - AuthConsentCheckbox Molecule

struct AuthConsentCheckbox: View {
    @Binding var isChecked: Bool
    let text: String
    let linkText: String
    let onLinkTap: () -> Void
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Checkbox
            Button(action: { isChecked.toggle() }, label: {
                Image(systemName: isChecked ? "checkmark.square.fill" : "square")
                    .font(.system(size: 20))
                    .foregroundColor(isChecked ? .appPrimary : .appBorder)
            })
            .buttonStyle(PlainButtonStyle())
            
            // Text with link
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Text("I agree to the")
                        .font(.system(size: 14))
                        .foregroundColor(.appTextSecondary)
                    
                    Button(action: onLinkTap) {
                        Text(linkText)
                            .font(.system(size: 14))
                            .foregroundColor(.appPrimary)
                            .underline()
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .multilineTextAlignment(.leading)
                
                Text(text)
                    .font(.system(size: 12))
                    .foregroundColor(.appTextTertiary)
                    .multilineTextAlignment(.leading)
            }
            
            Spacer()
        }
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        AuthConsentCheckbox(
            isChecked: .constant(true),
            text: "LogYourBody's terms of service",
            linkText: "Terms of Service",
            onLinkTap: {}
        )
        
        AuthConsentCheckbox(
            isChecked: .constant(false),
            text: "How we handle your data",
            linkText: "Privacy Policy",
            onLinkTap: {}
        )
        
        AuthConsentCheckbox(
            isChecked: .constant(false),
            text: "Important health information",
            linkText: "Health Disclaimer",
            onLinkTap: {}
        )
    }
    .padding()
    .background(Color.appBackground)
}