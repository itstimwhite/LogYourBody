import { useEffect } from "react";
import { usePerformanceTracking } from "@/hooks/use-analytics";

export function PerformanceMonitor() {
  const { trackLoadTime, trackPerformance } = usePerformanceTracking();

  useEffect(() => {
    // Track initial page load performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track navigation timing
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;

          // Track key performance metrics
          trackPerformance(
            "ttfb",
            navEntry.responseStart - navEntry.requestStart,
          );
          trackPerformance(
            "dom_content_loaded",
            navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
          );
          trackPerformance(
            "load_complete",
            navEntry.loadEventEnd - navEntry.loadEventStart,
          );
        }

        // Track paint timing
        if (entry.entryType === "paint") {
          const paintEntry = entry as PerformancePaintTiming;
          trackPerformance(
            paintEntry.name.replace("-", "_"),
            paintEntry.startTime,
          );
        }

        // Track largest contentful paint
        if (entry.entryType === "largest-contentful-paint") {
          trackPerformance("largest_contentful_paint", entry.startTime);
        }

        // Track first input delay
        if (entry.entryType === "first-input") {
          const fidEntry = entry as PerformanceEventTiming;
          trackPerformance(
            "first_input_delay",
            fidEntry.processingStart - fidEntry.startTime,
          );
        }

        // Track layout shifts
        if (
          entry.entryType === "layout-shift" &&
          !(entry as any).hadRecentInput
        ) {
          trackPerformance("cumulative_layout_shift", (entry as any).value);
        }
      }
    });

    // Observe different types of performance entries
    try {
      observer.observe({
        entryTypes: [
          "navigation",
          "paint",
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
        ],
      });
    } catch (error) {
      console.warn("Performance observer not supported:", error);
    }

    // Track page load time when component mounts
    const startTime = performance.now();

    const trackPageLoad = () => {
      const loadTime = performance.now() - startTime;
      trackLoadTime(window.location.pathname, loadTime);
    };

    // Track when page is fully loaded
    if (document.readyState === "complete") {
      trackPageLoad();
    } else {
      window.addEventListener("load", trackPageLoad);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("load", trackPageLoad);
    };
  }, [trackLoadTime, trackPerformance]);

  // Track Core Web Vitals using the web-vitals library pattern
  useEffect(() => {
    // Function to track web vitals
    const trackWebVital = (metric: any) => {
      trackPerformance(metric.name, metric.value, metric.unit || "ms");
    };

    // Import and use web-vitals if available
    const loadWebVitals = async () => {
      try {
        // Note: You might want to install web-vitals package for more accurate measurements
        // For now, we'll use the Performance Observer API directly
        console.log("Performance monitoring initialized for LogYourBody");
      } catch (error) {
        console.warn("Web vitals tracking not available:", error);
      }
    };

    loadWebVitals();
  }, [trackPerformance]);

  return null; // This component doesn't render anything
}

// Custom hook for tracking component-specific performance
export function useComponentPerformance(componentName: string) {
  const { trackPerformance } = usePerformanceTracking();

  const trackRender = () => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      trackPerformance(`${componentName}_render_time`, renderTime);
    };
  };

  const trackInteraction = (interactionName: string) => {
    const startTime = performance.now();

    return () => {
      const interactionTime = performance.now() - startTime;
      trackPerformance(
        `${componentName}_${interactionName}_time`,
        interactionTime,
      );
    };
  };

  return {
    trackRender,
    trackInteraction,
  };
}
