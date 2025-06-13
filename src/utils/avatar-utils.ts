/**
 * Avatar utility functions for pre-rendered wireframe avatars
 */

export interface AvatarParams {
  bodyFat: number; // 5-50% (increments of 5)
  sex: "m" | "f";
}

export interface UserMetrics {
  weight?: number;
  height?: number;
  bodyFat?: number;
  age?: number;
  gender?: "male" | "female";
}

/**
 * Round body fat to nearest supported value (increments of 5, range 5-50)
 */
export function roundBodyFat(bodyFat: number): number {
  return Math.max(5, Math.min(50, Math.round(bodyFat / 5) * 5));
}

/**
 * Convert user metrics to avatar parameters
 */
export function userMetricsToAvatarParams(metrics: UserMetrics): AvatarParams {
  const { bodyFat = 20, gender = "male" } = metrics;

  return {
    bodyFat: roundBodyFat(bodyFat),
    sex: gender === "female" ? "f" : "m",
  };
}

/**
 * Generate avatar filename from parameters
 */
export function getAvatarFilename(params: AvatarParams): string {
  return `${params.sex}_bf${params.bodyFat}.svg`;
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
export function getAvatarVariations(
  baseMetrics: UserMetrics,
  bodyFatRange: number[] = [10, 15, 20, 25, 30],
): string[] {
  return bodyFatRange.map((bodyFat) =>
    getAvatarUrlFromMetrics({ ...baseMetrics, bodyFat }),
  );
}

/**
 * Get body fat category label
 */
export function getBodyFatLabel(bodyFat: number): string {
  if (bodyFat <= 10) return "Very Low";
  if (bodyFat <= 15) return "Low";
  if (bodyFat <= 25) return "Normal";
  if (bodyFat <= 35) return "High";
  return "Very High";
}

/**
 * Validate avatar parameters
 */
export function validateAvatarParams(params: AvatarParams): boolean {
  const bodyFatValid = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].includes(
    params.bodyFat,
  );
  const sexValid = ["m", "f"].includes(params.sex);

  return bodyFatValid && sexValid;
}

/**
 * Get fallback avatar URL if specific combination doesn't exist
 */
export function getFallbackAvatarUrl(params: AvatarParams): string {
  // Use closest valid parameters as fallback
  const fallbackParams: AvatarParams = {
    bodyFat: 20, // Default body fat
    sex: params.sex,
  };

  return getAvatarUrl(fallbackParams);
}
