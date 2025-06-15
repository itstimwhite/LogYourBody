export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  productId?: string;
  isTrialActive: boolean;
  daysRemainingInTrial: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
  revenueCatProductId: string;
}

export interface BillingInfo {
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$9.99",
    period: "monthly",
    features: [
      "Unlimited body measurements",
      "Advanced analytics & trends",
      "Photo progress tracking",
      "Health app sync",
      "Export data",
      "Priority support",
    ],
    revenueCatProductId: "logyourbody_monthly",
  },
  {
    id: "yearly",
    name: "Annual",
    price: "$69.99",
    period: "yearly",
    features: [
      "Unlimited body measurements",
      "Advanced analytics & trends",
      "Photo progress tracking",
      "Health app sync",
      "Export data",
      "Priority support",
      "Save 42% vs monthly",
    ],
    isPopular: true,
    revenueCatProductId: "logyourbody_yearly",
  },
];
