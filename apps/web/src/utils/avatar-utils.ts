/**
 * Avatar utility functions for generating avatar URLs based on body fat percentage
 */

export type AvatarFormat = 'svg' | 'png'
export type Gender = 'male' | 'female'

export interface AvatarOptions {
  gender: Gender
  bodyFatPercentage: number
  format?: AvatarFormat
}

/**
 * Get the appropriate body fat bracket for avatar selection
 * Avatars are available in 5% increments from 5% to 50%
 */
export function getBodyFatBracket(bodyFatPercentage: number): number {
  // Clamp between 5 and 50
  const clamped = Math.max(5, Math.min(50, bodyFatPercentage))
  
  // Round to nearest 5
  return Math.round(clamped / 5) * 5
}

/**
 * Generate the avatar filename based on gender and body fat percentage
 */
export function getAvatarFilename(options: AvatarOptions): string {
  const { gender, bodyFatPercentage, format = 'svg' } = options
  const bracket = getBodyFatBracket(bodyFatPercentage)
  const prefix = gender === 'male' ? 'm' : 'f'
  
  return `${prefix}_bf${bracket}.${format}`
}

/**
 * Get the avatar URL for a specific gender and body fat percentage
 * This is the main function used throughout the app
 */
export function getAvatarUrl(
  gender?: string,
  bodyFatPercentage?: number,
  format: AvatarFormat = 'svg'
): string | null {
  if (!gender || bodyFatPercentage === undefined || bodyFatPercentage === null) return null
  if (gender !== 'male' && gender !== 'female') return null
  
  const filename = getAvatarFilename({ 
    gender: gender as Gender, 
    bodyFatPercentage, 
    format 
  })
  return `/avatars/${filename}`
}

/**
 * Get a fallback avatar URL based on gender
 */
export function getFallbackAvatarUrl(gender: Gender, format: AvatarFormat = 'svg'): string {
  // Use 20% body fat as a reasonable default
  return getAvatarUrl(gender, 20, format) || `/avatars/${gender === 'male' ? 'm' : 'f'}_bf20.${format}`
}

/**
 * Check if an avatar exists for the given body fat percentage
 */
export function hasAvatar(bodyFatPercentage: number): boolean {
  const bracket = getBodyFatBracket(bodyFatPercentage)
  return bracket >= 5 && bracket <= 50 && bracket % 5 === 0
}

/**
 * Get avatar description for accessibility
 */
export function getAvatarAltText(gender?: string, bodyFatPercentage?: number): string {
  if (!gender || bodyFatPercentage === undefined || bodyFatPercentage === null) {
    return 'Body silhouette'
  }
  
  const bracket = getBodyFatBracket(bodyFatPercentage)
  const genderText = gender === 'male' ? 'Male' : 'Female'
  return `${genderText} body silhouette at ${bracket}% body fat`
}