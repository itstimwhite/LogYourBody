import { useState, useCallback, useMemo, useEffect } from "react";
import {
  SubscriptionInfo,
  SubscriptionStatus,
  BillingInfo,
} from "@/types/subscription";

// Mock subscription data for development
const mockSubscriptionData: SubscriptionInfo = {
  status: "trial",
  trialStartDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started 1 day ago
  trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ends in 2 days
  isTrialActive: true,
  daysRemainingInTrial: 2,
};

const mockBillingInfo: BillingInfo = {
  nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  paymentMethod: "Apple Pay",
  amount: 9.99,
  currency: "USD",
};

export function useSubscription() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo>(mockSubscriptionData);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(mockBillingInfo);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate trial status
  const calculateTrialStatus = useCallback(() => {
    if (!subscriptionInfo.trialStartDate || !subscriptionInfo.trialEndDate) {
      return { isTrialActive: false, daysRemainingInTrial: 0 };
    }

    const now = new Date();
    const trialEnd = subscriptionInfo.trialEndDate;
    const isTrialActive = now < trialEnd;
    const daysRemaining = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return { isTrialActive, daysRemainingInTrial: daysRemaining };
  }, [subscriptionInfo.trialStartDate, subscriptionInfo.trialEndDate]);

  // Check if user has access to app
  const hasAccess = useMemo(() => {
    const { isTrialActive } = calculateTrialStatus();
    return subscriptionInfo.status === "active" || isTrialActive;
  }, [subscriptionInfo.status, calculateTrialStatus]);

  // Check if trial is expired
  const isTrialExpired = useMemo(() => {
    const { isTrialActive } = calculateTrialStatus();
    return subscriptionInfo.status === "trial" && !isTrialActive;
  }, [subscriptionInfo.status, calculateTrialStatus]);

  // Initialize RevenueCat (mock implementation)
  const initializeRevenueCat = useCallback(async () => {
    setIsLoading(true);
    try {
      // In real implementation, initialize RevenueCat SDK here
      console.log("Initializing RevenueCat...");

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update subscription status
      const { isTrialActive, daysRemainingInTrial } = calculateTrialStatus();
      setSubscriptionInfo((prev) => ({
        ...prev,
        isTrialActive,
        daysRemainingInTrial,
      }));
    } catch (error) {
      console.error("Failed to initialize RevenueCat:", error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateTrialStatus]);

  // Start trial
  const startTrial = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      const newSubscriptionInfo: SubscriptionInfo = {
        status: "trial",
        trialStartDate: now,
        trialEndDate: trialEnd,
        isTrialActive: true,
        daysRemainingInTrial: 3,
      };

      setSubscriptionInfo(newSubscriptionInfo);
      console.log("Trial started");
    } catch (error) {
      console.error("Failed to start trial:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase subscription
  const purchaseSubscription = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      // In real implementation, call RevenueCat purchase method
      console.log("Purchasing subscription:", productId);

      // Mock purchase flow
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const now = new Date();
      const subscriptionEnd = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      ); // 30 days from now

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
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      // In real implementation, call RevenueCat restore method
      console.log("Restoring purchases...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  // Check subscription status on mount
  useEffect(() => {
    initializeRevenueCat();
  }, [initializeRevenueCat]);

  // Update trial status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const { isTrialActive, daysRemainingInTrial } = calculateTrialStatus();
      setSubscriptionInfo((prev) => ({
        ...prev,
        isTrialActive,
        daysRemainingInTrial,
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [calculateTrialStatus]);

  return {
    subscriptionInfo,
    billingInfo,
    isLoading,
    hasAccess,
    isTrialExpired,
    startTrial,
    purchaseSubscription,
    restorePurchases,
    cancelSubscription,
    initializeRevenueCat,
  };
}
