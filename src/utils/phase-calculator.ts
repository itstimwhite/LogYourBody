import { BodyMetrics } from '@/types/body-metrics';

export type Phase = 'cutting' | 'bulking' | 'maintaining' | 'insufficient-data';

export interface PhaseResult {
  phase: Phase;
  confidence: 'high' | 'medium' | 'low';
  weightChange: number; // Total weight change in the period
  weeklyRate: number; // Average weekly rate of change
  message: string;
}

/**
 * Calculates the user's current phase based on weight data from the last 3 weeks
 * @param metricsHistory - Array of body metrics, should be sorted by date (oldest to newest)
 * @param weightUnit - The unit of weight (lbs or kg)
 * @returns PhaseResult with the determined phase and related data
 */
export function calculatePhase(metricsHistory: BodyMetrics[], weightUnit: 'lbs' | 'kg' = 'lbs'): PhaseResult {
  // Get the last 3 weeks of data
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  
  const recentMetrics = metricsHistory.filter(m => new Date(m.date) >= threeWeeksAgo);
  
  // Need at least 3 data points to make a reasonable assessment
  if (recentMetrics.length < 3) {
    return {
      phase: 'insufficient-data',
      confidence: 'low',
      weightChange: 0,
      weeklyRate: 0,
      message: 'Need more data to determine phase'
    };
  }
  
  // Sort by date to ensure proper order
  const sortedMetrics = [...recentMetrics].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate weight change
  const startWeight = sortedMetrics[0].weight;
  const endWeight = sortedMetrics[sortedMetrics.length - 1].weight;
  
  // Check if we have valid weight data
  if (!startWeight || !endWeight) {
    return {
      phase: 'insufficient-data',
      confidence: 'low',
      weightChange: 0,
      weeklyRate: 0,
      message: 'Missing weight data'
    };
  }
  
  const weightChange = endWeight - startWeight;
  
  // Calculate time span in weeks
  const startDate = new Date(sortedMetrics[0].date);
  const endDate = new Date(sortedMetrics[sortedMetrics.length - 1].date);
  const weeksDiff = Math.max((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7), 1);
  
  // Calculate weekly rate of change
  const weeklyRate = weightChange / weeksDiff;
  
  // Convert to percentage of body weight for phase determination
  const percentageChange = (weightChange / startWeight) * 100;
  const weeklyPercentage = percentageChange / weeksDiff;
  
  // Determine confidence based on data points and consistency
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (recentMetrics.length >= 6) {
    confidence = 'high';
  } else if (recentMetrics.length >= 4) {
    confidence = 'medium';
  }
  
  // Thresholds for phase determination (in weekly percentage)
  const CUTTING_THRESHOLD = -0.5; // Losing more than 0.5% per week
  const BULKING_THRESHOLD = 0.25; // Gaining more than 0.25% per week
  const MAINTENANCE_RANGE = 0.1; // +/- 0.1% per week is maintenance
  
  let phase: Phase;
  let message: string;
  
  // Format weight change for display
  const formattedChange = `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} ${weightUnit}`;
  const formattedWeekly = `${weeklyRate > 0 ? '+' : ''}${weeklyRate.toFixed(1)} ${weightUnit}/week`;
  
  if (weeklyPercentage <= CUTTING_THRESHOLD) {
    phase = 'cutting';
    message = `Losing ${formattedWeekly}`;
  } else if (weeklyPercentage >= BULKING_THRESHOLD) {
    phase = 'bulking';
    message = `Gaining ${formattedWeekly}`;
  } else if (Math.abs(weeklyPercentage) <= MAINTENANCE_RANGE) {
    phase = 'maintaining';
    message = `Stable (${formattedChange} total)`;
  } else if (weeklyPercentage < 0) {
    // Slow cut
    phase = 'cutting';
    message = `Slow cut: ${formattedWeekly}`;
  } else {
    // Slow bulk
    phase = 'bulking';
    message = `Lean gaining: ${formattedWeekly}`;
  }
  
  return {
    phase,
    confidence,
    weightChange,
    weeklyRate,
    message
  };
}