/**
 * Avatar utility functions for pre-rendered wireframe avatars
 */

export interface AvatarParams {
  bodyFat: number;      // 5-50%
  ffmi: number;         // 14-25
  ageRangeIdx: number;  // 0-4 (18-25, 26-35, 36-45, 46-60, 61+)
  sex: 'm' | 'f';
  stature: 's' | 'm' | 't'; // short ≤1.65m, medium 1.66-1.85m, tall ≥1.86m
}

export interface UserMetrics {
  weight?: number;
  height?: number;
  bodyFat?: number;
  age?: number;
  gender?: 'male' | 'female';
}

/**
 * Calculate FFMI (Fat-Free Mass Index) from user metrics
 */
export function calculateFFMI(weight: number, height: number, bodyFat: number): number {
  const heightInMeters = height / 100;
  const fatFreeWeight = weight * (1 - bodyFat / 100);
  const ffmi = fatFreeWeight / (heightInMeters * heightInMeters);
  
  // Clamp to our avatar range
  return Math.max(14, Math.min(25, Math.round(ffmi)));
}

/**
 * Determine stature category from height
 */
export function getStatureCategory(height: number): 's' | 'm' | 't' {
  if (height <= 165) return 's'; // short
  if (height >= 186) return 't'; // tall
  return 'm'; // medium
}

/**
 * Determine age range index from age
 */
export function getAgeRangeIndex(age: number): number {
  if (age <= 25) return 0; // 18-25: Young adult
  if (age <= 35) return 1; // 26-35: Early career / prime fitness
  if (age <= 45) return 2; // 36-45: Midlife
  if (age <= 60) return 3; // 46-60: Mature adult
  return 4; // 61+: Senior
}

/**
 * Convert user metrics to avatar parameters
 */
export function userMetricsToAvatarParams(metrics: UserMetrics): AvatarParams {
  const {
    weight = 70,
    height = 170,
    bodyFat = 20,
    age = 30,
    gender = 'male'
  } = metrics;

  // Calculate FFMI
  const ffmi = calculateFFMI(weight, height, bodyFat);
  
  // Clamp body fat to avatar range
  const clampedBodyFat = Math.max(5, Math.min(50, Math.round(bodyFat / 5) * 5));
  
  return {
    bodyFat: clampedBodyFat,
    ffmi,
    ageRangeIdx: getAgeRangeIndex(age),
    sex: gender === 'female' ? 'f' : 'm',
    stature: getStatureCategory(height)
  };
}

/**
 * Generate avatar filename from parameters
 */
export function getAvatarFilename(params: AvatarParams): string {
  return `${params.sex}_bf${params.bodyFat}_ffmi${params.ffmi}_age${params.ageRangeIdx}_${params.stature}.svg`;
}

/**
 * Get avatar URL from parameters
 */
export function getAvatarUrl(params: AvatarParams): string {
  return `/avatars/${getAvatarFilename(params)}`;
}

/**
 * Get avatar URL directly from user metrics
 */
export function getAvatarUrlFromMetrics(metrics: UserMetrics): string {
  const params = userMetricsToAvatarParams(metrics);
  return getAvatarUrl(params);
}

/**
 * Get multiple avatar variations for preview (different body fat levels)
 */
export function getAvatarVariations(baseMetrics: UserMetrics, bodyFatRange: number[] = [10, 15, 20, 25, 30]): string[] {
  return bodyFatRange.map(bodyFat => 
    getAvatarUrlFromMetrics({ ...baseMetrics, bodyFat })
  );
}

/**
 * Get age range label from index
 */
export function getAgeRangeLabel(ageRangeIdx: number): string {
  const ranges = [
    '18-25 (Young adult)',
    '26-35 (Early career)',
    '36-45 (Midlife)',
    '46-60 (Mature adult)',
    '61+ (Senior)'
  ];
  return ranges[ageRangeIdx] || ranges[0];
}

/**
 * Get stature label from category
 */
export function getStatureLabel(stature: 's' | 'm' | 't'): string {
  const labels = { s: 'Short (≤165cm)', m: 'Medium (166-185cm)', t: 'Tall (≥186cm)' };
  return labels[stature];
}

/**
 * Validate avatar parameters
 */
export function validateAvatarParams(params: AvatarParams): boolean {
  const bodyFatValid = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].includes(params.bodyFat);
  const ffmiValid = params.ffmi >= 14 && params.ffmi <= 25;
  const ageValid = params.ageRangeIdx >= 0 && params.ageRangeIdx <= 4;
  const sexValid = ['m', 'f'].includes(params.sex);
  const statureValid = ['s', 'm', 't'].includes(params.stature);
  
  return bodyFatValid && ffmiValid && ageValid && sexValid && statureValid;
}

/**
 * Get fallback avatar URL if specific combination doesn't exist
 */
export function getFallbackAvatarUrl(params: AvatarParams): string {
  // Use closest valid parameters as fallback
  const fallbackParams: AvatarParams = {
    bodyFat: 20, // Default body fat
    ffmi: 18,    // Average FFMI
    ageRangeIdx: 1, // 26-35: Early career / prime fitness
    sex: params.sex,
    stature: 'm' // Medium stature
  };
  
  return getAvatarUrl(fallbackParams);
}