import { useState, useEffect, useCallback } from "react";
import {
  Purchases,
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from "@revenuecat/purchases-js";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

interface RevenueCatState {
  isConfigured: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering[] | null;
  error: string | null;
}

interface RevenueCatActions {
  purchasePackage: (
    packageToPurchase: PurchasesPackage,
  ) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
  getOfferings: () => Promise<PurchasesOffering[]>;
}

export function useRevenueCat(): RevenueCatState & RevenueCatActions {
  const { user } = useAuth();
  const [state, setState] = useState<RevenueCatState>({
    isConfigured: false,
    isLoading: true,
    customerInfo: null,
    offerings: null,
    error: null,
  });

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // Use platform-specific API keys - use Capacitor for more reliable platform detection
        const isIOS =
          Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
        const rcKey = isIOS
          ? import.meta.env.VITE_REVENUECAT_IOS_KEY
          : import.meta.env.VITE_REVENUECAT_WEB_KEY;

        if (!rcKey) {
          throw new Error(
            `RevenueCat ${isIOS ? "iOS" : "Web"} public key not set`,
          );
        }

        // Validate key format - must be public key, not secret
        if (rcKey.startsWith("sk_")) {
          throw new Error(
            "RevenueCat secret key detected. Please use the public key",
          );
        }

        // iOS keys start with 'appl_', Web keys start with 'strp_' or 'public_'
        if (isIOS && !rcKey.startsWith("appl_")) {
          throw new Error(
            "Invalid iOS RevenueCat key format. Should start with 'appl_'",
          );
        }

        if (
          !isIOS &&
          !rcKey.startsWith("strp_") &&
          !rcKey.startsWith("public_")
        ) {
          throw new Error(
            "Invalid Web RevenueCat key format. Should start with 'strp_' or 'public_'",
          );
        }

        console.log(
          `Initializing RevenueCat for ${isIOS ? "iOS" : "Web"} with key:`,
          rcKey.substring(0, 10) + "...",
        );

        // Configure RevenueCat with validated public key
        await Purchases.configure({
          apiKey: rcKey,
          // Set user ID if authenticated
          appUserID: user?.id || undefined,
        });

        // Get initial customer info
        const customerInfo = await Purchases.getCustomerInfo();

        setState((prev) => ({
          ...prev,
          isConfigured: true,
          isLoading: false,
          customerInfo,
          error: null,
        }));
      } catch (error) {
        console.error("Failed to initialize RevenueCat:", error);

        // Log additional error details for debugging
        if (error && typeof error === "object" && "code" in error) {
          console.error("RevenueCat error code:", (error as any).code);
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize RevenueCat",
        }));
      }
    };

    initializeRevenueCat();
  }, [user?.id]);

  // Purchase a package
  const purchasePackage = useCallback(
    async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const { customerInfo } =
          await Purchases.purchasePackage(packageToPurchase);

        setState((prev) => ({
          ...prev,
          customerInfo,
          isLoading: false,
        }));

        return customerInfo;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Purchase failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [],
  );

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const customerInfo = await Purchases.restorePurchases();

      setState((prev) => ({
        ...prev,
        customerInfo,
        isLoading: false,
      }));

      return customerInfo;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Restore failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Get offerings
  const getOfferings = useCallback(async (): Promise<PurchasesOffering[]> => {
    try {
      const offerings = await Purchases.getOfferings();
      const offeringsArray = Object.values(offerings.all);

      setState((prev) => ({
        ...prev,
        offerings: offeringsArray,
      }));

      return offeringsArray;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get offerings";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    purchasePackage,
    restorePurchases,
    getOfferings,
  };
}

// Helper functions for subscription status
export const hasActiveSubscription = (
  customerInfo: CustomerInfo | null,
): boolean => {
  if (!customerInfo) return false;

  const entitlements = customerInfo.entitlements.active;
  return Object.keys(entitlements).length > 0;
};

export const hasProFeatures = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;

  return !!(
    customerInfo.entitlements.active["pro_features"] &&
    customerInfo.entitlements.active["pro_features"].isActive
  );
};

export const getSubscriptionStatus = (customerInfo: CustomerInfo | null) => {
  if (!customerInfo) {
    return {
      isActive: false,
      isInTrial: false,
      willRenew: false,
      expirationDate: null,
      productIdentifier: null,
    };
  }

  const proEntitlement = customerInfo.entitlements.active["pro_features"];

  if (!proEntitlement) {
    return {
      isActive: false,
      isInTrial: false,
      willRenew: false,
      expirationDate: null,
      productIdentifier: null,
    };
  }

  return {
    isActive: proEntitlement.isActive,
    isInTrial:
      proEntitlement.willRenew && proEntitlement.periodType === "trial",
    willRenew: proEntitlement.willRenew,
    expirationDate: proEntitlement.expirationDate,
    productIdentifier: proEntitlement.productIdentifier,
  };
};
