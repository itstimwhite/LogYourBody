import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  uploadProgressPhoto, 
  deleteProgressPhoto, 
  compressImage,
  type UploadResult 
} from '@/utils/photo-upload';
import { useToast } from '@/hooks/use-toast';

export interface UsePhotoUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  autoCompress?: boolean;
  maxWidth?: number;
}

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhoto = useCallback(async (
    file: File,
    bodyMetricsId?: string
  ): Promise<UploadResult | null> => {
    if (!user?.id) {
      const error = 'User not authenticated';
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      options.onError?.(error);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress image if enabled
      let fileToUpload = file;
      if (options.autoCompress !== false) {
        setUploadProgress(10);
        toast({
          title: 'Processing',
          description: 'Compressing image...',
        });
        
        fileToUpload = await compressImage(file, options.maxWidth || 1920);
        setUploadProgress(30);
      }

      // Upload to Supabase
      toast({
        title: 'Uploading',
        description: 'Uploading your photo...',
      });
      
      const result = await uploadProgressPhoto({
        file: fileToUpload,
        userId: user.id,
        bodyMetricsId,
      });

      setUploadProgress(100);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user?.id, toast, options]);

  const deletePhoto = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const success = await deleteProgressPhoto(filePath);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Photo deleted successfully',
        });
      } else {
        throw new Error('Failed to delete photo');
      }
      
      return success;
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete photo',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    uploadPhoto,
    deletePhoto,
    isUploading,
    uploadProgress,
  };
}