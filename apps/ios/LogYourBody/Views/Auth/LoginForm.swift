import SwiftUI

struct LoginForm: View {
    @EnvironmentObject var authManager: AuthManager
    @Binding var email: String
    @Binding var password: String
    @Binding var isLoading: Bool
    var focusedField: FocusState<Field?>.Binding
    var onLogin: () -> Void

    enum Field {
        case email, password
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && !isLoading
    }

    var body: some View {
        VStack(spacing: 20) {
            // Email
            DSTextField(
                text: $email,
                placeholder: "you@example.com",
                label: "Email",
                keyboardType: .emailAddress,
                textContentType: .emailAddress
            )
            .focused(focusedField, equals: .email)
            .onSubmit { focusedField = .password }

            // Password
            DSTextField(
                text: $password,
                placeholder: "Password",
                label: "Password",
                textContentType: .password
            )
            .focused(focusedField, equals: .password)
            .onSubmit { if isFormValid { onLogin() } }

            // Forgot password
            HStack {
                Spacer()
                NavigationLink("Forgot password?") {
                    Text("Forgot Password View - Coming Soon")
                }
                .font(.footnote)
                .foregroundColor(DesignSystem.colors.textSecondary)
            }

            // Login button
            DSButton(
                "Sign in",
                style: .primary,
                isLoading: isLoading,
                fullWidth: true
            ) { onLogin() }
            .disabled(!isFormValid)

            AuthDivider()

            // Apple sign in
            AuthSocialButton(provider: .apple) {
                Task { await authManager.signInWithAppleOAuth() }
            }
        }
    }
}

#Preview {
    struct Wrapper: View {
        @State var email = ""
        @State var password = ""
        @State var loading = false
        @FocusState var focused: LoginForm.Field?

        var body: some View {
            LoginForm(
                email: $email,
                password: $password,
                isLoading: $loading,
                focusedField: $focused,
                onLogin: {}
            )
            .environmentObject(AuthManager.shared)
            .applyTheme()
        }
    }
    return Wrapper()
}
