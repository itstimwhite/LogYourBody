//
// DashboardView+Views.swift
// LogYourBody
//
// View components for DashboardView
// import SwiftUI
import HealthKit
import PhotosUI

extension DashboardView {
    // MARK: - Main Content Views
    
    @ViewBuilder
    var loadingView: some View {
        // Use skeleton loader instead of empty state for smoother experience
        DashboardSkeleton()
    }
    
    @ViewBuilder
    var emptyStateView: some View {
        DashboardEmptyStateView(
            icon: "chart.line.downtrend.xyaxis",
            title: "No data yet",
            message: "Log your first measurement to get started"
        )
    }
    
    @ViewBuilder
    var contentView: some View {
        // Always show skeleton on first load to prevent layout shift
        if bodyMetrics.isEmpty && !hasLoadedInitialData {
            loadingView
        } else if bodyMetrics.isEmpty {
            emptyStateView
        } else {
            mainContentView
                .modifier(SmartBlurModifier(isPresented: showPhotoOptions || showCamera || showPhotoPicker || showingModal, radius: 8))
        }
    }
    
    @ViewBuilder
    var mainContentView: some View {
        VStack(spacing: 0) {
            // Progress Photo - will expand to fill available space
            progressPhotoView
                .frame(maxHeight: .infinity)
            
            // Fixed height content at bottom
            VStack(spacing: 16) {
                // Timeline Slider with visual polish - full width
                if bodyMetrics.count > 1 {
                    VStack(spacing: 0) {
                        timelineSlider
                            .padding(.horizontal, 20) // Inner padding
                    }
                    .padding(.vertical, 12)
                    .background(Color.appCard.opacity(0.5))
                    // No horizontal padding here - full width
                }
                
                // Core Metrics Row
                coreMetricsRow
                
                // Secondary Metrics Row - Compact Cards
                secondaryMetricsRow
                
                // Bottom padding for floating tab bar
                Color.clear.frame(height: 90)
            }
        }
        .refreshable {
            await refreshData()
        }
    }
    
    // MARK: - Header View
    
    @ViewBuilder
    var headerView: some View {
        DashboardHeaderBar(
            title: "",
            showLiquidGlass: true,
            leading: {
                HStack(spacing: 12) {
                    // Avatar
                    if let avatarUrl = authManager.currentUser?.avatarUrl,
                       let url = URL(string: avatarUrl) {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 32, height: 32)
                                .clipShape(Circle())
                        } placeholder: {
                            Circle()
                                .fill(Color.appTextTertiary)
                                .frame(width: 32, height: 32)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 16))
                                        .foregroundColor(.appBackground)
                                )
                        }
                    } else {
                        Circle()
                            .fill(Color.appPrimary)
                            .frame(width: 32, height: 32)
                            .overlay(
                                Text(authManager.currentUser?.profile?.fullName?.prefix(1).uppercased() ?? "U")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            )
                    }
                    
                    // Greeting
                    VStack(alignment: .leading, spacing: 2) {
                        Text(greeting)
                            .font(.system(size: 12))
                            .foregroundColor(.appTextSecondary)
                        
                        if let firstName = authManager.currentUser?.profile?.fullName?.components(separatedBy: " ").first {
                            Text(firstName)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.appText)
                        }
                    }
                }
            },
            trailing: {
                HStack(spacing: 16) {
                    // Steps indicator
                    if let steps = dailyMetrics?.steps {
                        HStack(spacing: 4) {
                            Image(systemName: "figure.walk")
                                .font(.system(size: 14))
                                .foregroundColor(.appTextSecondary)
                            Text(formatStepCount(steps))
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.appText)
                        }
                    }
                    
                    // Sync indicator
                    if syncManager.isSyncing {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .appTextSecondary))
                            .scaleEffect(0.8)
                    }
                }
            }
        )
    }
    
    // MARK: - Progress Photo View
    
    @ViewBuilder
    var progressPhotoView: some View {
        ZStack {
            // Use the new carousel with fixed aspect ratio
            ProgressPhotoCarouselView(
                currentMetric: currentMetric,
                historicalMetrics: bodyMetrics,
                selectedMetricsIndex: $selectedIndex
            )
            
            // Camera button overlay - always present but changes based on photo existence
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    
                    Button(action: {
                        showPhotoOptions = true
                    }) {
                        if currentMetric?.photoUrl == nil || currentMetric?.photoUrl?.isEmpty == true {
                            // Full button when no photo
                            HStack {
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 14, weight: .medium))
                                Text("Add Photo")
                                    .font(.system(size: 14, weight: .medium))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(
                                Capsule()
                                    .fill(Color.appPrimary)
                            )
                        } else {
                            // Just icon when photo exists
                            Image(systemName: "camera.fill")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                                .frame(width: 36, height: 36)
                                .background(
                                    Circle()
                                        .fill(Color.black.opacity(0.5))
                                )
                        }
                    }
                    .padding(.trailing, 20)
                    .padding(.bottom, 12)
                }
            }
        }
    }
    
    // MARK: - Core Metrics Row
    
    @ViewBuilder
    var coreMetricsRow: some View {
        HStack(spacing: 16) {  // Consistent spacing
            // Body Fat % with simplified progress bar
            let estimatedBF = currentMetric?.bodyFatPercentage == nil && selectedIndex < bodyMetrics.count
                ? PhotoMetadataService.shared.estimateBodyFat(for: bodyMetrics[selectedIndex].date, metrics: bodyMetrics)
                : nil
            
            let bodyFatValue = currentMetric?.bodyFatPercentage ?? estimatedBF?.value
            let bodyFatTrend = calculateBodyFatTrend()
            
            VStack(spacing: 0) {
                if let bf = bodyFatValue {
                    MetricValueDisplay(
                        value: bf,
                        unit: "%",
                        label: "Body Fat",
                        trend: bodyFatTrend,
                        trendType: .negative
                    )
                } else {
                    EmptyMetricPlaceholder(label: "Body Fat", unit: "%")
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 100) // Fixed height - reduced from 120
            .background(Color.appCard)
            .cornerRadius(12)
            
            // Weight with trend indicator
            let weightValue = currentMetric?.weight != nil
                ? convertWeight(currentMetric!.weight!, from: "kg", to: currentSystem.weightUnit)
                : nil
            let weightTrend = calculateWeightTrend()
            let weightTrendConverted = weightTrend != nil
                ? convertWeight(weightTrend!, from: "kg", to: currentSystem.weightUnit)
                : nil
            
            VStack(spacing: 0) {
                if let weight = weightValue {
                    MetricValueDisplay(
                        value: weight,
                        unit: currentSystem.weightUnit,
                        label: "Weight",
                        trend: weightTrendConverted,
                        trendType: .neutral
                    )
                } else {
                    EmptyMetricPlaceholder(label: "Weight", unit: currentSystem.weightUnit)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 100) // Fixed height - reduced from 120
            .background(Color.appCard)
            .cornerRadius(12)
        }
        .padding(.horizontal, 20)
    }
    
    // MARK: - Secondary Metrics Row
    
    @ViewBuilder
    var secondaryMetricsRow: some View {
        HStack(spacing: 12) {
            // Steps Card
            let stepsTrend = calculateStepsTrend()
            CompactMetricCard(
                icon: "figure.walk",
                value: selectedDateMetrics?.steps.map { formatStepCount($0) } ?? "––",
                label: "Steps",
                trend: stepsTrend,
                trendType: .positive
            )
            
            // FFMI Card
            let ffmiValue = calculateFFMI()
            let ffmiTrend = calculateFFMITrend()
            CompactMetricCard(
                icon: "figure.arms.open",
                value: ffmiValue != nil ? String(format: "%.1f", ffmiValue!) : "––",
                label: "FFMI",
                trend: ffmiTrend,
                trendType: .positive
            )
            
            // Lean Mass Card - Show in user's preferred unit
            let leanMass = calculateLeanMass()
            let leanMassConverted = leanMass != nil ? convertWeight(leanMass!, from: "kg", to: currentSystem.weightUnit) : nil
            let leanMassTrend = calculateLeanMassTrend()
            let leanMassTrendConverted = leanMassTrend != nil ? convertWeight(leanMassTrend!, from: "kg", to: currentSystem.weightUnit) : nil
            
            CompactMetricCard(
                icon: "figure.arms.open",
                value: leanMassConverted != nil ? "\(Int(leanMassConverted!))" : "––",
                label: "Lean \(currentSystem.weightUnit)",
                trend: leanMassTrendConverted,
                trendType: .positive
            )
        }
        .padding(.horizontal, 20)
    }
    
    // MARK: - Timeline Slider
    
    @ViewBuilder
    var timelineSlider: some View {
        // Use PhotoAnchoredTimelineSlider which already includes navigation buttons and date display
        PhotoAnchoredTimelineSlider(
            metrics: bodyMetrics,
            selectedIndex: $selectedIndex,
            accentColor: .appPrimary
        )
    }
}
