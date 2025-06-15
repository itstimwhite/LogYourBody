import { supabase } from '@/lib/supabase';

export interface UploadProgressPhotoOptions {
  file: File;
  userId: string;
  bodyMetricsId?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Uploads a progress photo to Supabase storage
 * Photos are stored in user-specific folders for security
 */
export async function uploadProgressPhoto({
  file,
  userId,
  bodyMetricsId,
}: UploadProgressPhotoOptions): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = bodyMetricsId 
      ? `${bodyMetricsId}_${timestamp}.${fileExt}`
      : `progress_${timestamp}.${fileExt}`;
    
    // Path: userId/filename
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Photo upload error:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Failed to upload photo',
    };
  }
}

/**
 * Deletes a progress photo from Supabase storage
 */
export async function deleteProgressPhoto(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('progress-photos')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Photo delete error:', error);
    return false;
  }
}

/**
 * Gets a signed URL for a progress photo (for private access)
 */
export async function getProgressPhotoUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Get photo URL error:', error);
    return null;
  }
}

/**
 * Lists all progress photos for a user
 */
export async function listUserProgressPhotos(userId: string) {
  try {
    const { data, error } = await supabase.storage
      .from('progress-photos')
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List photos error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('List photos error:', error);
    return [];
  }
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(file: File, maxWidth = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
    };
    
    reader.onerror = () => reject(new Error('File read failed'));
  });
}