import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";

interface AvatarSilhouetteProps {
  gender: "male" | "female";
  bodyFatPercentage: number;
  showPhoto: boolean;
  profileImage?: string;
  onToggleView: () => void;
  className?: string;
  hideToggleOnMobile?: boolean;
}

export const AvatarSilhouette = React.memo(function AvatarSilhouette({
  gender,
  bodyFatPercentage,
  showPhoto,
  profileImage,
  onToggleView,
  className,
  hideToggleOnMobile = false,
}: AvatarSilhouetteProps) {
  // Calculate fill opacity based on body fat percentage (0-50% range)
  const fillOpacity = useMemo(
    () => Math.min(bodyFatPercentage / 25, 1),
    [bodyFatPercentage],
  );

  const maleSilhouette = useMemo(
    () => (
      <svg viewBox="0 0 200 400" className="h-full w-full">
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
    ),
    [fillOpacity],
  );

  const femaleSilhouette = useMemo(
    () => (
      <svg viewBox="0 0 200 400" className="h-full w-full">
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
    ),
    [fillOpacity],
  );

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Toggle buttons - Hidden on mobile if hideToggleOnMobile is true */}
      <div
        className={cn(
          "absolute left-6 top-6 z-10 flex gap-2",
          hideToggleOnMobile && "hidden md:flex",
        )}
      >
        <Button
          variant={!showPhoto ? "default" : "outline"}
          size="sm"
          onClick={onToggleView}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all",
            !showPhoto
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Avatar
        </Button>
        <Button
          variant={showPhoto ? "default" : "outline"}
          size="sm"
          onClick={onToggleView}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all",
            showPhoto
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Photo
        </Button>
      </div>

      {/* Content */}
      <div className="flex h-full items-center justify-center">
        {showPhoto && profileImage ? (
          <LazyImage
            src={profileImage}
            alt="Profile"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <div className="h-80 w-32 md:h-96 md:w-40">
            {gender === "male" ? maleSilhouette : femaleSilhouette}
          </div>
        )}
      </div>

      {/* Body fat percentage indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
        <div className="text-center text-sm font-medium text-muted-foreground">
          {(bodyFatPercentage || 0).toFixed(1)}% body fat
        </div>
      </div>
    </div>
  );
});
