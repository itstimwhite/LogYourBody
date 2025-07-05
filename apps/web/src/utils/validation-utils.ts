/**
 * Validation utilities for ensuring data meets database constraints
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate height based on database constraints
 * Height should be between 30cm (1ft) and 244cm (8ft)
 */
export function validateHeight(height: number | undefined, unit: 'cm' | 'ft'): ValidationResult {
  if (!height) return { valid: true }
  
  if (unit === 'cm') {
    if (height < 30 || height > 244) {
      return { valid: false, error: 'Height must be between 30cm and 244cm' }
    }
  } else if (unit === 'ft') {
    // For 'ft' unit, height is stored in inches
    if (height < 12 || height > 96) {
      return { valid: false, error: 'Height must be between 1ft and 8ft' }
    }
  }
  
  return { valid: true }
}

/**
 * Validate weight based on database constraints
 * Weight should be between 11.3kg (25lbs) and 453.6kg (1000lbs)
 */
export function validateWeight(weight: number | undefined, unit: 'kg' | 'lbs'): ValidationResult {
  if (!weight) return { valid: true }
  
  if (unit === 'kg') {
    if (weight < 11.3 || weight > 453.6) {
      return { valid: false, error: 'Weight must be between 11.3kg and 453.6kg' }
    }
  } else if (unit === 'lbs') {
    if (weight < 25 || weight > 1000) {
      return { valid: false, error: 'Weight must be between 25lbs and 1000lbs' }
    }
  }
  
  return { valid: true }
}

/**
 * Validate body fat percentage
 * Should be between 0% and 70%
 */
export function validateBodyFatPercentage(percentage: number | undefined): ValidationResult {
  if (!percentage) return { valid: true }
  
  if (percentage < 0 || percentage > 70) {
    return { valid: false, error: 'Body fat percentage must be between 0% and 70%' }
  }
  
  return { valid: true }
}

/**
 * Validate waist measurement
 * Should be between 40cm-200cm or 16in-80in
 */
export function validateWaistMeasurement(measurement: number | undefined, unit: 'cm' | 'in'): ValidationResult {
  if (!measurement) return { valid: true }
  
  if (unit === 'cm') {
    if (measurement < 40 || measurement > 200) {
      return { valid: false, error: 'Waist measurement must be between 40cm and 200cm' }
    }
  } else if (unit === 'in') {
    if (measurement < 16 || measurement > 80) {
      return { valid: false, error: 'Waist measurement must be between 16in and 80in' }
    }
  }
  
  return { valid: true }
}

/**
 * Validate hip measurement
 * Should be between 50cm-200cm or 20in-80in
 */
export function validateHipMeasurement(measurement: number | undefined, unit: 'cm' | 'in'): ValidationResult {
  if (!measurement) return { valid: true }
  
  if (unit === 'cm') {
    if (measurement < 50 || measurement > 200) {
      return { valid: false, error: 'Hip measurement must be between 50cm and 200cm' }
    }
  } else if (unit === 'in') {
    if (measurement < 20 || measurement > 80) {
      return { valid: false, error: 'Hip measurement must be between 20in and 80in' }
    }
  }
  
  return { valid: true }
}

/**
 * Validate FFMI (Fat-Free Mass Index)
 * Should be between 10 and 30 for natural athletes
 */
export function validateFFMI(ffmi: number | undefined): ValidationResult {
  if (!ffmi) return { valid: true }
  
  if (ffmi < 10 || ffmi > 30) {
    return { valid: false, error: 'FFMI must be between 10 and 30' }
  }
  
  return { valid: true }
}

/**
 * Validate muscle mass
 * Should be less than total body weight
 */
export function validateMuscleMass(muscleMass: number | undefined, totalWeight: number | undefined): ValidationResult {
  if (!muscleMass || !totalWeight) return { valid: true }
  
  if (muscleMass >= totalWeight) {
    return { valid: false, error: 'Muscle mass must be less than total body weight' }
  }
  
  return { valid: true }
}

/**
 * Validate waist-to-hip ratio
 * Should be between 0.4 and 1.5
 */
export function validateWaistToHipRatio(ratio: number | undefined): ValidationResult {
  if (!ratio) return { valid: true }
  
  if (ratio < 0.4 || ratio > 1.5) {
    return { valid: false, error: 'Waist-to-hip ratio must be between 0.4 and 1.5' }
  }
  
  return { valid: true }
}

/**
 * Validate waist-to-height ratio
 * Should be between 0.3 and 0.8
 */
export function validateWaistToHeightRatio(ratio: number | undefined): ValidationResult {
  if (!ratio) return { valid: true }
  
  if (ratio < 0.3 || ratio > 0.8) {
    return { valid: false, error: 'Waist-to-height ratio must be between 0.3 and 0.8' }
  }
  
  return { valid: true }
}

/**
 * Validate date of birth
 * Should result in an age between 13 and 120 years
 */
export function validateDateOfBirth(dateOfBirth: string | undefined): ValidationResult {
  if (!dateOfBirth) return { valid: true }
  
  try {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    let actualAge = age
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge--
    }
    
    if (actualAge < 13) {
      return { valid: false, error: 'You must be at least 13 years old' }
    }
    
    if (actualAge > 120) {
      return { valid: false, error: 'Please enter a valid date of birth' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Please enter a valid date' }
  }
}