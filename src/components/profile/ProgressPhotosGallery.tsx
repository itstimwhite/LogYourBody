import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Camera, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { BodyMetricsItem } from '@/types/bodymetrics';

interface ProgressPhotosGalleryProps {
  metrics: BodyMetricsItem[];
  className?: string;
}

export function ProgressPhotosGallery({ metrics, className }: ProgressPhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<BodyMetricsItem | null>(null);
  
  // Filter metrics that have photos
  const photosData = useMemo(() => {
    return metrics
      .filter(m => m.photoUrl)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [metrics]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (photosData.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No progress photos yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add photos when logging your measurements
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photosData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary cursor-pointer"
              onClick={() => setSelectedPhoto(item)}
            >
              <img
                src={item.photoUrl}
                alt={`Progress photo from ${formatDate(item.date)}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay with date and stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.date)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div>{item.weight.toFixed(1)} kg</div>
                    <div>{item.bodyFatPercentage.toFixed(1)}% BF</div>
                  </div>
                </div>
              </div>

              {/* Zoom indicator */}
              <div className="absolute top-2 right-2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/20 border border-border">
          <div className="text-sm text-muted-foreground">
            <p>{photosData.length} progress photos</p>
            <p className="mt-1">
              From {formatDate(photosData[photosData.length - 1].date)} to {formatDate(photosData[0].date)}
            </p>
          </div>
        </div>
      </div>

      {/* Full Screen Photo Viewer */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {selectedPhoto && (
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-lg">
                    {formatDate(selectedPhoto.date)}
                  </h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>{selectedPhoto.weight.toFixed(1)} kg</span>
                    <span>{selectedPhoto.bodyFatPercentage.toFixed(1)}% BF</span>
                    {selectedPhoto.method && (
                      <span>{selectedPhoto.method.label}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo */}
              <div className="flex-1 overflow-hidden bg-black/95 flex items-center justify-center">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={`Progress photo from ${formatDate(selectedPhoto.date)}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
                <button
                  onClick={() => {
                    const currentIndex = photosData.findIndex(p => p.id === selectedPhoto.id);
                    if (currentIndex > 0) {
                      setSelectedPhoto(photosData[currentIndex - 1]);
                    }
                  }}
                  disabled={photosData.findIndex(p => p.id === selectedPhoto.id) === 0}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  {photosData.findIndex(p => p.id === selectedPhoto.id) + 1} / {photosData.length}
                </span>
                <button
                  onClick={() => {
                    const currentIndex = photosData.findIndex(p => p.id === selectedPhoto.id);
                    if (currentIndex < photosData.length - 1) {
                      setSelectedPhoto(photosData[currentIndex + 1]);
                    }
                  }}
                  disabled={photosData.findIndex(p => p.id === selectedPhoto.id) === photosData.length - 1}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}