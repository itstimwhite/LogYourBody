import { useCallback } from "react";
import { track } from "@vercel/analytics";

// Custom analytics events for LogYourBody
export interface AnalyticsEvents {
  // User Authentication
  user_signup: {
    method: "email" | "google" | "apple";
    trial_started: boolean;
  };
  user_login: {
    method: "email" | "google" | "apple";
  };
  user_logout: Record<string, never>;

  // Body Metrics Tracking
  metric_added: {
    method: "dexa" | "scale" | "calipers" | "visual";
    body_fat_percentage: number;
    weight_kg: number;
  };

  // Subscription Events
  trial_started: {
    trial_duration_days: number;
  };
  subscription_viewed: {
    plan_type: "monthly" | "yearly";
  };
  subscription_purchased: {
    plan_type: "monthly" | "yearly";
    price: number;
    currency: string;
  };
  subscription_cancelled: {
    plan_type: "monthly" | "yearly";
    cancellation_reason?: string;
  };

  // App Usage
  page_view: {
    page: string;
    from_page?: string;
  };
  feature_used: {
    feature:
      | "avatar_toggle"
      | "units_change"
      | "photo_upload"
      | "settings_edit";
    value?: string | number;
  };

  // Support & Help
  support_contacted: {
    method: "email" | "help_button";
    page: string;
  };
}

export function useAnalytics() {
  // Track custom events with type safety
  const trackEvent = useCallback(
    <T extends keyof AnalyticsEvents>(
      event: T,
      properties: AnalyticsEvents[T],
    ) => {
      try {
        track(event, properties);
      } catch (error) {
        console.warn("Analytics tracking failed:", error);
      }
    },
    [],
  );

  // Specific tracking functions for common events
  const trackSignup = useCallback(
    (method: "email" | "google" | "apple", trialStarted: boolean = true) => {
      trackEvent("user_signup", { method, trial_started: trialStarted });
    },
    [trackEvent],
  );

  const trackLogin = useCallback(
    (method: "email" | "google" | "apple") => {
      trackEvent("user_login", { method });
    },
    [trackEvent],
  );

  const trackMetricAdded = useCallback(
    (
      method: "dexa" | "scale" | "calipers" | "visual",
      bodyFatPercentage: number,
      weightKg: number,
    ) => {
      trackEvent("metric_added", {
        method,
        body_fat_percentage: Math.round(bodyFatPercentage * 10) / 10,
        weight_kg: Math.round(weightKg * 10) / 10,
      });
    },
    [trackEvent],
  );

  const trackSubscriptionPurchase = useCallback(
    (
      planType: "monthly" | "yearly",
      price: number,
      currency: string = "USD",
    ) => {
      trackEvent("subscription_purchased", {
        plan_type: planType,
        price,
        currency,
      });
    },
    [trackEvent],
  );

  const trackFeatureUsage = useCallback(
    (
      feature:
        | "avatar_toggle"
        | "units_change"
        | "photo_upload"
        | "settings_edit",
      value?: string | number,
    ) => {
      trackEvent("feature_used", { feature, value });
    },
    [trackEvent],
  );

  const trackSupportContact = useCallback(
    (method: "email" | "help_button", page: string) => {
      trackEvent("support_contacted", { method, page });
    },
    [trackEvent],
  );

  const trackPageView = useCallback(
    (page: string, fromPage?: string) => {
      trackEvent("page_view", { page, from_page: fromPage });
    },
    [trackEvent],
  );

  return {
    trackEvent,
    trackSignup,
    trackLogin,
    trackMetricAdded,
    trackSubscriptionPurchase,
    trackFeatureUsage,
    trackSupportContact,
    trackPageView,
  };
}

// Performance monitoring utilities
export function usePerformanceTracking() {
  const trackPerformance = useCallback(
    (metricName: string, value: number, unit: string = "ms") => {
      try {
        // Track custom performance metrics
        track("performance_metric", {
          metric: metricName,
          value: Math.round(value * 100) / 100,
          unit,
        });
      } catch (error) {
        console.warn("Performance tracking failed:", error);
      }
    },
    [],
  );

  const trackLoadTime = useCallback(
    (pageName: string, loadTime: number) => {
      trackPerformance(`${pageName}_load_time`, loadTime, "ms");
    },
    [trackPerformance],
  );

  const trackInteraction = useCallback(
    (interaction: string, duration: number) => {
      trackPerformance(`${interaction}_duration`, duration, "ms");
    },
    [trackPerformance],
  );

  return {
    trackPerformance,
    trackLoadTime,
    trackInteraction,
  };
}
