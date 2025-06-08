import React from "react";
import { DashboardMetrics, UserProfile } from "@/types/bodymetrics";
import { cn } from "@/lib/utils";

interface MetricsPanelProps {
  metrics: DashboardMetrics;
  user: UserProfile;
  userAge: number;
  className?: string;
}

export function MetricsPanel({
  metrics,
  user,
  userAge,
  className,
}: MetricsPanelProps) {
  const formatWeight = (weight: number) => {
    // Convert from kg to lbs for display (can be made configurable)
    const lbs = weight * 2.20462;
    return `${Math.round(lbs)} lbs`;
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col justify-center space-y-6 p-6",
        className,
      )}
    >
      {/* Main metrics */}
      <div className="space-y-4">
        <div>
          <div className="text-3xl md:text-4xl font-bold text-white font-inter">
            {metrics.bodyFatPercentage.toFixed(1)}%
          </div>
          <div className="text-white/60 text-sm">Body Fat</div>
        </div>

        <div>
          <div className="text-3xl md:text-4xl font-bold text-white font-inter">
            {formatWeight(metrics.weight)}
          </div>
          <div className="text-white/60 text-sm">Weight</div>
        </div>

        <div>
          <div className="text-3xl md:text-4xl font-bold text-white font-inter">
            {metrics.ffmi}
          </div>
          <div className="text-white/60 text-sm">FFMI</div>
        </div>

        <div>
          <div className="text-3xl md:text-4xl font-bold text-white font-inter">
            {metrics.leanBodyMass} kg
          </div>
          <div className="text-white/60 text-sm">Lean Body Mass</div>
        </div>
      </div>

      {/* User info */}
      <div className="border-t border-white/10 pt-4 mt-auto">
        <div className="text-white/40 text-sm">
          {userAge}-year-old {user.gender}
        </div>
        <div className="text-white text-base font-medium">{user.name}</div>
      </div>
    </div>
  );
}
