import { createClient } from '@/lib/supabase/client'
import { ensurePublicUrl } from './storage-utils'

export interface PhotoData {
  id: string
  user_id: string
  date: string
  photo_url: string
  weight?: number
  weight_unit?: string
  body_fat_percentage?: number
  notes?: string
  created_at: string
}

/**
 * Loads all photos for the current user from body_metrics
 * @returns Array of photo data
 */
export async function loadUserPhotos(): Promise<PhotoData[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('body_metrics')
    .select('id, user_id, date, photo_url, weight, weight_unit, body_fat_percentage, notes, created_at')
    .not('photo_url', 'is', null)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error loading photos:', error)
    throw error
  }
  
  // Ensure all photo URLs use the correct public format
  return (data || []).map(photo => ({
    ...photo,
    photo_url: ensurePublicUrl(photo.photo_url)
  }))
}

/**
 * Loads a single photo by ID
 * @param photoId The photo ID
 * @returns Photo data or null
 */
export async function loadPhoto(photoId: string): Promise<PhotoData | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('body_metrics')
    .select('id, user_id, date, photo_url, weight, weight_unit, body_fat_percentage, notes, created_at')
    .eq('id', photoId)
    .single()
  
  if (error) {
    console.error('Error loading photo:', error)
    return null
  }
  
  return data ? {
    ...data,
    photo_url: ensurePublicUrl(data.photo_url)
  } : null
}

/**
 * Deletes a photo from body_metrics
 * @param photoId The photo ID to delete
 */
export async function deletePhoto(photoId: string): Promise<void> {
  const supabase = createClient()
  
  // First, get the photo to extract the storage path
  const photo = await loadPhoto(photoId)
  if (!photo) return
  
  // Delete from body_metrics (this will set photo_url to null or delete the record)
  const { error } = await supabase
    .from('body_metrics')
    .update({ photo_url: null })
    .eq('id', photoId)
  
  if (error) {
    console.error('Error deleting photo from database:', error)
    throw error
  }
  
  // TODO: Also delete from storage bucket if needed
  // This would require extracting the file path from the URL
}