import { useState, useEffect, useCallback } from 'react';
import { 
  Purchases,
  PurchasesPackage, 
  CustomerInfo, 
  PurchasesOffering 
} from '@revenuecat/purchases-js';
import { useAuth } from '@/contexts/AuthContext';

interface RevenueCatState {
  isConfigured: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering[] | null;
  error: string | null;
}

interface RevenueCatActions {
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<CustomerInfo>;
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
        const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
        
        if (!apiKey || apiKey === 'pk_your_public_key_here' || apiKey.startsWith('strp_') || apiKey.startsWith('sk_')) {
          console.warn('RevenueCat: Invalid or missing API key. Please add a valid RevenueCat public key to your .env file');
          console.warn('RevenueCat: Expected format: pk_xxx or appl_xxx (public key), but got:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
          if (apiKey && apiKey.startsWith('sk_')) {
            console.warn('RevenueCat: You are using a SECRET key (sk_). Please use the PUBLIC key instead for security reasons.');
          }
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'RevenueCat API key not configured',
          }));
          return;
        }

        console.log('Initializing RevenueCat with API key:', apiKey.substring(0, 10) + '...');

        // Configure RevenueCat
        await Purchases.configure({
          apiKey,
          // Set user ID if authenticated
          appUserID: user?.id || undefined,
        });

        // Get initial customer info
        const customerInfo = await Purchases.getCustomerInfo();
        
        setState(prev => ({
          ...prev,
          isConfigured: true,
          isLoading: false,
          customerInfo,
          error: null,
        }));

      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize RevenueCat',
        }));
      }
    };

    initializeRevenueCat();
  }, [user?.id]);

  // Purchase a package
  const purchasePackage = useCallback(async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      setState(prev => ({
        ...prev,
        customerInfo,
        isLoading: false,
      }));
      
      return customerInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const customerInfo = await Purchases.restorePurchases();
      
      setState(prev => ({
        ...prev,
        customerInfo,
        isLoading: false,
      }));
      
      return customerInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Restore failed';
      setState(prev => ({
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
      
      setState(prev => ({
        ...prev,
        offerings: offeringsArray,
      }));
      
      return offeringsArray;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get offerings';
      setState(prev => ({
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
export const hasActiveSubscription = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;
  
  const entitlements = customerInfo.entitlements.active;
  return Object.keys(entitlements).length > 0;
};

export const hasProFeatures = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;
  
  return !!(
    customerInfo.entitlements.active['pro_features'] &&
    customerInfo.entitlements.active['pro_features'].isActive
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

  const proEntitlement = customerInfo.entitlements.active['pro_features'];
  
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
    isInTrial: proEntitlement.willRenew && proEntitlement.periodType === 'trial',
    willRenew: proEntitlement.willRenew,
    expirationDate: proEntitlement.expirationDate,
    productIdentifier: proEntitlement.productIdentifier,
  };
};