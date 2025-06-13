import React, { useMemo, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { BodyMetrics } from "@/types/bodymetrics";
import { cn } from "@/lib/utils";

interface TimelineSliderProps {
  metrics: BodyMetrics[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export const TimelineSlider = React.memo(function TimelineSlider({
  metrics,
  selectedIndex,
  onIndexChange,
  className,
}: TimelineSliderProps) {
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleValueChange = useCallback(
    (value: number[]) => {
      onIndexChange(value[0]);
    },
    [onIndexChange],
  );

  const selectedMetric = useMemo(
    () => metrics[selectedIndex],
    [metrics, selectedIndex],
  );

  if (metrics.length === 0) {
    return null;
  }

  const currentDate = selectedMetric?.date;

  return (
    <div
      className={cn(
        "w-full border-t border-border/50 bg-background px-4 py-2 shadow-sm md:px-6 md:py-6",
        className,
      )}
    >
      <div className="space-y-2 md:space-y-4">
        {/* Current date display - Centered with smaller font on mobile */}
        <div className="text-center">
          <div className="text-base font-semibold tracking-tight text-foreground md:text-lg">
            {currentDate ? formatDate(currentDate) : "No date"} / Entry{" "}
            {selectedIndex + 1} of {metrics.length}
          </div>
        </div>

        {/* Slider */}
        <div className="px-2 md:px-4">
          <Slider
            value={[selectedIndex]}
            onValueChange={handleValueChange}
            max={metrics.length - 1}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Date range - Smaller, subtler font */}
        <div className="flex justify-between px-2 text-xs font-normal text-muted-foreground/70 md:px-4">
          <span>{formatDate(metrics[0].date)}</span>
          <span>{formatDate(metrics[metrics.length - 1].date)}</span>
        </div>
      </div>
    </div>
  );
});
