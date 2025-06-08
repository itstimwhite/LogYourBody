import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AvatarSilhouetteProps {
  gender: "male" | "female";
  bodyFatPercentage: number;
  showPhoto: boolean;
  profileImage?: string;
  onToggleView: () => void;
  className?: string;
}

export function AvatarSilhouette({
  gender,
  bodyFatPercentage,
  showPhoto,
  profileImage,
  onToggleView,
  className,
}: AvatarSilhouetteProps) {
  // Calculate fill opacity based on body fat percentage (0-50% range)
  const fillOpacity = Math.min(bodyFatPercentage / 25, 1);

  const maleSilhouette = (
    <svg viewBox="0 0 200 400" className="w-full h-full">
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
  );

  const femaleSilhouette = (
    <svg viewBox="0 0 200 400" className="w-full h-full">
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
  );

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Toggle buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant={!showPhoto ? "default" : "outline"}
          size="sm"
          onClick={onToggleView}
          className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Avatar
        </Button>
        <Button
          variant={showPhoto ? "default" : "outline"}
          size="sm"
          onClick={onToggleView}
          className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Photo
        </Button>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center h-full">
        {showPhoto && profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        ) : (
          <div className="w-32 h-80 md:w-40 md:h-96">
            {gender === "male" ? maleSilhouette : femaleSilhouette}
          </div>
        )}
      </div>

      {/* Body fat percentage indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="text-white/60 text-xs text-center">
          {bodyFatPercentage.toFixed(1)}% body fat
        </div>
      </div>
    </div>
  );
}
