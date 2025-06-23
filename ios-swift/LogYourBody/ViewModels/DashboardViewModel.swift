import Foundation
import SwiftUI

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var metrics: [BodyMetric] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    var latestMetric: BodyMetric? {
        metrics.first
    }
    
    var hasBodyFatData: Bool {
        metrics.contains { $0.bodyFatPercentage != nil }
    }
    
    func loadData() async {
        guard let userId = AuthManager.shared.currentUser?.id else { return }
        
        isLoading = true
        error = nil
        
        do {
            let fetchedMetrics = try await SupabaseManager.shared.fetchBodyMetrics(userId: userId)
            self.metrics = fetchedMetrics
        } catch {
            self.error = error
            print("Failed to load metrics: \(error)")
        }
        
        isLoading = false
    }
    
    func refreshData() {
        Task {
            await loadData()
        }
    }
    
    func calculateFFMI() -> Double? {
        guard let latestMetric = latestMetric,
              let weight = latestMetric.weight,
              let bodyFat = latestMetric.bodyFatPercentage,
              let profile = UserManager.shared.userProfile,
              let height = profile.height else {
            return nil
        }
        
        // Convert height to meters
        let heightInMeters = profile.heightUnit == "cm" ? height / 100 : height * 0.0254
        
        // Calculate lean body mass in kg
        let weightInKg = latestMetric.weightUnit == "kg" ? weight : weight * 0.453592
        let leanMassKg = weightInKg * (1 - bodyFat / 100)
        
        // Calculate FFMI
        let ffmi = leanMassKg / (heightInMeters * heightInMeters)
        
        // Normalize to 1.8m height
        let normalizedFFMI = ffmi + 6.1 * (1.8 - heightInMeters)
        
        return normalizedFFMI
    }
}

// MARK: - Goals Progress Card
struct GoalsProgressCard: View {
    let goals: UserGoals
    let currentMetric: BodyMetric?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Goals Progress")
                .font(.headline)
            
            VStack(spacing: 12) {
                if let targetWeight = goals.targetWeight,
                   let currentWeight = currentMetric?.weight {
                    GoalProgressRow(
                        title: "Weight",
                        current: currentWeight,
                        target: targetWeight,
                        unit: "lbs",
                        color: .blue
                    )
                }
                
                if let targetBodyFat = goals.targetBodyFat,
                   let currentBodyFat = currentMetric?.bodyFatPercentage {
                    GoalProgressRow(
                        title: "Body Fat",
                        current: currentBodyFat,
                        target: targetBodyFat,
                        unit: "%",
                        color: .orange
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct GoalProgressRow: View {
    let title: String
    let current: Double
    let target: Double
    let unit: String
    let color: Color
    
    var progress: Double {
        let diff = abs(target - current)
        let total = abs(target - current) + diff
        return total > 0 ? 1 - (diff / total) : 1
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.subheadline)
                Spacer()
                Text("\(String(format: "%.1f", current)) / \(String(format: "%.1f", target)) \(unit)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            ProgressView(value: progress)
                .tint(color)
        }
    }
}

// MARK: - User Goals Model
struct UserGoals: Codable {
    let targetWeight: Double?
    let targetBodyFat: Double?
    let targetDate: String?
}