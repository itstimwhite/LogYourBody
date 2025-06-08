import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { Paywall } from "@/components/Paywall";

const Subscription = () => {
  const navigate = useNavigate();
  const { subscriptionInfo, billingInfo, cancelSubscription, isLoading } =
    useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (subscriptionInfo.status) {
      case "trial":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            Trial Active
          </Badge>
        );
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "expired":
      case "cancelled":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  if (showUpgrade) {
    return (
      <Paywall onClose={() => setShowUpgrade(false)} showCloseButton={true} />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/settings")}
          className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">Subscription</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Plan</h2>
            {getStatusBadge()}
          </div>

          <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
            {subscriptionInfo.status === "trial" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Free Trial
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subscriptionInfo.daysRemainingInTrial} days remaining
                    </div>
                  </div>
                </div>

                {subscriptionInfo.trialEndDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Trial ends on {formatDate(subscriptionInfo.trialEndDate)}
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => setShowUpgrade(true)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Upgrade to Premium
                </Button>
              </>
            ) : subscriptionInfo.status === "active" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Premium</div>
                    <div className="text-sm text-muted-foreground">
                      Active subscription
                    </div>
                  </div>
                </div>

                {subscriptionInfo.subscriptionEndDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Renews on{" "}
                      {formatDate(subscriptionInfo.subscriptionEndDate)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Subscription Expired
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reactivate to continue using LogYourBody
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowUpgrade(true)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Reactivate Premium
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Billing Information */}
        {subscriptionInfo.status === "active" && billingInfo && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Billing Information</h2>

            <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
              {billingInfo.nextBillingDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Next billing date
                  </span>
                  <span className="text-foreground font-medium">
                    {formatDate(billingInfo.nextBillingDate)}
                  </span>
                </div>
              )}

              {billingInfo.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground font-medium">
                    ${billingInfo.amount} {billingInfo.currency}
                  </span>
                </div>
              )}

              {billingInfo.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment method</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">
                      {billingInfo.paymentMethod}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Subscription */}
        {subscriptionInfo.status === "active" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Manage Subscription</h2>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={cancelSubscription}
                disabled={isLoading}
                className="w-full"
              >
                Manage in App Store
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                To cancel or modify your subscription, use your device's App
                Store or Google Play settings.
              </p>
            </div>
          </div>
        )}

        {/* Premium Features Preview */}
        {subscriptionInfo.status !== "active" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Premium Features</h2>

            <div className="bg-secondary/30 rounded-lg p-6 space-y-3">
              {[
                "Unlimited body measurements",
                "Advanced analytics & trends",
                "Photo progress tracking",
                "Health app sync",
                "Export data",
                "Priority support",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Crown className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
