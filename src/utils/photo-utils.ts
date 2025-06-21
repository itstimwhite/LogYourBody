import { createClient } from '@/lib/supabase/client'
import { ensurePublicUrl, deleteFromStorage, getFilePathFromUrl } from './storage-utils'

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

export interface PhotoUploadResult {
  success: boolean
  data?: PhotoData
  error?: string
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
 * Deletes a photo from body_metrics and storage
 * @param photoId The photo ID to delete
 */
export async function deletePhoto(photoId: string): Promise<void> {
  const supabase = createClient()
  
  try {
    // First, get the photo to extract the storage path
    const photo = await loadPhoto(photoId)
    if (!photo) {
      throw new Error('Photo not found')
    }
    
    // Extract file path from URL for storage deletion
    const filePath = getFilePathFromUrl(photo.photo_url, 'photos')
    
    // Delete from storage bucket first
    if (filePath) {
      try {
        await deleteFromStorage('photos', filePath)
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Continue with database deletion even if storage fails
      }
    }
    
    // Delete from body_metrics (this will set photo_url to null or delete the record)
    const { error } = await supabase
      .from('body_metrics')
      .update({ photo_url: null })
      .eq('id', photoId)
    
    if (error) {
      console.error('Error deleting photo from database:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deletePhoto:', error)
    throw error
  }
}

/**
 * Uploads a photo with a body metrics entry
 */
export async function uploadPhotoWithMetrics(
  file: File,
  userId: string,
  data?: {
    weight?: number
    weight_unit?: string
    body_fat_percentage?: number
    notes?: string
    date?: string
  }
): Promise<PhotoUploadResult> {
  const supabase = createClient()
  
  try {
    // Generate file name
    const fileName = `${userId}/${Date.now()}-progress.jpg`
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      throw uploadError
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)
    
    const correctedUrl = ensurePublicUrl(publicUrl)
    
    // Create body metrics entry
    const { data: metricsData, error: metricsError } = await supabase
      .from('body_metrics')
      .insert({
        user_id: userId,
        date: data?.date || new Date().toISOString().split('T')[0],
        photo_url: correctedUrl,
        weight: data?.weight,
        weight_unit: data?.weight_unit,
        body_fat_percentage: data?.body_fat_percentage,
        notes: data?.notes || 'Progress photo'
      })
      .select()
      .single()
    
    if (metricsError) {
      // Try to clean up uploaded file
      await deleteFromStorage('photos', fileName).catch(console.error)
      throw metricsError
    }
    
    return {
      success: true,
      data: {
        ...metricsData,
        photo_url: correctedUrl
      }
    }
  } catch (error) {
    console.error('Error uploading photo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photo'
    }
  }
}