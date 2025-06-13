import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, getAnimation } from "@/styles/design-tokens";
import { LazyImage } from "@/components/ui/lazy-image";
import {
  getAvatarUrlFromMetrics,
  getFallbackAvatarUrl,
  type UserMetrics,
} from "@/utils/avatar-utils";

interface AvatarDisplayProps {
  gender: "male" | "female";
  bodyFatPercentage: number;
  showPhoto: boolean;
  profileImage?: string;
  className?: string;
  // New props for enhanced avatar system
  weight?: number;
  height?: number;
  age?: number;
}

export const AvatarDisplay = React.memo<AvatarDisplayProps>(
  function AvatarDisplay({
    gender,
    bodyFatPercentage,
    showPhoto,
    profileImage,
    className,
    weight = 70,
    height = 170,
    age = 30,
  }) {
    const fadeIn = getAnimation("fadeIn");
    const spring = getAnimation("spring");
    const [avatarError, setAvatarError] = useState(false);

    // Generate avatar URL from user metrics
    const avatarUrl = useMemo(() => {
      const metrics: UserMetrics = {
        weight,
        height,
        bodyFat: bodyFatPercentage,
        age,
        gender,
      };

      return getAvatarUrlFromMetrics(metrics);
    }, [weight, height, bodyFatPercentage, age, gender]);

    // Fallback avatar URL if main avatar fails to load
    const fallbackUrl = useMemo(() => {
      const fallbackParams = {
        bodyFat: Math.round((bodyFatPercentage || 20) / 5) * 5, // Round to nearest 5
        ffmi: 18, // Average FFMI
        ageRangeIdx: 1, // 26-35 age range
        sex: gender === "female" ? ("f" as const) : ("m" as const),
        stature: "m" as const, // Medium stature
      };

      return getFallbackAvatarUrl(fallbackParams);
    }, [bodyFatPercentage, gender]);

    // Handle avatar loading errors
    const handleAvatarError = () => {
      setAvatarError(true);
    };

    const handleAvatarLoad = () => {
      setAvatarError(false);
    };

    return (
      <div className={cn(tw.avatarContainer, "overflow-hidden", className)}>
        {/* Avatar content area */}
        <div className="flex h-full items-center justify-center p-4">
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
                  className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                />
              </motion.div>
            ) : (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={spring}
                className="flex h-64 w-40 items-center justify-center md:h-80 md:w-48"
              >
                <LazyImage
                  src={avatarError ? fallbackUrl : avatarUrl}
                  alt={`${gender} body composition wireframe showing ${(bodyFatPercentage || 0).toFixed(1)}% body fat`}
                  className="h-full w-full object-contain"
                  onError={handleAvatarError}
                  onLoad={handleAvatarLoad}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.1))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

// Hook for avatar accessibility announcements
export const useAvatarAnnouncement = (
  bodyFatPercentage: number,
  gender: string,
  showPhoto: boolean,
) => {
  React.useEffect(() => {
    const viewType = showPhoto ? "profile photo" : `${gender} body silhouette`;
    const announcement = `Displaying ${viewType} with ${(bodyFatPercentage || 0).toFixed(1)} percent body fat`;

    // Create live region for screen reader announcement
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-10000px";
    liveRegion.style.width = "1px";
    liveRegion.style.height = "1px";
    liveRegion.style.overflow = "hidden";

    document.body.appendChild(liveRegion);

    setTimeout(() => {
      liveRegion.textContent = announcement;

      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }, 100);
  }, [bodyFatPercentage, gender, showPhoto]);
};
