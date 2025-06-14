import React, { useMemo, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { tw, getAnimation } from "@/styles/design-tokens";
import { BodyMetrics } from "@/types/bodymetrics";

interface TimelineSliderProps {
  metrics: BodyMetrics[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

interface TimelineState {
  selectedIndex: number;
  isDragging: boolean;
  announcement: string;
}

export const TimelineSlider = React.memo<TimelineSliderProps>(
  function TimelineSlider({
    metrics,
    selectedIndex,
    onIndexChange,
    className,
  }) {
    const fadeIn = getAnimation("fadeIn");
    const [state, setState] = useState<TimelineState>({
      selectedIndex,
      isDragging: false,
      announcement: "",
    });

    // Persist selected index to prevent resets
    useEffect(() => {
      setState((prev) => ({ ...prev, selectedIndex }));
    }, [selectedIndex]);

    const formatDate = useCallback((date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }, []);

    const formatDateLong = useCallback((date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }, []);

    const handleValueChange = useCallback(
      (value: number[]) => {
        const newIndex = value[0];
        setState((prev) => ({ ...prev, selectedIndex: newIndex }));
        onIndexChange(newIndex);

        // Create accessibility announcement
        const currentMetric = metrics[newIndex];
        if (currentMetric) {
          const announcement = `Entry ${newIndex + 1} of ${metrics.length}, ${formatDateLong(currentMetric.date)}`;
          setState((prev) => ({ ...prev, announcement }));
        }

        // Analytics event
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "timeline_changed", {
            event_category: "Profile",
            event_label: "Timeline Navigation",
            value: newIndex,
            custom_parameters: {
              total_entries: metrics.length,
              entry_date: currentMetric ? formatDate(currentMetric.date) : null,
            },
          });
        }
      },
      [metrics, onIndexChange, formatDate, formatDateLong],
    );

    const handleSliderStart = useCallback(() => {
      setState((prev) => ({ ...prev, isDragging: true }));
    }, []);

    const handleSliderEnd = useCallback(() => {
      setState((prev) => ({ ...prev, isDragging: false }));
    }, []);

    const selectedMetric = useMemo(
      () => metrics[state.selectedIndex],
      [metrics, state.selectedIndex],
    );

    // Early return if no metrics
    if (metrics.length === 0) {
      return null;
    }

    const currentDate = selectedMetric?.date;
    const minDate = metrics[0]?.date;
    const maxDate = metrics[metrics.length - 1]?.date;

    const sliderProps = {
      value: [state.selectedIndex],
      onValueChange: handleValueChange,
      onPointerDown: handleSliderStart,
      onPointerUp: handleSliderEnd,
      max: metrics.length - 1,
      min: 0,
      step: 1,
      "aria-label": `Timeline slider. Entry ${state.selectedIndex + 1} of ${metrics.length}`,
      "aria-valuetext": currentDate
        ? `${formatDateLong(currentDate)}, entry ${state.selectedIndex + 1} of ${metrics.length}`
        : undefined,
      "aria-describedby": "timeline-description",
    };

    return (
      <motion.div
        className={cn(
          "w-full border-t border-linear-border/50 bg-linear-bg shadow-sm",
          tw.safeArea,
          className,
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeIn}
      >
        {/* Safe area container */}
        <div className="px-4 py-3 md:px-6 md:py-6">
          <div className="space-y-3 md:space-y-4">
            {/* Current date and entry count */}
            <motion.div className="text-center" layout>
              <div
                className={cn(tw.timelineValue, "tracking-tight")}
                aria-live="polite"
                aria-atomic="true"
              >
                {currentDate ? formatDate(currentDate) : "No date"}
              </div>
              <div
                className={cn(tw.timelineLabel, "mt-1")}
                id="timeline-description"
              >
                Entry {state.selectedIndex + 1} of {metrics.length}
              </div>
            </motion.div>

            {/* Enhanced slider with better touch targets */}
            <div className="px-2 md:px-4">
              <div className="relative">
                <Slider
                  {...sliderProps}
                  className={cn(
                    "timeline-slider w-full",
                    "[&_[role=slider]]:h-6 [&_[role=slider]]:w-6", // 24pt thumb
                    "[&_[role=slider]]:border-2 [&_[role=slider]]:border-background",
                    "[&_[role=slider]]:shadow-lg [&_[role=slider]]:focus:shadow-xl",
                    "[&_.relative]:h-2", // 8pt track height
                  )}
                />

                {/* Tick marks for min/max */}
                {metrics.length > 1 && (
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 transform justify-between">
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Date range labels */}
            {metrics.length > 1 && minDate && maxDate && (
              <motion.div
                className="flex justify-between px-2 md:px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...fadeIn, delay: 0.2 }}
              >
                <span
                  className={cn(tw.timelineLabel, "text-left")}
                  aria-label={`Earliest entry: ${formatDateLong(minDate)}`}
                >
                  {formatDate(minDate)}
                </span>
                <span
                  className={cn(tw.timelineLabel, "text-right")}
                  aria-label={`Latest entry: ${formatDateLong(maxDate)}`}
                >
                  {formatDate(maxDate)}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {state.announcement}
        </div>
      </motion.div>
    );
  },
);

// Custom hook for timeline analytics
export const useTimelineAnalytics = (
  metrics: BodyMetrics[],
  selectedIndex: number,
) => {
  useEffect(() => {
    // Track when timeline is viewed
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "timeline_viewed", {
        event_category: "Profile",
        event_label: "Timeline Interaction",
        custom_parameters: {
          total_entries: metrics.length,
          current_index: selectedIndex,
          has_multiple_entries: metrics.length > 1,
        },
      });
    }
  }, [metrics.length, selectedIndex]);
};

// Hook for timeline accessibility enhancements
export const useTimelineAccessibility = (
  metrics: BodyMetrics[],
  selectedIndex: number,
) => {
  const [hasAnnounced, setHasAnnounced] = useState(false);

  useEffect(() => {
    if (metrics.length > 0 && !hasAnnounced) {
      const announcement = `Timeline with ${metrics.length} entries loaded. Use left and right arrow keys to navigate between entries.`;

      // Announce timeline availability
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
        setHasAnnounced(true);

        setTimeout(() => {
          document.body.removeChild(liveRegion);
        }, 2000);
      }, 500);
    }
  }, [metrics.length, hasAnnounced]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target &&
        (event.target as HTMLElement).getAttribute("role") === "slider"
      ) {
        // Let the slider handle arrow keys naturally
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
