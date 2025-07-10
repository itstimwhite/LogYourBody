//
//  StandardTextField.swift
//  LogYourBody
//
//  Reusable text field component with consistent styling
//

import SwiftUI

// MARK: - Text Field Style Enum

enum TextFieldStyle {
    case standard
    case filled
    case outlined
}

// MARK: - Standard Text Field

struct StandardTextField: View {
    @Environment(\.theme) var theme
    @FocusState private var isFocused: Bool
    
    @Binding var text: String
    let placeholder: String
    let label: String?
    let icon: String?
    let style: TextFieldStyle
    let keyboardType: UIKeyboardType
    let textContentType: UITextContentType?
    let errorMessage: String?
    let helperText: String?
    let characterLimit: Int?
    let onEditingChanged: ((Bool) -> Void)?
    let onCommit: (() -> Void)?
    
    @State private var showPassword = false
    
    private var isSecureField: Bool {
        textContentType == .password || textContentType == .newPassword
    }
    
    init(
        text: Binding<String>,
        placeholder: String = "",
        label: String? = nil,
        icon: String? = nil,
        style: TextFieldStyle = .standard,
        keyboardType: UIKeyboardType = .default,
        textContentType: UITextContentType? = nil,
        errorMessage: String? = nil,
        helperText: String? = nil,
        characterLimit: Int? = nil,
        onEditingChanged: ((Bool) -> Void)? = nil,
        onCommit: (() -> Void)? = nil
    ) {
        self._text = text
        self.placeholder = placeholder
        self.label = label
        self.icon = icon
        self.style = style
        self.keyboardType = keyboardType
        self.textContentType = textContentType
        self.errorMessage = errorMessage
        self.helperText = helperText
        self.characterLimit = characterLimit
        self.onEditingChanged = onEditingChanged
        self.onCommit = onCommit
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            // Label
            if let label = label {
                Text(label)
                    .font(theme.typography.labelMedium)
                    .foregroundColor(theme.colors.textSecondary)
            }
            
            // Text Field Container
            HStack(spacing: theme.spacing.sm) {
                // Leading icon
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 18))
                        .foregroundColor(iconColor)
                        .transition(.opacity)
                }
                
                // Text Field
                Group {
                    if isSecureField && !showPassword {
                        SecureField(placeholder, text: $text) {
                            onCommit?()
                        }
                    } else {
                        TextField(placeholder, text: $text) { editing in
                            onEditingChanged?(editing)
                        } onCommit: {
                            onCommit?()
                        }
                    }
                }
                .textContentType(textContentType)
                .keyboardType(keyboardType)
                .autocapitalization(textContentType == .emailAddress ? .none : .sentences)
                .disableAutocorrection(textContentType == .emailAddress || isSecureField)
                .font(theme.typography.bodyMedium)
                .foregroundColor(theme.colors.text)
                .focused($isFocused)
                
                // Trailing elements
                HStack(spacing: theme.spacing.xs) {
                    // Character count
                    if let limit = characterLimit {
                        Text("\(text.count)/\(limit)")
                            .font(theme.typography.captionSmall)
                            .foregroundColor(
                                text.count > limit ? theme.colors.error : theme.colors.textTertiary
                            )
                    }
                    
                    // Password toggle
                    if isSecureField {
                        Button(action: { showPassword.toggle() }) {
                            Image(systemName: showPassword ? "eye.slash" : "eye")
                                .font(.system(size: 16))
                                .foregroundColor(theme.colors.textSecondary)
                        }
                    }
                    
                    // Clear button
                    if !text.isEmpty && isFocused {
                        Button(action: { text = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(theme.colors.textTertiary)
                        }
                        .transition(.scale.combined(with: .opacity))
                    }
                }
            }
            .padding(.horizontal, theme.spacing.md)
            .padding(.vertical, theme.spacing.sm)
            .background(backgroundView)
            .cornerRadius(theme.radius.input)
            .overlay(overlayView)
            .animation(theme.animation.fast, value: isFocused)
            .animation(theme.animation.fast, value: errorMessage != nil)
            
            // Helper/Error text
            if let error = errorMessage {
                HStack(spacing: theme.spacing.xxs) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 12))
                    Text(error)
                        .font(theme.typography.captionMedium)
                }
                .foregroundColor(theme.colors.error)
                .transition(.move(edge: .top).combined(with: .opacity))
            } else if let helper = helperText {
                Text(helper)
                    .font(theme.typography.captionMedium)
                    .foregroundColor(theme.colors.textTertiary)
            }
        }
    }
    
    // MARK: - Computed Properties
    
    @ViewBuilder
    private var backgroundView: some View {
        switch style {
        case .standard:
            theme.colors.surface
        case .filled:
            theme.colors.surfaceSecondary
        case .outlined:
            Color.clear
        }
    }
    
    @ViewBuilder
    private var overlayView: some View {
        RoundedRectangle(cornerRadius: theme.radius.input)
            .stroke(borderColor, lineWidth: borderWidth)
    }
    
    private var borderColor: Color {
        if errorMessage != nil {
            return theme.colors.error
        } else if isFocused {
            return theme.colors.borderFocused
        } else {
            switch style {
            case .outlined:
                return theme.colors.border
            default:
                return Color.clear
            }
        }
    }
    
    private var borderWidth: CGFloat {
        if isFocused || errorMessage != nil {
            return 2
        } else {
            return style == .outlined ? 1 : 0
        }
    }
    
    private var iconColor: Color {
        if errorMessage != nil {
            return theme.colors.error
        } else if isFocused {
            return theme.colors.primary
        } else {
            return theme.colors.textSecondary
        }
    }
}

// MARK: - Search Field

struct SearchField: View {
    @Environment(\.theme) var theme
    @FocusState private var isFocused: Bool
    
    @Binding var text: String
    let placeholder: String
    let onSearch: (() -> Void)?
    
    init(
        text: Binding<String>,
        placeholder: String = "Search",
        onSearch: (() -> Void)? = nil
    ) {
        self._text = text
        self.placeholder = placeholder
        self.onSearch = onSearch
    }
    
    var body: some View {
        HStack(spacing: theme.spacing.sm) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16))
                .foregroundColor(theme.colors.textSecondary)
            
            TextField(placeholder, text: $text) {
                onSearch?()
            }
            .font(theme.typography.bodyMedium)
            .foregroundColor(theme.colors.text)
            .focused($isFocused)
            
            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(theme.colors.textTertiary)
                }
                .transition(.scale.combined(with: .opacity))
            }
        }
        .padding(.horizontal, theme.spacing.md)
        .padding(.vertical, theme.spacing.sm)
        .background(theme.colors.surface)
        .cornerRadius(theme.radius.full)
        .overlay(
            RoundedRectangle(cornerRadius: theme.radius.full)
                .stroke(isFocused ? theme.colors.borderFocused : Color.clear, lineWidth: 2)
        )
        .animation(theme.animation.fast, value: isFocused)
    }
}

// MARK: - Text Area

struct TextArea: View {
    @Environment(\.theme) var theme
    @FocusState private var isFocused: Bool
    
    @Binding var text: String
    let placeholder: String
    let label: String?
    let minHeight: CGFloat
    let maxHeight: CGFloat
    let characterLimit: Int?
    let errorMessage: String?
    
    init(
        text: Binding<String>,
        placeholder: String = "",
        label: String? = nil,
        minHeight: CGFloat = 100,
        maxHeight: CGFloat = 300,
        characterLimit: Int? = nil,
        errorMessage: String? = nil
    ) {
        self._text = text
        self.placeholder = placeholder
        self.label = label
        self.minHeight = minHeight
        self.maxHeight = maxHeight
        self.characterLimit = characterLimit
        self.errorMessage = errorMessage
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            // Label
            if let label = label {
                Text(label)
                    .font(theme.typography.labelMedium)
                    .foregroundColor(theme.colors.textSecondary)
            }
            
            // Text Editor
            ZStack(alignment: .topLeading) {
                // Placeholder
                if text.isEmpty {
                    Text(placeholder)
                        .font(theme.typography.bodyMedium)
                        .foregroundColor(theme.colors.textTertiary)
                        .padding(.horizontal, theme.spacing.sm)
                        .padding(.vertical, theme.spacing.xs)
                }
                
                // Text Editor
                TextEditor(text: $text)
                    .font(theme.typography.bodyMedium)
                    .foregroundColor(theme.colors.text)
                    .scrollContentBackground(.hidden)
                    .background(Color.clear)
                    .focused($isFocused)
                    .frame(minHeight: minHeight, maxHeight: maxHeight)
            }
            .padding(theme.spacing.sm)
            .background(theme.colors.surface)
            .cornerRadius(theme.radius.input)
            .overlay(
                RoundedRectangle(cornerRadius: theme.radius.input)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            
            // Footer
            HStack {
                // Error message
                if let error = errorMessage {
                    HStack(spacing: theme.spacing.xxs) {
                        Image(systemName: "exclamationmark.circle.fill")
                            .font(.system(size: 12))
                        Text(error)
                            .font(theme.typography.captionMedium)
                    }
                    .foregroundColor(theme.colors.error)
                }
                
                Spacer()
                
                // Character count
                if let limit = characterLimit {
                    Text("\(text.count)/\(limit)")
                        .font(theme.typography.captionSmall)
                        .foregroundColor(
                            text.count > limit ? theme.colors.error : theme.colors.textTertiary
                        )
                }
            }
        }
    }
    
    private var borderColor: Color {
        if errorMessage != nil {
            return theme.colors.error
        } else if isFocused {
            return theme.colors.borderFocused
        } else {
            return theme.colors.border
        }
    }
    
    private var borderWidth: CGFloat {
        isFocused || errorMessage != nil ? 2 : 1
    }
}

// MARK: - Preview

struct StandardTextField_Previews: PreviewProvider {
    static var previews: some View {
        ThemePreview {
            ScrollView {
                VStack(spacing: 24) {
                    // Standard text fields
                    StandardTextField(
                        text: .constant(""),
                        placeholder: "Enter your name",
                        label: "Name",
                        icon: "person"
                    )
                    
                    StandardTextField(
                        text: .constant("john@example.com"),
                        placeholder: "Enter your email",
                        label: "Email",
                        icon: "envelope",
                        keyboardType: .emailAddress,
                        textContentType: .emailAddress
                    )
                    
                    // Password field
                    StandardTextField(
                        text: .constant("password123"),
                        placeholder: "Enter your password",
                        label: "Password",
                        icon: "lock",
                        textContentType: .password
                    )
                    
                    // With error
                    StandardTextField(
                        text: .constant("invalid"),
                        placeholder: "Enter value",
                        label: "Field with Error",
                        errorMessage: "This field is required"
                    )
                    
                    // With helper text
                    StandardTextField(
                        text: .constant(""),
                        placeholder: "Enter username",
                        label: "Username",
                        helperText: "Choose a unique username"
                    )
                    
                    // With character limit
                    StandardTextField(
                        text: .constant("Hello"),
                        placeholder: "Bio",
                        label: "Short Bio",
                        characterLimit: 50
                    )
                    
                    // Search field
                    SearchField(text: .constant(""))
                    
                    // Text area
                    TextArea(
                        text: .constant(""),
                        placeholder: "Tell us about yourself...",
                        label: "About",
                        characterLimit: 500
                    )
                }
                .padding()
            }
            .background(Color.black)
        }
    }
}