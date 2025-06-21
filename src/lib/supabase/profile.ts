import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types/body-metrics'

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error || !data) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  // Transform database data to match UserProfile type
  return {
    ...data,
    settings: data.settings || {},
    email_verified: data.email_verified || false,
    onboarding_completed: data.onboarding_completed || false
  }
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = createClient()
  
  // Remove computed/readonly fields from updates
  const { id, created_at, updated_at, settings, ...profileUpdates } = updates
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }
  
  return {
    ...data,
    settings: data.settings || {},
    email_verified: data.email_verified || false,
    onboarding_completed: data.onboarding_completed || false
  }
}

export async function createProfile(userId: string, email: string): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      settings: {},
      email_verified: false,
      onboarding_completed: false
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }
  
  return {
    ...data,
    settings: data.settings || {},
    email_verified: data.email_verified || false,
    onboarding_completed: data.onboarding_completed || false
  }
}