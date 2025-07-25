//
// DSSecureField.swift
// LogYourBody
//
import SwiftUI

// MARK: - DSSecureField Atom

struct DSSecureField: View {
    @Binding var text: String
    let placeholder: String
    var textContentType: UITextContentType? = .password
    var isDisabled: Bool = false
    
    @State private var isSecure: Bool = true
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .font(.system(size: 16))
            .foregroundColor(.appText)
            .textContentType(textContentType)
            .disabled(isDisabled)
            .focused($isFocused)
            
            // Toggle visibility button
            Button(action: { isSecure.toggle() }, label: {
                Image(systemName: isSecure ? "eye.slash.fill" : "eye.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.appTextSecondary)
            })
            .disabled(isDisabled)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color(.systemGray6))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(isFocused ? Color.appPrimary : Color.clear, lineWidth: 1)
                )
        )
        .animation(.easeInOut(duration: 0.2), value: isFocused)
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        DSSecureField(
            text: .constant(""),
            placeholder: "Password"
        )
        
        DSSecureField(
            text: .constant("myPassword123"),
            placeholder: "Password"
        )
        
        DSSecureField(
            text: .constant("Disabled"),
            placeholder: "Disabled Field",
            isDisabled: true
        )
    }
    .padding()
    .background(Color.appBackground)
}
