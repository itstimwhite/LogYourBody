import { BodyMetrics } from '@/types/body-metrics';

export type TrendDirection = 'up' | 'down' | 'stable' | 'unknown';

export interface TrendInfo {
  direction: TrendDirection;
  percentage: number;
  difference: number;
}

/**
 * Calculate the trend between two metric values
 * @param current - Current value
 * @param previous - Previous value
 * @param threshold - Minimum percentage change to not be considered stable (default 1%)
 * @returns TrendInfo with direction, percentage change, and absolute difference
 */
export function calculateTrend(
  current: number | undefined,
  previous: number | undefined,
  threshold: number = 1
): TrendInfo {
  if (!current || !previous) {
    return {
      direction: 'unknown',
      percentage: 0,
      difference: 0
    };
  }

  const difference = current - previous;
  const percentage = (difference / previous) * 100;
  
  let direction: TrendDirection;
  if (Math.abs(percentage) < threshold) {
    direction = 'stable';
  } else if (difference > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  return {
    direction,
    percentage,
    difference
  };
}

/**
 * Get trend between two body metrics entries
 * @param current - Current metrics
 * @param previous - Previous metrics
 * @returns Object with trends for each metric
 */
export function getMetricsTrends(
  current: BodyMetrics | null,
  previous: BodyMetrics | null
) {
  return {
    weight: calculateTrend(current?.weight, previous?.weight, 0.5),
    bodyFat: calculateTrend(current?.body_fat_percentage, previous?.body_fat_percentage, 1),
    leanMass: calculateTrend(
      current?.weight && current?.body_fat_percentage 
        ? current.weight * (1 - current.body_fat_percentage / 100)
        : undefined,
      previous?.weight && previous?.body_fat_percentage
        ? previous.weight * (1 - previous.body_fat_percentage / 100)
        : undefined,
      0.5
    ),
    ffmi: calculateTrend(current?.ffmi, previous?.ffmi, 1)
  };
}

/**
 * Get trend arrow emoji based on direction
 * @param direction - Trend direction
 * @returns Appropriate arrow emoji or empty string
 */
export function getTrendArrow(direction: TrendDirection): string {
  switch (direction) {
    case 'up':
      return '↗️';
    case 'down':
      return '↘️';
    case 'stable':
      return '→';
    default:
      return '';
  }
}

/**
 * Get trend color class based on direction and metric type
 * @param direction - Trend direction
 * @param metricType - Type of metric (some metrics are better when down)
 * @returns Tailwind color class
 */
export function getTrendColorClass(
  direction: TrendDirection,
  metricType: 'weight' | 'bodyFat' | 'leanMass' | 'ffmi'
): string {
  if (direction === 'stable' || direction === 'unknown') {
    return 'text-linear-text-tertiary';
  }

  // For body fat, down is good (green), up is bad (red)
  if (metricType === 'bodyFat') {
    return direction === 'down' ? 'text-green-500' : 'text-red-500';
  }

  // For lean mass and FFMI, up is good (green), down is bad (red)
  if (metricType === 'leanMass' || metricType === 'ffmi') {
    return direction === 'up' ? 'text-green-500' : 'text-red-500';
  }

  // For weight, it depends on the user's goal (phase)
  // We'll use neutral colors for weight
  return direction === 'up' ? 'text-blue-500' : 'text-orange-500';
}