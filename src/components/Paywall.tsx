import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";
import { useSubscription } from "@/hooks/use-subscription";

interface PaywallProps {
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
}

export function Paywall({
  onClose,
  title = "Unlock LogYourBody Premium",
  subtitle = "Continue tracking your body composition with unlimited access",
  showCloseButton = false,
}: PaywallProps) {
  const {
    purchaseSubscription,
    restorePurchases,
    isLoading,
    subscriptionInfo,
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1].id); // Default to yearly

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

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Premium</span>
        </div>
        {showCloseButton && onClose && (
          <Button
            size="icon"
            variant="outline"
            onClick={onClose}
            className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
            {subscriptionInfo.isTrialActive && (
              <div className="text-sm text-primary font-medium">
                {subscriptionInfo.daysRemainingInTrial} days left in trial
              </div>
            )}
          </div>

          {/* Plans */}
          <div className="space-y-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/30 hover:border-border",
                )}
              >
                {plan.isPopular && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">
                      {plan.name}
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    {plan.id === "yearly" && (
                      <div className="text-sm text-primary font-medium">
                        Save 33%
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      selectedPlan === plan.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground",
                    )}
                  >
                    {selectedPlan === plan.id && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Premium Features:</h3>
            <div className="grid grid-cols-1 gap-2">
              {SUBSCRIPTION_PLANS[0].features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border space-y-3">
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12"
        >
          {isLoading
            ? "Processing..."
            : `Start Premium - ${SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.price}`}
        </Button>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={handleRestore}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Restore Purchases
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Subscription automatically renews unless cancelled. Cancel anytime in
          your account settings. By subscribing you agree to our Terms of
          Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
