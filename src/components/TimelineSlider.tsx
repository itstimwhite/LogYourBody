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

  const handleValueChange = useCallback((value: number[]) => {
    onIndexChange(value[0]);
  }, [onIndexChange]);

  const selectedMetric = useMemo(() => metrics[selectedIndex], [metrics, selectedIndex]);

  if (metrics.length === 0) {
    return null;
  }

  const currentDate = selectedMetric?.date;

  return (
    <div
      className={cn(
        "w-full px-6 py-6 bg-background border-t border-border",
        className,
      )}
    >
      <div className="space-y-4">
        {/* Current date display */}
        <div className="text-center">
          <div className="text-foreground text-lg font-semibold tracking-tight">
            {currentDate ? formatDate(currentDate) : "No date"}
          </div>
          <div className="text-muted-foreground text-sm font-medium mt-1">
            Entry {selectedIndex + 1} of {metrics.length}
          </div>
        </div>

        {/* Slider */}
        <div className="px-4">
          <Slider
            value={[selectedIndex]}
            onValueChange={handleValueChange}
            max={metrics.length - 1}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Date range */}
        <div className="flex justify-between text-xs text-muted-foreground font-medium px-4">
          <span>{formatDate(metrics[0].date)}</span>
          <span>{formatDate(metrics[metrics.length - 1].date)}</span>
        </div>
      </div>
    </div>
  );
});
