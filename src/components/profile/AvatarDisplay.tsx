import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, getAnimation } from '@/styles/design-tokens';
import { LazyImage } from '@/components/ui/lazy-image';

interface AvatarDisplayProps {
  gender: 'male' | 'female';
  bodyFatPercentage: number;
  showPhoto: boolean;
  profileImage?: string;
  className?: string;
}

export const AvatarDisplay = React.memo<AvatarDisplayProps>(function AvatarDisplay({
  gender,
  bodyFatPercentage,
  showPhoto,
  profileImage,
  className,
}) {
  const fadeIn = getAnimation('fadeIn');
  const spring = getAnimation('spring');
  
  // Calculate fill opacity based on body fat percentage (0-50% range)
  const fillOpacity = useMemo(() => Math.min(bodyFatPercentage / 25, 1), [bodyFatPercentage]);

  const maleSilhouette = useMemo(() => (
    <svg 
      viewBox="0 0 200 400" 
      className="w-full h-full"
      role="img"
      aria-label={`Male body silhouette showing ${bodyFatPercentage.toFixed(1)} percent body fat`}
    >
      <title>Male Body Silhouette</title>
      <desc>Visual representation of body composition with {bodyFatPercentage.toFixed(1)}% body fat</desc>
      
      {/* Body outline */}
      <path
        d="M100 40 C85 40 75 50 75 65 L75 85 C70 90 65 100 65 115 L60 140 L55 180 L55 220 L50 260 L50 300 L45 340 L45 380 L65 380 L70 340 L75 300 L80 260 L85 220 L90 180 L95 140 L100 115 L105 140 L110 180 L115 220 L120 260 L125 300 L130 340 L135 380 L155 380 L150 340 L145 300 L150 260 L145 220 L145 180 L140 140 L135 115 C135 100 130 90 125 85 L125 65 C125 50 115 40 100 40 Z"
        fill="none"
        stroke="white"
        strokeWidth="2"
        className="opacity-90"
      />
      
      {/* Fill based on body fat */}
      <path
        d="M100 40 C85 40 75 50 75 65 L75 85 C70 90 65 100 65 115 L60 140 L55 180 L55 220 L50 260 L50 300 L45 340 L45 380 L65 380 L70 340 L75 300 L80 260 L85 220 L90 180 L95 140 L100 115 L105 140 L110 180 L115 220 L120 260 L125 300 L130 340 L135 380 L155 380 L150 340 L145 300 L150 260 L145 220 L145 180 L140 140 L135 115 C135 100 130 90 125 85 L125 65 C125 50 115 40 100 40 Z"
        fill="white"
        opacity={fillOpacity * 0.3}
      />
      
      {/* Head */}
      <circle
        cx="100"
        cy="25"
        r="20"
        fill="none"
        stroke="white"
        strokeWidth="2"
        className="opacity-90"
      />
      <circle
        cx="100"
        cy="25"
        r="20"
        fill="white"
        opacity={fillOpacity * 0.3}
      />
    </svg>
  ), [fillOpacity, bodyFatPercentage]);

  const femaleSilhouette = useMemo(() => (
    <svg 
      viewBox="0 0 200 400" 
      className="w-full h-full"
      role="img"
      aria-label={`Female body silhouette showing ${bodyFatPercentage.toFixed(1)} percent body fat`}
    >
      <title>Female Body Silhouette</title>
      <desc>Visual representation of body composition with {bodyFatPercentage.toFixed(1)}% body fat</desc>
      
      {/* Body outline - female shape */}
      <path
        d="M100 40 C85 40 75 50 75 65 L75 85 C70 90 65 100 65 115 L60 140 L55 160 C50 165 45 170 45 180 L50 200 L55 220 L50 240 L50 260 L50 300 L45 340 L45 380 L65 380 L70 340 L75 300 L80 260 L85 240 L90 220 L95 200 L100 180 L105 200 L110 220 L115 240 L120 260 L125 300 L130 340 L135 380 L155 380 L150 340 L145 300 L150 260 L150 240 L145 220 L150 200 L155 180 C155 170 150 165 145 160 L140 140 L135 115 C135 100 130 90 125 85 L125 65 C125 50 115 40 100 40 Z"
        fill="none"
        stroke="white"
        strokeWidth="2"
        className="opacity-90"
      />
      
      {/* Fill based on body fat */}
      <path
        d="M100 40 C85 40 75 50 75 65 L75 85 C70 90 65 100 65 115 L60 140 L55 160 C50 165 45 170 45 180 L50 200 L55 220 L50 240 L50 260 L50 300 L45 340 L45 380 L65 380 L70 340 L75 300 L80 260 L85 240 L90 220 L95 200 L100 180 L105 200 L110 220 L115 240 L120 260 L125 300 L130 340 L135 380 L155 380 L150 340 L145 300 L150 260 L150 240 L145 220 L150 200 L155 180 C155 170 150 165 145 160 L140 140 L135 115 C135 100 130 90 125 85 L125 65 C125 50 115 40 100 40 Z"
        fill="white"
        opacity={fillOpacity * 0.3}
      />
      
      {/* Head */}
      <circle
        cx="100"
        cy="25"
        r="20"
        fill="none"
        stroke="white"
        strokeWidth="2"
        className="opacity-90"
      />
      <circle
        cx="100"
        cy="25"
        r="20"
        fill="white"
        opacity={fillOpacity * 0.3}
      />
    </svg>
  ), [fillOpacity, bodyFatPercentage]);

  return (
    <div className={cn(tw.avatarContainer, 'overflow-hidden', className)}>
      {/* Body fat percentage overlay - positioned above avatar */}
      <motion.div
        className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <div 
          className={cn(tw.bodyFatOverlay, 'px-3 py-1 rounded-lg bg-black/20 backdrop-blur-sm')}
          aria-label={`Current body fat percentage: ${bodyFatPercentage.toFixed(1)} percent`}
        >
          {bodyFatPercentage.toFixed(1)}% body fat
        </div>
      </motion.div>

      {/* Avatar content area */}
      <div className="flex items-center justify-center h-full pt-16 pb-8">
        <AnimatePresence mode="wait">
          {showPhoto && profileImage ? (
            <motion.div
              key="photo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring}
              className="max-h-full max-w-full"
            >
              <LazyImage
                src={profileImage}
                alt={`Profile photo showing current body composition`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          ) : (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring}
              className="w-32 h-80 md:w-40 md:h-96"
            >
              {gender === 'male' ? maleSilhouette : femaleSilhouette}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Hook for avatar accessibility announcements
export const useAvatarAnnouncement = (bodyFatPercentage: number, gender: string, showPhoto: boolean) => {
  React.useEffect(() => {
    const viewType = showPhoto ? 'profile photo' : `${gender} body silhouette`;
    const announcement = `Displaying ${viewType} with ${bodyFatPercentage.toFixed(1)} percent body fat`;
    
    // Create live region for screen reader announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      liveRegion.textContent = announcement;
      
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }, 100);
  }, [bodyFatPercentage, gender, showPhoto]);
};