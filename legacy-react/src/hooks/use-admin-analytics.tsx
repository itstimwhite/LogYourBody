import { useState, useEffect, useCallback } from "react";
import { useSupabaseSubscription } from "./use-supabase-subscription";

export interface RevenueMetrics {
  currentMRR: number;
  previousMonthMRR: number;
  currentARR: number;
  projectedARR: number;
  growth: {
    percentage: number;
    absolute: number;
  };
  targetMRR: number;
  runway: number; // months
  burnRate: number; // monthly
}

export interface SubscriptionMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  trialUsers: number;
  churnRate: number;
  ltv: number; // Customer Lifetime Value
  cac: number; // Customer Acquisition Cost
  conversionRate: number; // Trial to paid conversion
  arpu: number; // Average Revenue Per User
}

export interface CohortData {
  month: string;
  newUsers: number;
  retained1m: number | null;
  retained3m: number | null;
  retained6m: number | null;
  revenue: number;
}

export interface FunnelMetrics {
  visitors: number;
  signups: number;
  trialStarts: number;
  conversions: number;
  conversionRate: number;
}

export interface AdminAnalytics {
  revenue: RevenueMetrics;
  subscriptions: SubscriptionMetrics;
  cohorts: CohortData[];
  funnel: FunnelMetrics;
  lastUpdated: Date;
}

// This would typically connect to your analytics service (Mixpanel, Amplitude, etc.)
// and RevenueCat webhooks for real-time subscription data
export function useAdminAnalytics() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscription } = useSupabaseSubscription();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would fetch from your analytics API
      // For now, we'll use mock data that would come from:
      // 1. RevenueCat webhooks for subscription metrics
      // 2. Supabase analytics for user data
      // 3. Google Analytics for funnel data
      // 4. Your own tracking for cohort analysis
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockData: AdminAnalytics = {
        revenue: {
          currentMRR: 8247.50,
          previousMonthMRR: 7850.32,
          currentARR: 98970,
          projectedARR: 125000,
          growth: {
            percentage: 5.1,
            absolute: 397.18
          },
          targetMRR: 10000,
          runway: 18,
          burnRate: 3200
        },
        subscriptions: {
          totalSubscribers: 342,
          activeSubscribers: 318,
          trialUsers: 67,
          churnRate: 4.2,
          ltv: 285.40,
          cac: 32.50,
          conversionRate: 12.4,
          arpu: 25.95
        },
        cohorts: [
          { month: "Jan 2025", newUsers: 45, retained1m: 89, retained3m: 67, retained6m: 45, revenue: 1167.5 },
          { month: "Feb 2025", newUsers: 52, retained1m: 92, retained3m: 71, retained6m: null, revenue: 1349 },
          { month: "Mar 2025", newUsers: 61, retained1m: 88, retained3m: 69, retained6m: null, revenue: 1583.5 },
          { month: "Apr 2025", newUsers: 58, retained1m: 91, retained3m: null, retained6m: null, revenue: 1504.5 },
          { month: "May 2025", newUsers: 67, retained1m: 85, retained3m: null, retained6m: null, revenue: 1738.5 },
          { month: "Jun 2025", newUsers: 74, retained1m: null, retained3m: null, retained6m: null, revenue: 1921 },
        ],
        funnel: {
          visitors: 12450,
          signups: 892,
          trialStarts: 267,
          conversions: 33,
          conversionRate: 12.4
        },
        lastUpdated: new Date()
      };

      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = useCallback(() => {
    return fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate derived metrics
  const progressToGoal = data ? (data.revenue.currentMRR / data.revenue.targetMRR) * 100 : 0;
  const remainingToGoal = data ? data.revenue.targetMRR - data.revenue.currentMRR : 0;
  const monthsToGoal = data && data.revenue.growth.absolute > 0 
    ? Math.ceil(remainingToGoal / data.revenue.growth.absolute) 
    : null;

  // Calculate LTV:CAC ratio
  const ltvCacRatio = data ? data.subscriptions.ltv / data.subscriptions.cac : 0;

  // Calculate net revenue retention (simplified)
  const netRevenueRetention = data 
    ? ((data.revenue.currentMRR - data.revenue.previousMonthMRR) / data.revenue.previousMonthMRR) * 100 + 100
    : 0;

  return {
    data,
    loading,
    error,
    refresh,
    metrics: {
      progressToGoal,
      remainingToGoal,
      monthsToGoal,
      ltvCacRatio,
      netRevenueRetention
    }
  };
}

// Hook for real-time subscription events (would integrate with RevenueCat webhooks)
export function useRealtimeSubscriptionEvents() {
  const [events, setEvents] = useState<Array<{
    id: string;
    type: 'new_subscription' | 'cancellation' | 'trial_started' | 'trial_converted';
    timestamp: Date;
    amount?: number;
    userId: string;
  }>>([]);

  useEffect(() => {
    // In a real implementation, this would connect to a WebSocket or Server-Sent Events
    // to receive real-time subscription events from RevenueCat webhooks
    
    const mockEvents = [
      {
        id: '1',
        type: 'new_subscription' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        amount: 9.99,
        userId: 'user_123'
      },
      {
        id: '2',
        type: 'trial_started' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        userId: 'user_456'
      }
    ];

    setEvents(mockEvents);
  }, []);

  return { events };
}

// Export helper functions for formatting
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const formatCompactNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};