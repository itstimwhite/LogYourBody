import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  X,
  BarChart3,
  Camera,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";
import { useSubscription } from "@/hooks/use-subscription";
import { RevenueCatPaywall } from "./RevenueCatPaywall";

interface PaywallProps {
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
}

export function Paywall({
  onClose,
  title = "Access Paused",
  subtitle = "Continue tracking your body composition with LogYourBody Premium",
  showCloseButton = false,
}: PaywallProps) {
  const {
    purchaseSubscription,
    restorePurchases,
    isLoading,
    subscriptionInfo,
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1].id); // Default to yearly
  const [useRevenueCat, setUseRevenueCat] = useState(true);

  // RevenueCat handlers
  const handleRevenueCatSuccess = () => {
    onClose?.();
  };

  const handleRevenueCatError = (error: string) => {
    console.error("RevenueCat error:", error);
    // Fallback to legacy system if RevenueCat fails
    setUseRevenueCat(false);
  };

  // Legacy handlers
  const handlePurchase = async () => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);
    if (plan) {
      const result = await purchaseSubscription(plan.revenueCatProductId);
      if (result.success && onClose) {
        onClose();
      }
    }
  };

  const handleRestore = async () => {
    const result = await restorePurchases();
    if (result.success && onClose) {
      onClose();
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      subtitle: "& Trends",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      subtitle: "& Insights",
    },
    {
      icon: Camera,
      title: "Photo Progress",
      subtitle: "Tracking",
    },
    {
      icon: Smartphone,
      title: "Health App",
      subtitle: "Sync",
    },
  ];

  // Use RevenueCat if available, fallback to legacy paywall
  if (useRevenueCat) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="text-sm text-muted-foreground">LogYourBody</div>
          {showCloseButton && onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="mx-auto max-w-md space-y-8">
            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-4xl font-light text-foreground">
                {title.split(" ")[0] || "ACCESS"}
              </h1>
              <h2 className="text-4xl font-bold text-primary">
                {title.split(" ")[1] || "PAUSED"}
              </h2>
              <p className="text-lg text-muted-foreground">{subtitle}</p>
              {subscriptionInfo.isTrialActive && (
                <div className="text-sm font-medium text-primary">
                  {subscriptionInfo.daysRemainingInTrial} days left in trial
                </div>
              )}
            </div>

            {/* RevenueCat Paywall */}
            <RevenueCatPaywall
              onSuccess={handleRevenueCatSuccess}
              onError={handleRevenueCatError}
            />

            {/* Support Link */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() =>
                  window.open(
                    "mailto:support@logyourbody.com?subject=LogYourBody Support Request",
                    "_blank",
                  )
                }
                className="text-muted-foreground hover:text-foreground"
              >
                Need Help?
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Legacy paywall fallback
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="text-sm text-muted-foreground">LogYourBody</div>
        {showCloseButton && onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="mx-auto max-w-md space-y-8">
          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-light text-foreground">ACCESS</h1>
            <h2 className="text-4xl font-bold text-primary">PAUSED</h2>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
            {subscriptionInfo.isTrialActive && (
              <div className="text-sm font-medium text-primary">
                {subscriptionInfo.daysRemainingInTrial} days left in trial
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <feature.icon className="mb-3 h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {feature.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="space-y-4">
            {/* Annual Plan */}
            <div
              onClick={() => setSelectedPlan("yearly")}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 transition-all",
                selectedPlan === "yearly"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/30",
              )}
            >
              {selectedPlan === "yearly" && (
                <Badge className="absolute -top-2 right-4 bg-primary text-xs text-primary-foreground">
                  Save 42% with Annual
                </Badge>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold text-foreground">
                    Annual
                  </div>
                  <div className="text-muted-foreground">
                    $69.99 billed yearly
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">
                    $5.83/mo
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan("monthly")}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 transition-all",
                selectedPlan === "monthly"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/30",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold text-foreground">
                    Monthly
                  </div>
                  <div className="text-muted-foreground">
                    $9.99 billed monthly
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">
                    $9.99/mo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-4 p-6">
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="h-14 w-full rounded-xl bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Processing..." : "Resume Now"}
        </Button>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() =>
              window.open(
                "mailto:support@logyourbody.com?subject=LogYourBody Support Request",
                "_blank",
              )
            }
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            Need Help?
          </Button>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Subscription automatically renews unless cancelled. Cancel anytime in
          your account settings. By subscribing you agree to our Terms of
          Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
