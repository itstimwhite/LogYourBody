import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @FocusState private var focusedField: LoginForm.Field?

    var body: some View {
        AuthContainer {
            AuthTitle(title: "LogYourBody", subtitle: "Track your fitness journey")

            LoginForm(
                email: $email,
                password: $password,
                isLoading: $isLoading,
                focusedField: $focusedField,
                onLogin: login
            )

            HStack(spacing: 4) {
                Text("Don't have an account?")
                    .foregroundColor(DesignSystem.colors.textSecondary)
                    .font(.footnote)

                NavigationLink("Sign up") {
                    SignUpView()
                }
                .font(.footnote)
            }
            .padding(.top, DesignSystem.spacing.sm)
        }
        .navigationBarHidden(true)
        .authErrorAlert(showError: $showError, message: errorMessage)
        .onTapGesture { focusedField = nil }
    }

    private func login() {
        guard !isLoading else { return }

        focusedField = nil
        isLoading = true

        Task { @MainActor in
            do {
                try await AuthManager.shared.login(email: email, password: password)
                isLoading = false
            } catch {
                errorMessage = "Invalid email or password. Please try again."
                showError = true
                isLoading = false
            }
        }
    }
}

#Preview {
    NavigationView {
        LoginView()
            .environmentObject(AuthManager.shared)
            .applyTheme()
    }
}
