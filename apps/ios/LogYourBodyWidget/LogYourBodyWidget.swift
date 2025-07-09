//
//  LogYourBodyWidget.swift
//  LogYourBodyWidget
//
//  Daily metrics widget showing weight, body fat %, and step count
//

import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> MetricsEntry {
        MetricsEntry(date: Date(), metrics: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (MetricsEntry) -> ()) {
        let entry = MetricsEntry(date: Date(), metrics: .placeholder)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            // Fetch current metrics from shared container
            let metrics = await fetchCurrentMetrics()
            let entry = MetricsEntry(date: Date(), metrics: metrics)
            
            // Update every hour
            let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            
            completion(timeline)
        }
    }
    
    private func fetchCurrentMetrics() async -> DailyMetrics {
        // Access shared UserDefaults or Core Data from app group
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.logyourbody.shared") else {
            return .placeholder
        }
        
        // Get today's metrics
        let weight = sharedDefaults.double(forKey: "widget.latestWeight")
        let bodyFat = sharedDefaults.double(forKey: "widget.latestBodyFat")
        let steps = sharedDefaults.integer(forKey: "widget.todaySteps")
        let lastUpdated = sharedDefaults.object(forKey: "widget.lastUpdated") as? Date ?? Date()
        
        return DailyMetrics(
            weight: weight > 0 ? weight : nil,
            bodyFatPercentage: bodyFat > 0 ? bodyFat : nil,
            stepCount: steps,
            lastUpdated: lastUpdated
        )
    }
}

struct MetricsEntry: TimelineEntry {
    let date: Date
    let metrics: DailyMetrics
}

struct DailyMetrics {
    let weight: Double?
    let bodyFatPercentage: Double?
    let stepCount: Int
    let lastUpdated: Date
    
    static let placeholder = DailyMetrics(
        weight: 180.5,
        bodyFatPercentage: 18.2,
        stepCount: 8432,
        lastUpdated: Date()
    )
}

struct LogYourBodyWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(metrics: entry.metrics)
        case .systemMedium:
            MediumWidgetView(metrics: entry.metrics)
        default:
            SmallWidgetView(metrics: entry.metrics)
        }
    }
}

struct SmallWidgetView: View {
    let metrics: DailyMetrics
    
    var body: some View {
        VStack(spacing: 8) {
            // Header
            HStack {
                Image(systemName: "figure.arms.open")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.accentColor)
                Text("Today")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.top, 12)
            
            // Three rings
            HStack(spacing: 12) {
                MetricRingView(
                    value: metrics.weight ?? 0,
                    maxValue: 250,
                    label: "lbs",
                    icon: "scalemass",
                    color: .blue,
                    showValue: metrics.weight != nil
                )
                
                MetricRingView(
                    value: metrics.bodyFatPercentage ?? 0,
                    maxValue: 40,
                    label: "%",
                    icon: "percent",
                    color: .green,
                    showValue: metrics.bodyFatPercentage != nil
                )
                
                MetricRingView(
                    value: Double(metrics.stepCount),
                    maxValue: 10000,
                    label: "steps",
                    icon: "figure.walk",
                    color: .orange,
                    showValue: true
                )
            }
            .padding(.horizontal, 12)
            
            Spacer()
            
            // Tap to log prompt
            HStack {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 12))
                Text("Log Data")
                    .font(.system(size: 12, weight: .medium))
            }
            .foregroundColor(.secondary)
            .padding(.bottom, 12)
        }
        .containerBackground(for: .widget) {
            Color(.systemBackground)
        }
        .widgetURL(URL(string: "logyourbody://log")!)
    }
}

struct MediumWidgetView: View {
    let metrics: DailyMetrics
    
    var body: some View {
        HStack(spacing: 16) {
            // Left side - Rings
            VStack(spacing: 8) {
                HStack {
                    Image(systemName: "figure.arms.open")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.accentColor)
                    Text("Today's Progress")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                    Spacer()
                }
                
                HStack(spacing: 16) {
                    MetricRingView(
                        value: metrics.weight ?? 0,
                        maxValue: 250,
                        label: "lbs",
                        icon: "scalemass",
                        color: .blue,
                        showValue: metrics.weight != nil,
                        size: 48
                    )
                    
                    MetricRingView(
                        value: metrics.bodyFatPercentage ?? 0,
                        maxValue: 40,
                        label: "%",
                        icon: "percent",
                        color: .green,
                        showValue: metrics.bodyFatPercentage != nil,
                        size: 48
                    )
                    
                    MetricRingView(
                        value: Double(metrics.stepCount),
                        maxValue: 10000,
                        label: "steps",
                        icon: "figure.walk",
                        color: .orange,
                        showValue: true,
                        size: 48
                    )
                }
            }
            
            Divider()
                .frame(height: 60)
            
            // Right side - Quick actions
            VStack(spacing: 12) {
                Link(destination: URL(string: "logyourbody://log/weight")!) {
                    QuickActionButton(icon: "scalemass", text: "Weight")
                }
                
                Link(destination: URL(string: "logyourbody://log/bodyfat")!) {
                    QuickActionButton(icon: "percent", text: "Body Fat")
                }
                
                Link(destination: URL(string: "logyourbody://log/photo")!) {
                    QuickActionButton(icon: "camera.fill", text: "Photo")
                }
            }
        }
        .padding(16)
        .containerBackground(for: .widget) {
            Color(.systemBackground)
        }
    }
}

struct MetricRingView: View {
    let value: Double
    let maxValue: Double
    let label: String
    let icon: String
    let color: Color
    let showValue: Bool
    var size: CGFloat = 36
    
    private var progress: Double {
        min(value / maxValue, 1.0)
    }
    
    private var displayValue: String {
        if !showValue {
            return "—"
        }
        
        if label == "steps" {
            return "\(Int(value))"
        } else if label == "%" {
            return String(format: "%.1f", value)
        } else {
            return String(format: "%.1f", value)
        }
    }
    
    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                // Background ring
                Circle()
                    .stroke(color.opacity(0.2), lineWidth: 3)
                    .frame(width: size, height: size)
                
                // Progress ring
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(color, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: size, height: size)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.3), value: progress)
                
                // Icon
                Image(systemName: icon)
                    .font(.system(size: size * 0.4, weight: .medium))
                    .foregroundColor(color)
            }
            
            VStack(spacing: 1) {
                Text(displayValue)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text(label)
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14))
            Text(text)
                .font(.system(size: 13, weight: .medium))
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.secondary)
        }
        .foregroundColor(.primary)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(8)
    }
}

@main
struct LogYourBodyWidget: Widget {
    let kind: String = "LogYourBodyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            LogYourBodyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Daily Metrics")
        .description("Track your weight, body fat, and daily steps")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemSmall) {
    LogYourBodyWidget()
} timeline: {
    MetricsEntry(date: .now, metrics: .placeholder)
}

#Preview(as: .systemMedium) {
    LogYourBodyWidget()
} timeline: {
    MetricsEntry(date: .now, metrics: .placeholder)
}
