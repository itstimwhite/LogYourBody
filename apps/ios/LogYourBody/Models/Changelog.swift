import Foundation

struct ChangelogEntry {
    let version: String
    let date: Date
    let changes: [Change]
    
    struct Change {
        enum ChangeType {
            case feature
            case improvement
            case bugfix
            case performance
            
            var icon: String {
                switch self {
                case .feature: return "sparkles"
                case .improvement: return "arrow.up.circle.fill"
                case .bugfix: return "ladybug.fill"
                case .performance: return "speedometer"
                }
            }
            
            var color: String {
                switch self {
                case .feature: return "blue"
                case .improvement: return "green"
                case .bugfix: return "red"
                case .performance: return "orange"
                }
            }
        }
        
        let type: ChangeType
        let description: String
    }
}

class ChangelogManager {
    static let shared = ChangelogManager()
    
    private init() {}
    
    // Add new versions at the top
    let entries: [ChangelogEntry] = [
        ChangelogEntry(
            version: "1.2.0",
            date: Date(timeIntervalSince1970: 1736019600), // Jan 5, 2025
            changes: [
                .init(type: .feature, description: "Import all historical data from HealthKit"),
                .init(type: .feature, description: "What's New section in Settings"),
                .init(type: .improvement, description: "Moved sync status banner to bottom of screen"),
                .init(type: .improvement, description: "Bottom-justified metrics for better visibility"),
                .init(type: .bugfix, description: "Fixed pending sync count for HealthKit imports"),
                .init(type: .bugfix, description: "Fixed infinite sync loop"),
                .init(type: .performance, description: "Added automatic cache clearing on app updates"),
                .init(type: .performance, description: "Improved database optimization")
            ]
        ),
        ChangelogEntry(
            version: "1.1.0",
            date: Date(timeIntervalSince1970: 1735689600), // Jan 1, 2025
            changes: [
                .init(type: .feature, description: "Redesigned profile settings with greyscale theme"),
                .init(type: .feature, description: "Real-time sync with cloud storage"),
                .init(type: .improvement, description: "Enhanced HealthKit integration"),
                .init(type: .improvement, description: "Better error handling for sync operations"),
                .init(type: .bugfix, description: "Fixed weight unit conversion issues"),
                .init(type: .bugfix, description: "Resolved app icon transparency for App Store")
            ]
        ),
        ChangelogEntry(
            version: "1.0.0",
            date: Date(timeIntervalSince1970: 1735430400), // Dec 29, 2024
            changes: [
                .init(type: .feature, description: "Initial release"),
                .init(type: .feature, description: "Track body weight and body fat percentage"),
                .init(type: .feature, description: "HealthKit integration for automatic syncing"),
                .init(type: .feature, description: "Beautiful charts and visualizations"),
                .init(type: .feature, description: "Secure authentication with Clerk"),
                .init(type: .feature, description: "Cross-platform sync with web app")
            ]
        )
    ]
    
    /// Get changelog entries since a specific version
    func entriesSince(version: String) -> [ChangelogEntry] {
        guard let index = entries.firstIndex(where: { $0.version == version }) else {
            return entries // Return all if version not found
        }
        return Array(entries.prefix(index))
    }
    
    /// Check if there are new updates since last viewed version
    func hasNewUpdates() -> Bool {
        let lastViewedVersion = UserDefaults.standard.string(forKey: "lastViewedChangelogVersion") ?? "0.0.0"
        return entries.first?.version != lastViewedVersion
    }
    
    /// Mark changelog as viewed
    func markAsViewed() {
        if let latestVersion = entries.first?.version {
            UserDefaults.standard.set(latestVersion, forKey: "lastViewedChangelogVersion")
        }
    }
}