export interface BodyMetrics {
  id: string
  user_id: string
  date: string
  weight?: number
  weight_unit?: 'kg' | 'lbs'
  body_fat_percentage?: number
  body_fat_method?: 'navy' | '3-site' | '7-site' | 'dexa' | 'bodpod'
  
  // Measurements for body fat calculations
  waist?: number
  neck?: number
  hip?: number // For female navy method
  
  // Skinfold measurements
  chest_skinfold?: number
  abdominal_skinfold?: number
  thigh_skinfold?: number
  tricep_skinfold?: number
  suprailiac_skinfold?: number
  subscapular_skinfold?: number
  midaxillary_skinfold?: number
  
  // Calculated values
  lean_body_mass?: number
  ffmi?: number // Fat-Free Mass Index
  
  // Additional data
  photo_url?: string
  notes?: string
  step_count?: number
  
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  date_of_birth?: string
  height?: number
  height_unit?: 'cm' | 'ft'
  gender?: 'male' | 'female' | 'other'
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  email_verified: boolean
  onboarding_completed: boolean
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  units?: {
    weight?: 'kg' | 'lbs'
    height?: 'cm' | 'ft'
    measurements?: 'cm' | 'in'
  }
  notifications?: {
    daily_reminder?: boolean
    reminder_time?: string
    weekly_report?: boolean
    progress_milestones?: boolean
  }
  privacy?: {
    public_profile?: boolean
    show_progress_photos?: boolean
  }
  theme?: 'light' | 'dark' | 'system'
}

export interface ProgressPhoto {
  id: string
  user_id: string
  body_metrics_id?: string
  photo_url: string
  thumbnail_url?: string
  angle: 'front' | 'side' | 'back'
  date: string
  notes?: string
  created_at: string
}

// Calculation helpers
export interface FFMIResult {
  ffmi: number
  normalized_ffmi: number
  fat_free_mass: number
  interpretation: 'below_average' | 'average' | 'above_average' | 'excellent' | 'superior' | 'suspiciously_high'
}

export interface BodyFatResult {
  percentage: number
  lean_mass: number
  fat_mass: number
  category: 'essential' | 'athletic' | 'fit' | 'average' | 'above_average' | 'obese'
}