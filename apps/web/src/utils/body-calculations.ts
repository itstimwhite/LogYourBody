import { BodyFatResult, FFMIResult } from '@/types/body-metrics'

// Navy Method Body Fat Calculation
export function calculateNavyBodyFat(
  gender: 'male' | 'female',
  waist: number, // cm
  neck: number, // cm
  height: number, // cm
  hip?: number // cm, required for females
): number {
  if (gender === 'female' && !hip) {
    throw new Error('Hip measurement required for female Navy method')
  }

  let bodyFat: number
  
  if (gender === 'male') {
    // Male formula: 86.010×log10(waist-neck) - 70.041×log10(height) + 36.76
    bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76
  } else {
    // Female formula: 163.205×log10(waist+hip-neck) - 97.684×log10(height) - 78.387
    bodyFat = 163.205 * Math.log10(waist + hip! - neck) - 97.684 * Math.log10(height) - 78.387
  }
  
  return Math.max(0, Math.min(50, bodyFat)) // Clamp between 0-50%
}

// 3-Site Skinfold Method (Jackson-Pollock)
export function calculate3SiteBodyFat(
  gender: 'male' | 'female',
  age: number,
  chest?: number, // mm, male
  abdominal?: number, // mm, male
  thigh?: number, // mm, both
  tricep?: number, // mm, female
  suprailiac?: number // mm, female
): number {
  let sumOfSkinfolds: number
  
  if (gender === 'male') {
    if (!chest || !abdominal || !thigh) {
      throw new Error('Chest, abdominal, and thigh measurements required for male 3-site method')
    }
    sumOfSkinfolds = chest + abdominal + thigh
  } else {
    if (!tricep || !suprailiac || !thigh) {
      throw new Error('Tricep, suprailiac, and thigh measurements required for female 3-site method')
    }
    sumOfSkinfolds = tricep + suprailiac + thigh
  }
  
  // Calculate body density
  let bodyDensity: number
  if (gender === 'male') {
    bodyDensity = 1.10938 - 0.0008267 * sumOfSkinfolds + 0.0000016 * sumOfSkinfolds * sumOfSkinfolds - 0.0002574 * age
  } else {
    bodyDensity = 1.0994921 - 0.0009929 * sumOfSkinfolds + 0.0000023 * sumOfSkinfolds * sumOfSkinfolds - 0.0001392 * age
  }
  
  // Siri equation: BF% = (495/BD) - 450
  const bodyFat = (495 / bodyDensity) - 450
  
  return Math.max(0, Math.min(50, bodyFat))
}

// 7-Site Skinfold Method
export function calculate7SiteBodyFat(
  gender: 'male' | 'female',
  age: number,
  chest: number, // mm
  midaxillary: number, // mm
  tricep: number, // mm
  subscapular: number, // mm
  abdominal: number, // mm
  suprailiac: number, // mm
  thigh: number // mm
): number {
  const sumOfSkinfolds = chest + midaxillary + tricep + subscapular + abdominal + suprailiac + thigh
  
  // Calculate body density
  let bodyDensity: number
  if (gender === 'male') {
    bodyDensity = 1.112 - 0.00043499 * sumOfSkinfolds + 0.00000055 * sumOfSkinfolds * sumOfSkinfolds - 0.00028826 * age
  } else {
    bodyDensity = 1.097 - 0.00046971 * sumOfSkinfolds + 0.00000056 * sumOfSkinfolds * sumOfSkinfolds - 0.00012828 * age
  }
  
  // Siri equation
  const bodyFat = (495 / bodyDensity) - 450
  
  return Math.max(0, Math.min(50, bodyFat))
}

// Calculate FFMI (Fat-Free Mass Index)
export function calculateFFMI(
  weight: number, // kg
  height: number, // cm
  bodyFatPercentage: number
): FFMIResult {
  const heightInMeters = height / 100
  const fatFreeMass = weight * (1 - bodyFatPercentage / 100)
  const ffmi = fatFreeMass / (heightInMeters * heightInMeters)
  
  // Normalized FFMI (adjusted to 1.8m height)
  const normalizedFFMI = ffmi + 6.1 * (1.8 - heightInMeters)
  
  // Interpretation based on normalized FFMI
  let interpretation: FFMIResult['interpretation']
  if (normalizedFFMI < 18) {
    interpretation = 'below_average'
  } else if (normalizedFFMI < 20) {
    interpretation = 'average'
  } else if (normalizedFFMI < 22) {
    interpretation = 'above_average'
  } else if (normalizedFFMI < 23.5) {
    interpretation = 'excellent'
  } else if (normalizedFFMI < 25) {
    interpretation = 'superior'
  } else {
    interpretation = 'suspiciously_high'
  }
  
  return {
    ffmi: Math.round(ffmi * 10) / 10,
    normalized_ffmi: Math.round(normalizedFFMI * 10) / 10,
    fat_free_mass: Math.round(fatFreeMass * 10) / 10,
    interpretation
  }
}

// Get body fat category
export function getBodyFatCategory(
  bodyFatPercentage: number,
  gender: 'male' | 'female'
): BodyFatResult['category'] {
  if (gender === 'male') {
    if (bodyFatPercentage < 6) return 'essential'
    if (bodyFatPercentage < 14) return 'athletic'
    if (bodyFatPercentage < 18) return 'fit'
    if (bodyFatPercentage < 25) return 'average'
    if (bodyFatPercentage < 31) return 'above_average'
    return 'obese'
  } else {
    if (bodyFatPercentage < 14) return 'essential'
    if (bodyFatPercentage < 21) return 'athletic'
    if (bodyFatPercentage < 25) return 'fit'
    if (bodyFatPercentage < 32) return 'average'
    if (bodyFatPercentage < 39) return 'above_average'
    return 'obese'
  }
}

// Calculate complete body composition
export function calculateBodyComposition(
  weight: number, // kg
  bodyFatPercentage: number
): BodyFatResult {
  const fatMass = weight * (bodyFatPercentage / 100)
  const leanMass = weight - fatMass
  
  return {
    percentage: Math.round(bodyFatPercentage * 10) / 10,
    lean_mass: Math.round(leanMass * 10) / 10,
    fat_mass: Math.round(fatMass * 10) / 10,
    category: 'average' // This would be set based on gender
  }
}

// Unit conversion helpers
export const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
  if (from === to) return value
  if (from === 'kg' && to === 'lbs') return value * 2.20462
  return value / 2.20462
}

export const convertHeight = (value: number, from: 'cm' | 'ft', to: 'cm' | 'ft'): number => {
  if (from === to) return value
  if (from === 'cm' && to === 'ft') return value / 30.48
  return value * 30.48
}

export const convertMeasurement = (value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number => {
  if (from === to) return value
  if (from === 'cm' && to === 'in') return value / 2.54
  return value * 2.54
}