import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface PhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded?: (photoUrl: string) => void;
  bodyMetricsId?: string;
}

export function PhotoCapture({ 
  isOpen, 
  onClose, 
  onPhotoUploaded,
  bodyMetricsId 
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const { uploadPhoto, isUploading, uploadProgress } = usePhotoUpload({
    onSuccess: (result) => {
      onPhotoUploaded?.(result.url);
      handleClose();
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadPhoto(selectedFile, bodyMetricsId);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleRetake = () => {
    setSelectedFile(null);
    setPreview(null);
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Add Progress Photo
            </h2>
            <p className="text-muted-foreground">
              Capture your progress with a photo
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            capture="environment"
          />

          {/* Preview or upload prompt */}
          {preview ? (
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary">
                <img
                  src={preview}
                  alt="Progress photo preview"
                  className="h-full w-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="space-y-2 text-center">
                      <Progress value={uploadProgress} className="w-32" />
                      <p className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isUploading && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleUpload}
                    className="flex-1"
                    disabled={!selectedFile}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/50 hover:bg-secondary/30"
              )}
            >
              <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">
                Take or select a photo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                JPG, PNG or WebP • Max 10MB
              </p>
            </div>
          )}

          {/* Cancel button */}
          {!isUploading && (
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full"
            >
              Cancel
            </Button>
          )}

          {/* Tips */}
          <div className="rounded-lg bg-secondary/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Tips for best results:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Use consistent lighting and angle</li>
              <li>Take photos at the same time of day</li>
              <li>Wear similar clothing each time</li>
              <li>Use a mirror or timer for consistency</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}