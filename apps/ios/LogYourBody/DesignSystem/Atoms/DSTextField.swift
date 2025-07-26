//
// DSTextField.swift
// LogYourBody
//
import SwiftUI

// MARK: - DSTextField Atom

struct DSTextField: View {
    @Binding var text: String
    let placeholder: String
    var keyboardType: UIKeyboardType = .default
    var textContentType: UITextContentType?
    var autocapitalization: TextInputAutocapitalization = .sentences
    var isDisabled: Bool = false
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        TextField(placeholder, text: $text)
            .font(.system(size: 16))
            .foregroundColor(.appText)
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
            .keyboardType(keyboardType)
            .textContentType(textContentType)
            .textInputAutocapitalization(autocapitalization)
            .disabled(isDisabled)
            .focused($isFocused)
            .animation(.easeInOut(duration: 0.2), value: isFocused)
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        DSTextField(
            text: .constant(""),
            placeholder: "Email",
            keyboardType: .emailAddress,
            textContentType: .emailAddress,
            autocapitalization: .never
        )
        
        DSTextField(
            text: .constant("john@example.com"),
            placeholder: "Email"
        )
        
        DSTextField(
            text: .constant("Disabled"),
            placeholder: "Disabled Field",
            isDisabled: true
        )
    }
    .padding()
    .background(Color.appBackground)
}
