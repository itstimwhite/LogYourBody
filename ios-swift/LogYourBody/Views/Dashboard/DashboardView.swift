import SwiftUI
import Charts

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject var userManager: UserManager
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Current Stats Card
                    CurrentStatsCard(
                        weight: viewModel.latestMetric?.weight,
                        bodyFat: viewModel.latestMetric?.bodyFatPercentage,
                        leanMass: viewModel.latestMetric?.leanBodyMass,
                        ffmi: viewModel.calculateFFMI()
                    )
                    
                    // Weight Chart
                    if !viewModel.metrics.isEmpty {
                        ChartCard(title: "Weight Trend") {
                            WeightChart(metrics: viewModel.metrics)
                        }
                    }
                    
                    // Body Fat Chart
                    if viewModel.hasBodyFatData {
                        ChartCard(title: "Body Fat %") {
                            BodyFatChart(metrics: viewModel.metrics)
                        }
                    }
                    
                    // Goals Progress
                    if let goals = userManager.userProfile?.goals {
                        GoalsProgressCard(goals: goals, currentMetric: viewModel.latestMetric)
                    }
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: viewModel.refreshData) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .refreshable {
                await viewModel.loadData()
            }
            .task {
                await viewModel.loadData()
            }
        }
    }
}

// MARK: - Current Stats Card
struct CurrentStatsCard: View {
    let weight: Double?
    let bodyFat: Double?
    let leanMass: Double?
    let ffmi: Double?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Current Stats")
                .font(.headline)
            
            HStack(spacing: 20) {
                StatItem(
                    title: "Weight",
                    value: weight.map { String(format: "%.1f", $0) } ?? "--",
                    unit: "lbs",
                    icon: "scalemass",
                    color: .blue
                )
                
                StatItem(
                    title: "Body Fat",
                    value: bodyFat.map { String(format: "%.1f", $0) } ?? "--",
                    unit: "%",
                    icon: "percent",
                    color: .orange
                )
                
                StatItem(
                    title: "Lean Mass",
                    value: leanMass.map { String(format: "%.1f", $0) } ?? "--",
                    unit: "lbs",
                    icon: "figure.strengthtraining.traditional",
                    color: .green
                )
                
                StatItem(
                    title: "FFMI",
                    value: ffmi.map { String(format: "%.1f", $0) } ?? "--",
                    unit: "",
                    icon: "chart.bar",
                    color: .purple
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct StatItem: View {
    let title: String
    let value: String
    let unit: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            VStack(spacing: 2) {
                HStack(spacing: 2) {
                    Text(value)
                        .font(.title3)
                        .fontWeight(.semibold)
                    if !unit.isEmpty {
                        Text(unit)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Chart Card
struct ChartCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            
            content
                .frame(height: 200)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

// MARK: - Weight Chart
struct WeightChart: View {
    let metrics: [BodyMetric]
    
    var body: some View {
        Chart(metrics) { metric in
            if let weight = metric.weight {
                LineMark(
                    x: .value("Date", metric.date),
                    y: .value("Weight", weight)
                )
                .foregroundStyle(.blue)
                
                PointMark(
                    x: .value("Date", metric.date),
                    y: .value("Weight", weight)
                )
                .foregroundStyle(.blue)
            }
        }
    }
}

// MARK: - Body Fat Chart
struct BodyFatChart: View {
    let metrics: [BodyMetric]
    
    var body: some View {
        Chart(metrics) { metric in
            if let bodyFat = metric.bodyFatPercentage {
                LineMark(
                    x: .value("Date", metric.date),
                    y: .value("Body Fat %", bodyFat)
                )
                .foregroundStyle(.orange)
                
                PointMark(
                    x: .value("Date", metric.date),
                    y: .value("Body Fat %", bodyFat)
                )
                .foregroundStyle(.orange)
            }
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(UserManager.shared)
}