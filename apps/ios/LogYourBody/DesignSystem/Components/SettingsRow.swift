//
//  SettingsRow.swift
//  LogYourBody
//
//  Reusable settings and list row components
//

import SwiftUI

// MARK: - Settings Row Type

enum SettingsRowType {
    case navigation
    case toggle(isOn: Binding<Bool>)
    case value(text: String)
    case action
    case picker(selection: Binding<String>, options: [String])
    case stepper(value: Binding<Int>, range: ClosedRange<Int>)
}

// MARK: - Settings Row

struct SettingsRow: View {
    @Environment(\.theme) var theme
    
    let icon: String?
    let iconColor: Color?
    let title: String
    let subtitle: String?
    let type: SettingsRowType
    let action: (() -> Void)?
    
    @State private var isPressed = false
    
    init(
        icon: String? = nil,
        iconColor: Color? = nil,
        title: String,
        subtitle: String? = nil,
        type: SettingsRowType = .navigation,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.iconColor = iconColor
        self.title = title
        self.subtitle = subtitle
        self.type = type
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            if case .navigation = type {
                theme.haptics.selection()
                action?()
            } else if case .action = type {
                theme.haptics.impact(.light)
                action?()
            }
        }) {
            HStack(spacing: theme.spacing.md) {
                // Icon
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(iconColor ?? theme.colors.primary)
                        .frame(width: 28, height: 28)
                }
                
                // Content
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(theme.typography.bodyMedium)
                        .foregroundColor(theme.colors.text)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(theme.typography.captionLarge)
                            .foregroundColor(theme.colors.textSecondary)
                            .lineLimit(2)
                    }
                }
                
                Spacer()
                
                // Trailing content
                trailingContent
            }
            .padding(.horizontal, theme.spacing.screenPadding)
            .padding(.vertical, theme.spacing.sm)
            .background(
                theme.colors.background
                    .opacity(isPressed ? 0.5 : 0)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(!isInteractive)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            if isInteractive {
                withAnimation(theme.animation.ultraFast) {
                    isPressed = pressing
                }
            }
        }, perform: {})
    }
    
    @ViewBuilder
    private var trailingContent: some View {
        switch type {
        case .navigation:
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(theme.colors.textTertiary)
                
        case .toggle(let isOn):
            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(theme.colors.primary)
                
        case .value(let text):
            Text(text)
                .font(theme.typography.bodyMedium)
                .foregroundColor(theme.colors.textSecondary)
                
        case .action:
            EmptyView()
                
        case .picker(let selection, let options):
            Menu {
                ForEach(options, id: \.self) { option in
                    Button(action: {
                        selection.wrappedValue = option
                    }) {
                        HStack {
                            Text(option)
                            if selection.wrappedValue == option {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            } label: {
                HStack(spacing: 4) {
                    Text(selection.wrappedValue)
                        .font(theme.typography.bodyMedium)
                        .foregroundColor(theme.colors.textSecondary)
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 12))
                        .foregroundColor(theme.colors.textTertiary)
                }
            }
            
        case .stepper(let value, let range):
            Stepper(
                value: value,
                in: range
            ) {
                Text("\(value.wrappedValue)")
                    .font(theme.typography.bodyMedium)
                    .foregroundColor(theme.colors.textSecondary)
            }
            .labelsHidden()
        }
    }
    
    private var isInteractive: Bool {
        switch type {
        case .navigation, .action:
            return true
        default:
            return false
        }
    }
}

// MARK: - Settings Section

struct SettingsSection<Content: View>: View {
    @Environment(\.theme) var theme
    
    let title: String?
    let footer: String?
    @ViewBuilder let content: () -> Content
    
    init(
        title: String? = nil,
        footer: String? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.footer = footer
        self.content = content
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            if let title = title {
                Text(title.uppercased())
                    .font(theme.typography.captionMedium)
                    .foregroundColor(theme.colors.textTertiary)
                    .padding(.horizontal, theme.spacing.screenPadding)
                    .padding(.bottom, theme.spacing.xs)
            }
            
            // Content with separators
            VStack(spacing: 0) {
                content()
            }
            .background(theme.colors.surface)
            .cornerRadius(theme.radius.lg)
            .padding(.horizontal, theme.spacing.screenPadding)
            
            // Footer
            if let footer = footer {
                Text(footer)
                    .font(theme.typography.captionMedium)
                    .foregroundColor(theme.colors.textTertiary)
                    .padding(.horizontal, theme.spacing.screenPadding)
                    .padding(.top, theme.spacing.xs)
            }
        }
        .padding(.vertical, theme.spacing.sm)
    }
}

// MARK: - List Row

struct ListRow: View {
    @Environment(\.theme) var theme
    
    let title: String
    let subtitle: String?
    let leading: AnyView?
    let trailing: AnyView?
    let action: (() -> Void)?
    
    @State private var isPressed = false
    
    init(
        title: String,
        subtitle: String? = nil,
        leading: AnyView? = nil,
        trailing: AnyView? = nil,
        action: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.leading = leading
        self.trailing = trailing
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            theme.haptics.selection()
            action?()
        }) {
            HStack(spacing: theme.spacing.md) {
                // Leading content
                if let leading = leading {
                    leading
                }
                
                // Main content
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(theme.typography.bodyMedium)
                        .foregroundColor(theme.colors.text)
                        .lineLimit(1)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(theme.typography.captionLarge)
                            .foregroundColor(theme.colors.textSecondary)
                            .lineLimit(2)
                    }
                }
                
                Spacer()
                
                // Trailing content
                if let trailing = trailing {
                    trailing
                } else if action != nil {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(theme.colors.textTertiary)
                }
            }
            .padding(.horizontal, theme.spacing.screenPadding)
            .padding(.vertical, theme.spacing.sm)
            .background(
                theme.colors.background
                    .opacity(isPressed ? 0.5 : 0)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(action == nil)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            if action != nil {
                withAnimation(theme.animation.ultraFast) {
                    isPressed = pressing
                }
            }
        }, perform: {})
    }
}

// MARK: - Destructive Row

struct DestructiveRow: View {
    @Environment(\.theme) var theme
    
    let title: String
    let icon: String?
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            theme.haptics.impact(.medium)
            action()
        }) {
            HStack(spacing: theme.spacing.md) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(theme.colors.error)
                }
                
                Text(title)
                    .font(theme.typography.bodyMedium)
                    .foregroundColor(theme.colors.error)
                
                Spacer()
            }
            .padding(.horizontal, theme.spacing.screenPadding)
            .padding(.vertical, theme.spacing.sm)
            .background(
                theme.colors.error
                    .opacity(isPressed ? 0.1 : 0)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(theme.animation.ultraFast) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

// MARK: - Preview

struct SettingsRow_Previews: PreviewProvider {
    static var previews: some View {
        ThemePreview {
            ScrollView {
                VStack(spacing: 0) {
                    // Settings sections
                    SettingsSection(title: "Account") {
                        SettingsRow(
                            icon: "person.circle",
                            title: "Profile",
                            subtitle: "John Doe",
                            type: .navigation
                        ) { }
                        
                        Divider()
                            .background(Color(white: 0.15))
                            .padding(.leading, 60)
                        
                        SettingsRow(
                            icon: "envelope",
                            title: "Email",
                            type: .value(text: "john@example.com")
                        )
                    }
                    
                    SettingsSection(title: "Preferences") {
                        SettingsRow(
                            icon: "moon",
                            title: "Dark Mode",
                            type: .toggle(isOn: .constant(true))
                        )
                        
                        Divider()
                            .background(Color(white: 0.15))
                            .padding(.leading, 60)
                        
                        SettingsRow(
                            icon: "textformat",
                            title: "Font Size",
                            type: .picker(
                                selection: .constant("Medium"),
                                options: ["Small", "Medium", "Large"]
                            )
                        )
                        
                        Divider()
                            .background(Color(white: 0.15))
                            .padding(.leading, 60)
                        
                        SettingsRow(
                            icon: "bell",
                            title: "Notifications",
                            subtitle: "Manage notification preferences",
                            type: .navigation
                        ) { }
                    }
                    
                    SettingsSection(
                        title: "Data",
                        footer: "Your data will be permanently deleted"
                    ) {
                        DestructiveRow(
                            title: "Delete Account",
                            icon: "trash"
                        ) { }
                    }
                    
                    // List rows
                    SettingsSection(title: "Recent Activity") {
                        ListRow(
                            title: "Workout Session",
                            subtitle: "45 minutes • 320 calories",
                            leading: AnyView(
                                Image(systemName: "figure.run")
                                    .font(.system(size: 24))
                                    .foregroundColor(.orange)
                            ),
                            trailing: AnyView(
                                Text("2h ago")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            )
                        ) { }
                        
                        Divider()
                            .background(Color(white: 0.15))
                        
                        ListRow(
                            title: "Weight Entry",
                            subtitle: "72.5 kg",
                            leading: AnyView(
                                Image(systemName: "scalemass")
                                    .font(.system(size: 24))
                                    .foregroundColor(.blue)
                            ),
                            trailing: AnyView(
                                Text("Yesterday")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            )
                        ) { }
                    }
                }
            }
            .background(Color.black)
        }
    }
}