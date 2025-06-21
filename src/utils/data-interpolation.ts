import { BodyMetrics, ProgressPhoto } from '@/types/body-metrics'
import { differenceInDays, parseISO } from 'date-fns'

export interface TimelineEntry {
  date: string
  metrics?: BodyMetrics
  photo?: ProgressPhoto
  inferredData?: {
    weight?: number
    bodyFatPercentage?: number
    leanBodyMass?: number
    ffmi?: number
    isInterpolated: boolean
    confidenceLevel: 'high' | 'medium' | 'low'
  }
}

/**
 * Interpolates a value between two data points based on date
 */
function interpolateValue(
  beforeValue: number,
  afterValue: number,
  beforeDate: Date,
  afterDate: Date,
  targetDate: Date
): number {
  const totalDays = differenceInDays(afterDate, beforeDate)
  const daysPassed = differenceInDays(targetDate, beforeDate)
  const ratio = daysPassed / totalDays
  return beforeValue + (afterValue - beforeValue) * ratio
}

/**
 * Finds the nearest metrics before and after a given date
 */
function findNearestMetrics(
  metrics: BodyMetrics[],
  targetDate: string
): { before?: BodyMetrics; after?: BodyMetrics } {
  const target = parseISO(targetDate)
  let before: BodyMetrics | undefined
  let after: BodyMetrics | undefined
  
  for (const metric of metrics) {
    const metricDate = parseISO(metric.date)
    
    if (metricDate <= target) {
      if (!before || parseISO(before.date) < metricDate) {
        before = metric
      }
    } else {
      if (!after || parseISO(after.date) > metricDate) {
        after = metric
      }
    }
  }
  
  return { before, after }
}

/**
 * Determines confidence level based on distance between data points
 */
function getConfidenceLevel(daysBetween: number): 'high' | 'medium' | 'low' {
  if (daysBetween <= 7) return 'high'
  if (daysBetween <= 14) return 'medium'
  return 'low'
}

/**
 * Creates inferred data for a date without measurements
 */
function createInferredData(
  targetDate: string,
  metrics: BodyMetrics[],
  userHeight?: number
): TimelineEntry['inferredData'] | undefined {
  const { before, after } = findNearestMetrics(metrics, targetDate)
  
  if (!before || !after) {
    return undefined
  }
  
  const beforeDate = parseISO(before.date)
  const afterDate = parseISO(after.date)
  const target = parseISO(targetDate)
  
  const daysBetween = differenceInDays(afterDate, beforeDate)
  
  // Only interpolate if data points are within 30 days
  if (daysBetween > 30) {
    return undefined
  }
  
  const inferredData: TimelineEntry['inferredData'] = {
    isInterpolated: true,
    confidenceLevel: getConfidenceLevel(daysBetween)
  }
  
  // Interpolate weight
  if (before.weight && after.weight) {
    inferredData.weight = interpolateValue(
      before.weight,
      after.weight,
      beforeDate,
      afterDate,
      target
    )
  }
  
  // Interpolate body fat percentage
  if (before.body_fat_percentage && after.body_fat_percentage) {
    inferredData.bodyFatPercentage = interpolateValue(
      before.body_fat_percentage,
      after.body_fat_percentage,
      beforeDate,
      afterDate,
      target
    )
  }
  
  // Calculate lean body mass if we have weight and body fat
  if (inferredData.weight && inferredData.bodyFatPercentage) {
    inferredData.leanBodyMass = inferredData.weight * (1 - inferredData.bodyFatPercentage / 100)
  }
  
  // Calculate FFMI if we have lean body mass and height
  if (inferredData.leanBodyMass && userHeight) {
    const heightInMeters = userHeight * 0.0254 // Convert inches to meters
    inferredData.ffmi = inferredData.leanBodyMass / (heightInMeters * heightInMeters)
  }
  
  return inferredData
}

/**
 * Combines metrics and photos into a unified timeline
 */
export function createTimelineData(
  metrics: BodyMetrics[],
  photos: ProgressPhoto[],
  userHeight?: number
): TimelineEntry[] {
  const timelineMap = new Map<string, TimelineEntry>()
  
  // Add all metrics to timeline
  metrics.forEach(metric => {
    timelineMap.set(metric.date, {
      date: metric.date,
      metrics: metric
    })
  })
  
  // Add photos to timeline
  photos.forEach(photo => {
    const entry = timelineMap.get(photo.date) || { date: photo.date }
    entry.photo = photo
    timelineMap.set(photo.date, entry)
  })
  
  // For entries with photos but no metrics, try to infer data
  timelineMap.forEach((entry, date) => {
    if (entry.photo && !entry.metrics && metrics.length > 0) {
      entry.inferredData = createInferredData(date, metrics, userHeight)
    }
  })
  
  // Convert to array and sort by date
  return Array.from(timelineMap.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  )
}

/**
 * Gets the display values for a timeline entry
 */
export function getTimelineDisplayValues(entry: TimelineEntry): {
  weight?: number
  bodyFatPercentage?: number
  leanBodyMass?: number
  ffmi?: number
  isInferred: boolean
  confidenceLevel?: 'high' | 'medium' | 'low'
} {
  if (entry.metrics) {
    return {
      weight: entry.metrics.weight,
      bodyFatPercentage: entry.metrics.body_fat_percentage,
      leanBodyMass: entry.metrics.lean_body_mass,
      ffmi: entry.metrics.ffmi,
      isInferred: false
    }
  }
  
  if (entry.inferredData) {
    return {
      weight: entry.inferredData.weight,
      bodyFatPercentage: entry.inferredData.bodyFatPercentage,
      leanBodyMass: entry.inferredData.leanBodyMass,
      ffmi: entry.inferredData.ffmi,
      isInferred: true,
      confidenceLevel: entry.inferredData.confidenceLevel
    }
  }
  
  return { isInferred: false }
}