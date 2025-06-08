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
        "h-full flex flex-col justify-center space-y-8 p-8",
        className,
      )}
    >
      {/* Main metrics */}
      <div className="space-y-6">
        <div>
          <div className="text-4xl md:text-5xl font-bold text-foreground font-inter tracking-tight">
            {metrics.bodyFatPercentage.toFixed(1)}%
          </div>
          <div className="text-muted-foreground text-sm font-medium mt-1 tracking-wide uppercase">
            Body Fat
          </div>
        </div>

        <div>
          <div className="text-4xl md:text-5xl font-bold text-foreground font-inter tracking-tight">
            {formatWeight(metrics.weight)}
          </div>
          <div className="text-muted-foreground text-sm font-medium mt-1 tracking-wide uppercase">
            Weight
          </div>
        </div>

        <div>
          <div className="text-4xl md:text-5xl font-bold text-foreground font-inter tracking-tight">
            {metrics.ffmi}
          </div>
          <div className="text-muted-foreground text-sm font-medium mt-1 tracking-wide uppercase">
            FFMI
          </div>
        </div>

        <div>
          <div className="text-4xl md:text-5xl font-bold text-foreground font-inter tracking-tight">
            {metrics.leanBodyMass} kg
          </div>
          <div className="text-muted-foreground text-sm font-medium mt-1 tracking-wide uppercase">
            Lean Body Mass
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="border-t border-border pt-6 mt-auto">
        <div className="text-muted-foreground text-sm font-medium">
          {userAge}-year-old {user.gender}
        </div>
        <div className="text-foreground text-lg font-semibold mt-1">
          {user.name}
        </div>
      </div>
    </div>
  );
}
