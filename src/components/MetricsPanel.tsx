import React from "react";
import { DashboardMetrics, UserProfile } from "@/types/bodymetrics";
import { cn } from "@/lib/utils";

interface MetricsPanelProps {
  metrics: DashboardMetrics;
  user: UserProfile;
  userAge: number;
  formattedWeight: string;
  formattedHeight: string;
  className?: string;
}

export function MetricsPanel({ metrics, user, userAge, formattedWeight, formattedHeight, className }: MetricsPanelProps) {
  metrics,
  user,
  userAge,
  formattedWeight,
  className,
}: MetricsPanelProps) {
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
            {formattedWeight}
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
            {metrics.leanBodyMass}
          </div>
          <div className="text-muted-foreground text-sm font-medium mt-1 tracking-wide uppercase">Lean Body Mass (kg)</div>
        </div>
      </div>

      {/* User info - Horizontal Layout */}
      <div className="border-t border-border pt-6 mt-auto space-y-3">
        <div className="text-foreground text-lg font-semibold">
          {user.name}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground font-medium uppercase tracking-wide">Age</div>
            <div className="text-foreground font-medium">{userAge}</div>
          </div>
          <div>
            <div className="text-muted-foreground font-medium uppercase tracking-wide">Height</div>
            <div className="text-foreground font-medium">{formattedHeight}</div>
          </div>
          <div>
            <div className="text-muted-foreground font-medium uppercase tracking-wide">Sex</div>
            <div className="text-foreground font-medium capitalize">{user.gender}</div>
          </div>
        </div>
      </div>
    </div>
  );
}