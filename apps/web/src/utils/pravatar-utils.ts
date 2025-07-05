/**
 * Pravatar utility functions for generating avatar URLs
 * Pravatar.cc provides CC0 placeholder avatars that are free to use
 */

export interface PravatarOptions {
  size?: number // Max 1000
  identifier?: string // Email or unique ID for consistent avatars
  imageId?: number // Specific image ID (1-70)
}

/**
 * Generate a Pravatar URL based on options
 * @param options - Configuration for the avatar
 * @returns Pravatar URL
 */
export function getPravatarUrl(options: PravatarOptions = {}): string {
  const { size = 150, identifier, imageId } = options
  
  // Ensure size doesn't exceed maximum
  const clampedSize = Math.min(size, 1000)
  
  let url = `https://i.pravatar.cc/${clampedSize}`
  
  const params: string[] = []
  
  // Add specific image ID if provided
  if (imageId !== undefined) {
    params.push(`img=${imageId}`)
  }
  
  // Add identifier for consistent avatar
  if (identifier) {
    params.push(`u=${encodeURIComponent(identifier)}`)
  }
  
  // Append parameters if any
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  
  return url
}

/**
 * Generate a consistent avatar URL for a user
 * @param userIdentifier - User email or ID
 * @param size - Avatar size (default 150, max 1000)
 * @returns Pravatar URL
 */
export function getUserAvatarUrl(userIdentifier: string, size: number = 150): string {
  return getPravatarUrl({ identifier: userIdentifier, size })
}

/**
 * Generate a random avatar URL
 * @param size - Avatar size (default 150, max 1000)
 * @returns Pravatar URL
 */
export function getRandomAvatarUrl(size: number = 150): string {
  // Add timestamp to ensure uniqueness and avoid caching
  const timestamp = Date.now()
  return getPravatarUrl({ identifier: timestamp.toString(), size })
}

/**
 * Generate avatar URL with a specific image ID
 * @param imageId - Image ID (1-70)
 * @param size - Avatar size (default 150, max 1000)
 * @returns Pravatar URL
 */
export function getAvatarByImageId(imageId: number, size: number = 150): string {
  // Clamp imageId between 1 and 70
  const clampedId = Math.max(1, Math.min(70, imageId))
  return getPravatarUrl({ imageId: clampedId, size })
}

/**
 * Generate a consistent avatar URL for profile seeding
 * Uses username as identifier to ensure consistency
 * @param username - Username for the profile
 * @param size - Avatar size (default 300)
 * @returns Pravatar URL
 */
export function getProfileAvatarUrl(username: string, size: number = 300): string {
  return getUserAvatarUrl(username, size)
}