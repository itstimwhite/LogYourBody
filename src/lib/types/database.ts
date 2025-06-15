export interface UserProfile {
  id: string
  email: string
  name?: string | null
  gender: 'male' | 'female'
  birthday?: string | null
  height: number
  profile_image_url?: string | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  user_id: string
  units: 'imperial' | 'metric'
  health_kit_sync_enabled: boolean
  google_fit_sync_enabled: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface BodyMetric {
  id: string
  user_id: string
  date: string
  weight: number
  body_fat_percentage: number
  method: 'dexa' | 'scale' | 'calipers' | 'visual'
  photo_url?: string | null
  muscle_mass?: number | null
  bone_mass?: number | null
  water_percentage?: number | null
  step_count?: number | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  trial_start_date?: string | null
  trial_end_date?: string | null
  subscription_start_date?: string | null
  subscription_end_date?: string | null
  product_id?: string | null
  revenue_cat_user_id?: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>
      }
      body_metrics: {
        Row: BodyMetric
        Insert: Omit<BodyMetric, 'id' | 'created_at'>
        Update: Partial<Omit<BodyMetric, 'id' | 'user_id' | 'created_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}