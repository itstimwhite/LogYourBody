import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ANALYTICS_CONFIG, shouldTrackAnalytics } from "@/lib/analytics-config";

export function VercelAnalytics() {
  // Check if analytics should be enabled based on privacy settings
  const trackingEnabled = shouldTrackAnalytics();

  if (!trackingEnabled) {
    return null;
  }

  return (
    <>
      {/* Vercel Analytics - Track page views, user interactions, and conversions */}
      <Analytics
        mode={import.meta.env.PROD ? "production" : "development"}
        debug={ANALYTICS_CONFIG.vercel.debug}
      />

      {/* Vercel Speed Insights - Monitor Core Web Vitals and performance metrics */}
      <SpeedInsights
        debug={
          ANALYTICS_CONFIG.speedInsights.customMetrics.length > 0 &&
          import.meta.env.DEV
        }
      />
    </>
  );
}
