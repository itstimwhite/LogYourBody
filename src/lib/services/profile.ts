import { createClient } from '../supabase/client'
import { UserProfile, UserSettings, BodyMetric } from '../types/database'

export class ProfileService {
  private supabase = createClient()

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  async createProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data
  }

  async updateProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  }

  async getSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching settings:', error)
      return null
    }

    return data
  }

  async createDefaultSettings(userId: string): Promise<UserSettings | null> {
    const defaultSettings: Omit<UserSettings, 'created_at' | 'updated_at'> = {
      user_id: userId,
      units: 'imperial',
      health_kit_sync_enabled: false,
      google_fit_sync_enabled: false,
      notifications_enabled: false,
    }

    const { data, error } = await this.supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single()

    if (error) {
      console.error('Error creating default settings:', error)
      return null
    }

    return data
  }

  async updateSettings(userId: string, updates: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return null
    }

    return data
  }

  async getBodyMetrics(userId: string, limit = 10): Promise<BodyMetric[]> {
    const { data, error } = await this.supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching body metrics:', error)
      return []
    }

    return data || []
  }

  async getLatestMetrics(userId: string): Promise<BodyMetric | null> {
    const { data, error } = await this.supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest metrics:', error)
      return null
    }

    return data
  }

  async createBodyMetric(metric: Omit<BodyMetric, 'id' | 'created_at'>): Promise<BodyMetric | null> {
    const { data, error } = await this.supabase
      .from('body_metrics')
      .insert(metric)
      .select()
      .single()

    if (error) {
      console.error('Error creating body metric:', error)
      return null
    }

    return data
  }

  async updateBodyMetric(metricId: string, updates: Partial<Omit<BodyMetric, 'id' | 'user_id' | 'created_at'>>): Promise<BodyMetric | null> {
    const { data, error } = await this.supabase
      .from('body_metrics')
      .update(updates)
      .eq('id', metricId)
      .select()
      .single()

    if (error) {
      console.error('Error updating body metric:', error)
      return null
    }

    return data
  }

  async deleteBodyMetric(metricId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('body_metrics')
      .delete()
      .eq('id', metricId)

    if (error) {
      console.error('Error deleting body metric:', error)
      return false
    }

    return true
  }
}

export const profileService = new ProfileService()