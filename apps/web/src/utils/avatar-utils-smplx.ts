// Configuration for avatar sources
export const AVATAR_CONFIG = {
  USE_SMPLX: false, // Set to true when SMPL-X avatars are generated
  SMPLX_BASE_PATH: '/avatars-smplx',
  EXISTING_BASE_PATH: '/avatars',
  DEMO_BASE_PATH: '/avatars-wireframe-demo',
  USE_DEMO: false // Set to true to use demo wireframes
}

// Get closest FFMI bracket for SMPL-X avatars
function getClosestFFMI(ffmi: number): number {
  const ffmiBrackets = [15, 17.5, 20, 22.5, 25]
  return ffmiBrackets.reduce((prev, curr) => 
    Math.abs(curr - ffmi) < Math.abs(prev - ffmi) ? curr : prev
  )
}

// Get body fat bracket (same as before)
function getBodyFatBracket(bodyFat: number): number {
  const bfBrackets = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  return bfBrackets.reduce((prev, curr) => 
    Math.abs(curr - bodyFat) < Math.abs(prev - bodyFat) ? curr : prev
  )
}

/**
 * Get avatar URL based on gender, body fat percentage, and optionally FFMI
 * @param gender - 'male' or 'female'
 * @param bodyFatPercentage - Body fat percentage (0-100)
 * @param ffmi - Optional Fat-Free Mass Index for SMPL-X avatars
 * @returns Avatar URL
 */
export function getAvatarUrl(
  gender: 'male' | 'female' | undefined,
  bodyFatPercentage?: number,
  ffmi?: number
): string {
  // Default values
  const defaultGender = 'male'
  const defaultBodyFat = 20
  const defaultFFMI = 20

  // Normalize inputs
  const normalizedGender = gender || defaultGender
  const normalizedBodyFat = bodyFatPercentage ?? defaultBodyFat
  const normalizedFFMI = ffmi ?? defaultFFMI

  // If SMPL-X avatars are available and FFMI is provided
  if (AVATAR_CONFIG.USE_SMPLX && ffmi !== undefined) {
    const bfBracket = getBodyFatBracket(normalizedBodyFat)
    const ffmiBracket = getClosestFFMI(normalizedFFMI)
    
    // Format: /avatars-smplx/male/ffmi20/male_ffmi20_bf15.png
    const ffmiStr = String(ffmiBracket).replace('.', '_')
    const filename = `${normalizedGender}_ffmi${ffmiStr}_bf${bfBracket}.png`
    
    return `${AVATAR_CONFIG.SMPLX_BASE_PATH}/${normalizedGender}/ffmi${ffmiStr}/${filename}`
  }

  // Fallback to existing avatar system
  const bfBracket = getBodyFatBracket(normalizedBodyFat)
  const prefix = normalizedGender === 'male' ? 'm' : 'f'
  
  return `${AVATAR_CONFIG.EXISTING_BASE_PATH}/${prefix}_bf${bfBracket}.png`
}

/**
 * Check if SMPL-X avatars are available
 * This can be called on app initialization to auto-detect SMPL-X avatars
 */
export async function checkSMPLXAvailability(): Promise<boolean> {
  try {
    // Try to fetch the SMPL-X manifest
    const response = await fetch(`${AVATAR_CONFIG.SMPLX_BASE_PATH}/avatar-manifest.json`)
    if (response.ok) {
      const manifest = await response.json()
      return manifest.avatars !== undefined
    }
  } catch {
    console.log('SMPL-X avatars not available, using pravatar system')
  }
  return false
}

/**
 * Initialize avatar system - call this on app startup
 */
export async function initializeAvatarSystem(): Promise<void> {
  const smplxAvailable = await checkSMPLXAvailability()
  AVATAR_CONFIG.USE_SMPLX = smplxAvailable
  
  console.log(`Avatar system initialized: ${smplxAvailable ? 'SMPL-X' : 'Pravatar'}`)
}