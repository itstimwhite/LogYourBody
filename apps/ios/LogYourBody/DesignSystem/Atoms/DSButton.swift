//
// DSButton.swift
// LogYourBody
//
import SwiftUI

// MARK: - Design System Button Atom

struct DSButton: View {
    let title: String
    let style: ButtonStyle
    let size: ButtonSize
    let action: () -> Void
    
    enum ButtonStyle {
        case primary
        case secondary
        case tertiary
        
        var backgroundColor: Color {
            switch self {
            case .primary: return .appPrimary
            case .secondary: return .appCard
            case .tertiary: return .clear
            }
        }
        
        var foregroundColor: Color {
            switch self {
            case .primary: return .white
            case .secondary: return .appPrimary
            case .tertiary: return .appPrimary
            }
        }
    }
    
    enum ButtonSize {
        case small
        case medium
        case large
        
        var padding: EdgeInsets {
            switch self {
            case .small: return EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16)
            case .medium: return EdgeInsets(top: 12, leading: 24, bottom: 12, trailing: 24)
            case .large: return EdgeInsets(top: 16, leading: 32, bottom: 16, trailing: 32)
            }
        }
        
        var font: Font {
            switch self {
            case .small: return .caption
            case .medium: return .body
            case .large: return .headline
            }
        }
    }
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(size.font)
                .foregroundColor(style.foregroundColor)
                .padding(size.padding)
                .background(style.backgroundColor)
                .cornerRadius(8)
        }
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        // Primary buttons
        DSButton(title: "Primary Small", style: .primary, size: .small, action: {})
        DSButton(title: "Primary Medium", style: .primary, size: .medium, action: {})
        DSButton(title: "Primary Large", style: .primary, size: .large, action: {})
        
        // Secondary buttons
        DSButton(title: "Secondary Medium", style: .secondary, size: .medium, action: {})
        
        // Tertiary buttons
        DSButton(title: "Tertiary Medium", style: .tertiary, size: .medium, action: {})
    }
    .padding()
    .background(Color.appBackground)
}
