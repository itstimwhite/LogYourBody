import React from "react";
import { DashboardMetrics, UserProfile } from "@/types/bodymetrics";
import { cn } from "@/lib/utils";

interface MetricsPanelProps {
  metrics: DashboardMetrics;
  user: UserProfile;
  userAge: number;
  formattedWeight: string;
  formattedHeight: string;
  formattedLeanBodyMass: string;
  className?: string;
  showPhoto?: boolean;
}

export const MetricsPanel = React.memo(function MetricsPanel({
  metrics,
  user,
  userAge,
  formattedWeight,
  formattedHeight,
  formattedLeanBodyMass,
  className,
  showPhoto,
}: MetricsPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-center p-3 md:p-6 lg:p-8",
        className,
      )}
    >
      {/* Main metrics - 2x2 Grid on mobile, vertical stack on desktop */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:mb-8 md:flex md:flex-col md:gap-4 lg:gap-6">
        {/* Body Fat */}
        <div className="text-right md:text-left">
          <div className="font-inter text-xl font-bold tracking-tight text-white md:text-2xl lg:text-4xl xl:text-5xl">
            {(metrics.bodyFatPercentage || 0).toFixed(1)}%
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/80 md:text-sm">
            Body Fat
          </div>
        </div>

        {/* Weight */}
        <div className="text-right md:text-left">
          <div className="font-inter text-xl font-bold tracking-tight text-white md:text-2xl lg:text-4xl xl:text-5xl">
            {formattedWeight}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/80 md:text-sm">
            Weight
          </div>
        </div>

        {/* FFMI */}
        <div className="text-right md:text-left">
          <div className="font-inter text-xl font-bold tracking-tight text-white md:text-2xl lg:text-4xl xl:text-5xl">
            {metrics.ffmi}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/80 md:text-sm">
            FFMI
          </div>
        </div>

        {/* Lean Body Mass */}
        <div className="text-right md:text-left">
          <div className="font-inter text-xl font-bold tracking-tight text-white md:text-2xl lg:text-4xl xl:text-5xl">
            {formattedLeanBodyMass}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/80 md:text-sm">
            Lean Body Mass
          </div>
        </div>
      </div>

      {/* User info - Single row with three equal cells */}
      <div className="mt-auto border-t border-border pt-3 md:pt-6">
        <div className="mb-2 text-sm font-semibold text-white md:mb-3 md:text-base lg:text-lg">
          {user.name}
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs md:text-sm">
          <div className="text-center md:text-left">
            <div className="mb-1 font-medium uppercase tracking-[0.1em] text-white/80">
              Age
            </div>
            <div className="font-medium text-white">{userAge}</div>
          </div>
          <div className="text-center md:text-left">
            <div className="mb-1 font-medium uppercase tracking-[0.1em] text-white/80">
              Height
            </div>
            <div className="font-medium text-white">{formattedHeight}</div>
          </div>
          <div className="text-center md:text-left">
            <div className="mb-1 font-medium uppercase tracking-[0.1em] text-white/80">
              Sex
            </div>
            <div className="font-medium capitalize text-white">
              {user.gender}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
