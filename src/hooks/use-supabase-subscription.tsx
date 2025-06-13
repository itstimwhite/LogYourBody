import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeQuery } from "./use-safe-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  SubscriptionInfo,
  SubscriptionStatus,
  BillingInfo,
} from "@/types/subscription";

export function useSupabaseSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize state variables
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    status: "trial",
    isTrialActive: false,
    daysRemainingInTrial: 0,
  });
  
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);

  // Fetch subscription data with caching
  const fetchSubscriptionData = async () => {
    if (!user?.id) return null;
    
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  };

  const subscriptionQuery = useSafeQuery({
    queryKey: ["subscription", user?.id],
    queryFn: fetchSubscriptionData,
    enabled: !!user?.id,
  });

  const subscriptionData = subscriptionQuery.data;
  const loading = subscriptionQuery.isLoading;

  // Calculate trial status
  const calculateTrialStatus = useCallback((trialEndDate?: Date) => {
    if (!trialEndDate) {
      return { isTrialActive: false, daysRemainingInTrial: 0 };
    }

    const now = new Date();
    const isTrialActive = now < trialEndDate;
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    return { isTrialActive, daysRemainingInTrial: daysRemaining };
  }, []);

  // Start trial
  const startTrial = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      const { error } = await supabase.from("subscriptions").upsert({
        user_id: user.id,
        status: "trial",
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
      });

      if (error) {
        console.error("Error starting trial:", error);
        return;
      }

      const newSubscriptionInfo: SubscriptionInfo = {
        status: "trial",
        trialStartDate: now,
        trialEndDate: trialEnd,
        isTrialActive: true,
        daysRemainingInTrial: 3,
      };

      setSubscriptionInfo(newSubscriptionInfo);
    } catch (error) {
      console.error("Failed to start trial:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscriptionData) {
        const trialStartDate = subscriptionData.trial_start_date
          ? new Date(subscriptionData.trial_start_date)
          : undefined;
        const trialEndDate = subscriptionData.trial_end_date
          ? new Date(subscriptionData.trial_end_date)
          : undefined;
        const subscriptionStartDate = subscriptionData.subscription_start_date
          ? new Date(subscriptionData.subscription_start_date)
          : undefined;
        const subscriptionEndDate = subscriptionData.subscription_end_date
          ? new Date(subscriptionData.subscription_end_date)
          : undefined;

        const { isTrialActive, daysRemainingInTrial } =
          calculateTrialStatus(trialEndDate);

        setSubscriptionInfo({
          status: subscriptionData.status,
          trialStartDate,
          trialEndDate,
          subscriptionStartDate,
          subscriptionEndDate,
          productId: subscriptionData.product_id,
          isTrialActive,
          daysRemainingInTrial,
        });

        // Set billing info if active subscription
        if (subscriptionData.status === "active" && subscriptionEndDate) {
          setBillingInfo({
            nextBillingDate: subscriptionEndDate,
            lastPaymentDate: subscriptionStartDate,
            paymentMethod: "Apple Pay", // This would come from RevenueCat
            amount: subscriptionData.product_id?.includes("yearly")
              ? 79.99
              : 9.99,
            currency: "USD",
          });
        }
      } else {
        // No subscription record found - automatically start trial for new user
        console.log("No subscription found, starting trial for new user");
        await startTrial();
      }
    } catch (error) {
      console.error("Error loading subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateTrialStatus, startTrial]);

  // Check if user has access to app
  const hasAccess = useMemo(() => {
    return (
      subscriptionInfo.status === "active" || subscriptionInfo.isTrialActive
    );
  }, [subscriptionInfo.status, subscriptionInfo.isTrialActive]);

  // Check if trial is expired
  const isTrialExpired = useMemo(() => {
    return (
      subscriptionInfo.status === "trial" && !subscriptionInfo.isTrialActive
    );
  }, [subscriptionInfo.status, subscriptionInfo.isTrialActive]);

  // Purchase subscription
  const purchaseSubscription = useCallback(
    async (productId: string) => {
      if (!user)
        return { success: false, error: new Error("User not authenticated") };

      setIsLoading(true);
      try {
        // In real implementation, call RevenueCat purchase method here
        console.log("Purchasing subscription:", productId);

        // Mock purchase flow - replace with actual RevenueCat integration
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const now = new Date();
        const subscriptionEnd = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        ); // 30 days from now

        const { error } = await supabase.from("subscriptions").upsert({
          user_id: user.id,
          status: "active",
          subscription_start_date: now.toISOString(),
          subscription_end_date: subscriptionEnd.toISOString(),
          product_id: productId,
        });

        if (error) {
          console.error("Error updating subscription:", error);
          return { success: false, error };
        }

        setSubscriptionInfo({
          status: "active",
          subscriptionStartDate: now,
          subscriptionEndDate: subscriptionEnd,
          productId,
          isTrialActive: false,
          daysRemainingInTrial: 0,
        });

        setBillingInfo({
          nextBillingDate: subscriptionEnd,
          lastPaymentDate: now,
          paymentMethod: "Apple Pay",
          amount: productId.includes("yearly") ? 79.99 : 9.99,
          currency: "USD",
        });

        return { success: true };
      } catch (error) {
        console.error("Purchase failed:", error);
        return { success: false, error: error as Error };
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      // In real implementation, call RevenueCat restore method
      console.log("Restoring purchases...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reload subscription data from database
      await loadSubscriptionData();

      return { success: true };
    } catch (error) {
      console.error("Restore failed:", error);
      return { success: false, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    // This would redirect to platform-specific subscription management
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? "https://apps.apple.com/account/subscriptions"
      : "https://play.google.com/store/account/subscriptions";

    window.open(url, "_blank");
  }, []);

  // Load subscription data on mount
  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user, loadSubscriptionData]);

  // Update subscription status periodically
  useEffect(() => {
    if (!subscriptionInfo.trialEndDate) return;

    const interval = setInterval(() => {
      const { isTrialActive, daysRemainingInTrial } = calculateTrialStatus(
        subscriptionInfo.trialEndDate,
      );
      setSubscriptionInfo((prev) => ({
        ...prev,
        isTrialActive,
        daysRemainingInTrial,
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [subscriptionInfo.trialEndDate, calculateTrialStatus]);

  return {
    subscriptionInfo,
    billingInfo,
    isLoading,
    loading,
    hasAccess,
    isTrialExpired,
    startTrial,
    purchaseSubscription,
    restorePurchases,
    cancelSubscription,
  };
}
