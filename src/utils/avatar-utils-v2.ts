/**
 * Avatar utility functions for FFMI-based avatar system
 * Version 2: Supports both body fat percentage and FFMI
 */

export type AvatarFormat = 'svg' | 'png'
export type Gender = 'male' | 'female'

export interface AvatarOptionsV2 {
  gender: Gender
  bodyFatPercentage: number
  ffmi: number
  format?: AvatarFormat
  useNewAvatars?: boolean
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
 * Get the appropriate FFMI bracket for avatar selection
 * FFMI brackets: 15, 17.5, 20, 22.5, 25
 */
export function getFFMIBracket(ffmi: number): number {
  const brackets = [15, 17.5, 20, 22.5, 25]
  
  // Find the closest bracket
  let closest = brackets[0]
  let minDiff = Math.abs(ffmi - brackets[0])
  
  for (const bracket of brackets) {
    const diff = Math.abs(ffmi - bracket)
    if (diff < minDiff) {
      minDiff = diff
      closest = bracket
    }
  }
  
  return closest
}

/**
 * Generate the avatar filename for the new FFMI-based system
 */
export function getAvatarFilenameV2(options: AvatarOptionsV2): string {
  const { gender, bodyFatPercentage, ffmi, format = 'png' } = options
  const bfBracket = getBodyFatBracket(bodyFatPercentage)
  const ffmiBracket = getFFMIBracket(ffmi)
  const ffmiStr = ffmiBracket.toString().replace('.', '_')
  
  return `${gender}_ffmi${ffmiStr}_bf${bfBracket}.${format}`
}

/**
 * Get the avatar URL for the new FFMI-based system
 */
export function getAvatarUrlV2(
  gender?: string,
  bodyFatPercentage?: number,
  ffmi?: number,
  format: AvatarFormat = 'png'
): string | null {
  if (!gender || bodyFatPercentage === undefined || ffmi === undefined) return null
  if (gender !== 'male' && gender !== 'female') return null
  
  const filename = getAvatarFilenameV2({ 
    gender: gender as Gender, 
    bodyFatPercentage, 
    ffmi,
    format 
  })
  
  return `/avatars-new/${gender}/ffmi${getFFMIBracket(ffmi).toString().replace('.', '_')}/${filename}`
}

/**
 * Get the appropriate avatar URL, with fallback to old system
 */
export function getSmartAvatarUrl(
  gender?: string,
  bodyFatPercentage?: number,
  ffmi?: number,
  format: AvatarFormat = 'png'
): string | null {
  // Try new FFMI-based avatars first
  if (ffmi !== undefined) {
    const newUrl = getAvatarUrlV2(gender, bodyFatPercentage, ffmi, format)
    if (newUrl) return newUrl
  }
  
  // Fallback to old body-fat-only avatars
  if (!gender || bodyFatPercentage === undefined) return null
  if (gender !== 'male' && gender !== 'female') return null
  
  const bracket = getBodyFatBracket(bodyFatPercentage)
  const prefix = gender === 'male' ? 'm' : 'f'
  return `/avatars/${prefix}_bf${bracket}.${format}`
}

/**
 * Get avatar description for accessibility
 */
export function getAvatarAltTextV2(gender?: string, bodyFatPercentage?: number, ffmi?: number): string {
  if (!gender || bodyFatPercentage === undefined) {
    return 'Body silhouette'
  }
  
  const bfBracket = getBodyFatBracket(bodyFatPercentage)
  const genderText = gender === 'male' ? 'Male' : 'Female'
  
  if (ffmi !== undefined) {
    const ffmiBracket = getFFMIBracket(ffmi)
    return `${genderText} body silhouette at ${bfBracket}% body fat with ${ffmiBracket} FFMI`
  }
  
  return `${genderText} body silhouette at ${bfBracket}% body fat`
}

/**
 * Calculate recommended FFMI brackets based on gender
 * These are typical ranges for natural athletes
 */
export function getRecommendedFFMIRange(gender: Gender): { min: number, max: number, typical: number } {
  if (gender === 'male') {
    return { min: 17.5, max: 25, typical: 20 }
  } else {
    return { min: 15, max: 22.5, typical: 17.5 }
  }
}