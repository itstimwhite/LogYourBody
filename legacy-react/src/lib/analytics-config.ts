// Analytics configuration for LogYourBody
export const ANALYTICS_CONFIG = {
  // Vercel Analytics settings
  vercel: {
    // Track events in development for testing
    enabled: true,
    debug: import.meta.env.DEV,

    // Custom events to track
    events: {
      // User journey events
      onboarding_completed: "Onboarding Completed",
      trial_conversion: "Trial Converted to Paid",
      subscription_renewal: "Subscription Renewed",

      // Feature adoption
      first_metric_logged: "First Metric Logged",
      photo_uploaded: "Photo Uploaded",
      health_sync_enabled: "Health Sync Enabled",

      // Engagement metrics
      daily_active_user: "Daily Active User",
      weekly_active_user: "Weekly Active User",
      session_duration: "Session Duration",
    },
  },

  // Page Speed Insights settings
  speedInsights: {
    // Core Web Vitals thresholds
    thresholds: {
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100, // First Input Delay (ms)
      cls: 0.1, // Cumulative Layout Shift
      fcp: 1800, // First Contentful Paint (ms)
      ttfb: 800, // Time to First Byte (ms)
    },

    // Custom metrics to track
    customMetrics: [
      "dashboard_render_time",
      "avatar_load_time",
      "metrics_calculation_time",
      "modal_open_time",
    ],
  },

  // Privacy and GDPR compliance
  privacy: {
    // Anonymize IP addresses
    anonymizeIp: true,

    // Respect Do Not Track
    respectDnt: true,

    // Cookie consent (if needed)
    requireConsent: false, // Set to true if targeting EU users

    // Data retention period
    dataRetentionDays: 365,
  },

  // Error tracking
  errorTracking: {
    enabled: true,
    sampleRate: 1.0, // Track all errors in production

    // Sensitive data to exclude from error reports
    excludeFields: ["password", "email", "personalData", "authToken"],
  },
};

// Helper function to check if analytics should be enabled
export function shouldTrackAnalytics(): boolean {
  // Check for Do Not Track header
  if (navigator.doNotTrack === "1") {
    return false;
  }

  // Check for local development
  if (import.meta.env.DEV && !ANALYTICS_CONFIG.vercel.debug) {
    return false;
  }

  // Check for consent (if required)
  if (ANALYTICS_CONFIG.privacy.requireConsent) {
    return localStorage.getItem("analytics-consent") === "true";
  }

  return true;
}

// Set analytics consent
export function setAnalyticsConsent(consent: boolean): void {
  localStorage.setItem("analytics-consent", consent.toString());

  if (consent) {
    console.log("Analytics consent granted");
  } else {
    console.log("Analytics consent denied");
  }
}
