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
        "h-full w-full flex flex-col justify-center p-3 md:p-6 lg:p-8",
        className,
      )}
    >
      {/* Main metrics - 2x2 Grid on mobile, vertical stack on desktop */}
      <div className="grid grid-cols-2 md:flex md:flex-col gap-4 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        {/* Body Fat */}
        <div className="text-right md:text-left">
          <div className="text-white text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold font-inter tracking-tight">
            {(metrics.bodyFatPercentage || 0).toFixed(1)}%
          </div>
          <div className="text-white/80 text-xs md:text-sm font-medium mt-1 tracking-[0.1em] uppercase">
            Body Fat
          </div>
        </div>

        {/* Weight */}
        <div className="text-right md:text-left">
          <div className="text-white text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold font-inter tracking-tight">
            {formattedWeight}
          </div>
          <div className="text-white/80 text-xs md:text-sm font-medium mt-1 tracking-[0.1em] uppercase">
            Weight
          </div>
        </div>

        {/* FFMI */}
        <div className="text-right md:text-left">
          <div className="text-white text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold font-inter tracking-tight">
            {metrics.ffmi}
          </div>
          <div className="text-white/80 text-xs md:text-sm font-medium mt-1 tracking-[0.1em] uppercase">
            FFMI
          </div>
        </div>

        {/* Lean Body Mass */}
        <div className="text-right md:text-left">
          <div className="text-white text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold font-inter tracking-tight">
            {formattedLeanBodyMass}
          </div>
          <div className="text-white/80 text-xs md:text-sm font-medium mt-1 tracking-[0.1em] uppercase">
            Lean Body Mass
          </div>
        </div>
      </div>

      {/* User info - Single row with three equal cells */}
      <div className="border-t border-border pt-3 md:pt-6 mt-auto">
        <div className="text-white text-sm md:text-base lg:text-lg font-semibold mb-2 md:mb-3">{user.name}</div>
        <div className="grid grid-cols-3 gap-4 text-xs md:text-sm">
          <div className="text-center md:text-left">
            <div className="text-white/80 font-medium uppercase tracking-[0.1em] mb-1">
              Age
            </div>
            <div className="text-white font-medium">{userAge}</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-white/80 font-medium uppercase tracking-[0.1em] mb-1">
              Height
            </div>
            <div className="text-white font-medium">{formattedHeight}</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-white/80 font-medium uppercase tracking-[0.1em] mb-1">
              Sex
            </div>
            <div className="text-white font-medium capitalize">
              {user.gender}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
