//
//  DashboardView+Calculations.swift
//  LogYourBody
//
//  Calculation methods for DashboardView
//

import SwiftUI

extension DashboardView {
    // MARK: - Unit Conversion
    
    func convertWeight(_ weight: Double, from: String, to: String) -> Double {
        if from == to {
            return weight
        }
        
        let weightInKg = from == "lbs" ? weight * 0.453592 : weight
        return to == "lbs" ? weightInKg * 2.20462 : weightInKg
    }
    
    func formatHeightToFeetInches(_ heightCm: Double) -> String {
        let totalInches = heightCm / 2.54
        let feet = Int(totalInches / 12)
        let inches = Int(totalInches.truncatingRemainder(dividingBy: 12))
        return "\(feet)'\(inches)\""
    }
    
    // MARK: - Body Composition Calculations
    
    func calculateFFMI() -> Double? {
        guard let weight = currentMetric?.weight,
              let bodyFat = currentMetric?.bodyFatPercentage ?? 
              (selectedIndex < bodyMetrics.count 
                ? PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)?.value 
                : nil),
              let heightCm = authManager.currentUser?.profile?.height,
              heightCm > 0 else { return nil }
        
        let heightM = heightCm / 100.0
        let leanMass = weight * (1 - bodyFat / 100)
        let ffmi = leanMass / (heightM * heightM)
        
        return ffmi
    }
    
    func calculateLeanMass() -> Double? {
        guard let weight = currentMetric?.weight else { return nil }
        
        let bodyFat = currentMetric?.bodyFatPercentage ?? 
            (selectedIndex < bodyMetrics.count 
                ? PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)?.value 
                : nil)
        
        guard let bf = bodyFat else { return nil }
        
        return weight * (1 - bf / 100)
    }
    
    // MARK: - Color Calculations
    
    func getBodyFatColor(for value: Double, gender: String?) -> Color {
        let ranges: [(Double, Double)]
        
        if gender == "Male" {
            ranges = [(0, 6), (6, 13), (14, 17), (18, 24), (25, 100)]
        } else {
            ranges = [(0, 14), (14, 20), (21, 24), (25, 31), (32, 100)]
        }
        
        if value <= ranges[0].1 {
            return .blue // Essential fat
        } else if value <= ranges[1].1 {
            return .green // Athletes
        } else if value <= ranges[2].1 {
            return .green // Fitness
        } else if value <= ranges[3].1 {
            return .yellow // Average
        } else {
            return .red // Obese
        }
    }
    
    func isInHealthyWeightRange() -> Bool {
        guard let weight = currentMetric?.weight,
              let heightCm = authManager.currentUser?.profile?.height,
              heightCm > 0 else { return false }
        
        let heightM = heightCm / 100.0
        let bmi = weight / (heightM * heightM)
        
        return bmi >= 18.5 && bmi < 25
    }
    
    // MARK: - Optimal Range Calculations
    
    func getOptimalBodyFatRange() -> ClosedRange<Double> {
        let gender = authManager.currentUser?.profile?.gender
        if gender == "Male" {
            return 10...15
        } else {
            return 18...25
        }
    }
    
    func getOptimalFFMIRange() -> ClosedRange<Double> {
        let gender = authManager.currentUser?.profile?.gender
        if gender == "Male" {
            return 19...22
        } else {
            return 16...19
        }
    }
    
    func getOptimalWeightRange() -> ClosedRange<Double>? {
        guard let heightCm = authManager.currentUser?.profile?.height,
              heightCm > 0 else { return nil }
        
        let heightM = heightCm / 100.0
        let minWeight = 18.5 * heightM * heightM
        let maxWeight = 24.9 * heightM * heightM
        
        return minWeight...maxWeight
    }
    
    // MARK: - Trend Calculations
    
    func calculateBodyFatTrend() -> Double? {
        guard bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentDate = currentMetric?.date else { return nil }
        
        // Look for previous body fat measurement
        for i in stride(from: selectedIndex - 1, through: 0, by: -1) {
            if let previousBF = bodyMetrics[i].bodyFatPercentage,
               let currentBF = currentMetric?.bodyFatPercentage {
                
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentDate).day ?? 1
                
                // Calculate change per month (30 days)
                let change = currentBF - previousBF
                let changePerMonth = (change / Double(max(daysDiff, 1))) * 30
                
                // Only show trend if change is meaningful (> 0.2% per month)
                return abs(changePerMonth) > 0.2 ? changePerMonth : nil
            }
        }
        
        return nil
    }
    
    func calculateFFMITrend() -> Double? {
        guard bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentFFMI = calculateFFMI(),
              let currentDate = currentMetric?.date else { return nil }
        
        // Store the current selectedIndex temporarily
        let currentIndex = selectedIndex
        
        // Find previous FFMI
        for i in stride(from: currentIndex - 1, through: 0, by: -1) {
            // Temporarily set selectedIndex to calculate FFMI for previous date
            selectedIndex = i
            
            if let previousFFMI = calculateFFMI() {
                // Restore selectedIndex
                selectedIndex = currentIndex
                
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentDate).day ?? 1
                
                // Calculate change per month (30 days)
                let change = currentFFMI - previousFFMI
                let changePerMonth = (change / Double(max(daysDiff, 1))) * 30
                
                // Only show trend if change is meaningful (> 0.1 per month)
                return abs(changePerMonth) > 0.1 ? changePerMonth : nil
            }
        }
        
        // Restore selectedIndex
        selectedIndex = currentIndex
        return nil
    }
    
    func calculateWeightTrend() -> Double? {
        guard bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentWeight = currentMetric?.weight,
              let currentDate = currentMetric?.date else { return nil }
        
        // Look for previous weight measurement
        for i in stride(from: selectedIndex - 1, through: 0, by: -1) {
            if let previousWeight = bodyMetrics[i].weight {
                
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentDate).day ?? 1
                
                // Calculate change per month (30 days) in kg
                let change = currentWeight - previousWeight
                let changePerMonth = (change / Double(max(daysDiff, 1))) * 30
                
                // Only show trend if change is meaningful (> 0.2 kg per month)
                return abs(changePerMonth) > 0.2 ? changePerMonth : nil
            }
        }
        
        return nil
    }
    
    func calculateStepsTrend() -> Double? {
        guard let currentSteps = selectedDateMetrics?.steps,
              selectedIndex > 0 else { return nil }
        
        // Calculate 7-day average
        let calendar = Calendar.current
        let endDate = currentMetric?.date ?? Date()
        let startDate = calendar.date(byAdding: .day, value: -7, to: endDate) ?? endDate
        
        if let userId = authManager.currentUser?.id {
            var dailyMetrics: [CachedDailyMetrics] = []
            var currentDate = startDate
            while currentDate <= endDate {
                if let metrics = CoreDataManager.shared.fetchDailyMetrics(for: userId, date: currentDate) {
                    dailyMetrics.append(metrics)
                }
                currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
            }
            
            let stepCounts = dailyMetrics.compactMap { $0.steps }.map { Int($0) }
            guard !stepCounts.isEmpty else { return nil }
            
            let average = Double(stepCounts.reduce(0, +)) / Double(stepCounts.count)
            let trend = Double(currentSteps) - average
            
            // Only show trend if difference is > 500 steps
            return abs(trend) > 500 ? trend : nil
        }
        
        return nil
    }
    
    func calculateLeanMassTrend() -> Double? {
        guard let currentLeanMass = calculateLeanMass(),
              bodyMetrics.count > 1,
              selectedIndex > 0,
              let currentDate = currentMetric?.date else { return nil }
        
        // Store the current selectedIndex temporarily
        let currentIndex = selectedIndex
        
        // Find previous metric with enough data
        for i in stride(from: currentIndex - 1, through: 0, by: -1) {
            // Temporarily set selectedIndex to calculate lean mass for previous date
            selectedIndex = i
            
            if let previousLeanMass = calculateLeanMass() {
                // Restore selectedIndex
                selectedIndex = currentIndex
                
                let daysDiff = Calendar.current.dateComponents([.day], 
                    from: bodyMetrics[i].date, 
                    to: currentDate).day ?? 1
                
                // Calculate change per month (30 days)
                let change = currentLeanMass - previousLeanMass
                let changePerMonth = (change / Double(max(daysDiff, 1))) * 30
                
                // Only show trend if change is meaningful (> 0.2 kg per month)
                return abs(changePerMonth) > 0.2 ? changePerMonth : nil
            }
        }
        
        // Restore selectedIndex
        selectedIndex = currentIndex
        return nil
    }
}