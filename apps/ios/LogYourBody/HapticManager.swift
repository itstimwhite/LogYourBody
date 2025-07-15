//
// HapticManager.swift
// LogYourBody
//
import UIKit

class HapticManager {
    static let shared = HapticManager()
    
    private init() {}
    
    // MARK: - Impact Feedback
    func impact(style: UIImpactFeedbackGenerator.FeedbackStyle) {
        Task { @MainActor in
            let generator = UIImpactFeedbackGenerator(style: style)
            generator.prepare()
            generator.impactOccurred()
        }
    }
    
    // MARK: - Notification Feedback
    func notification(type: UINotificationFeedbackGenerator.FeedbackType) {
        Task { @MainActor in
            let generator = UINotificationFeedbackGenerator()
            generator.prepare()
            generator.notificationOccurred(type)
        }
    }
    
    // MARK: - Selection Feedback
    func selection() {
        Task { @MainActor in
            let generator = UISelectionFeedbackGenerator()
            generator.prepare()
            generator.selectionChanged()
        }
    }
    
    // MARK: - Custom Patterns
    func buttonTap() {
        impact(style: .light)
    }
    
    // Alias for buttonTap to match usage in codebase
    func buttonTapped() {
        buttonTap()
    }
    
    func tabSelection() {
        impact(style: .medium)
    }
    
    // Alias for tabSelection to match usage in codebase
    func tabSelected() {
        tabSelection()
    }
    
    func sliderChanged() {
        selection()
    }
    
    func successAction() {
        notification(type: .success)
    }
    
    func errorAction() {
        notification(type: .error)
    }
    
    func warningAction() {
        notification(type: .warning)
    }
    
    func success() {
        successAction()
    }
    
    func ringThresholdCrossed(entering: Bool) {
        if entering {
            notification(type: .success)
        } else {
            impact(style: .light)
        }
    }
}
