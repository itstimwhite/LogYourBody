import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";
import { SettingGroup, SettingItem } from "./SettingGroup";

interface SubscriptionCardProps {
  isSubscribed: boolean;
  subscriptionType?: "monthly" | "yearly" | "lifetime";
  expiryDate?: Date;
  onManageSubscription: () => void;
  onUpgrade?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const SubscriptionCard = React.memo<SubscriptionCardProps>(
  function SubscriptionCard({
    isSubscribed,
    subscriptionType,
    expiryDate,
    onManageSubscription,
    onUpgrade,
    onCancel,
    className,
  }) {
    const [isLoading, setIsLoading] = useState(false);

    const getSubscriptionStatus = () => {
      if (!isSubscribed) {
        return {
          title: "Free Plan",
          subtitle: "Limited features available",
          status: "inactive" as const,
          color: "text-muted-foreground",
          badge: "Free",
          badgeColor: "bg-secondary text-secondary-foreground",
        };
      }

      const now = new Date();
      const isExpired = expiryDate && expiryDate < now;
      const isExpiringSoon =
        expiryDate &&
        expiryDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

      if (isExpired) {
        return {
          title: "Subscription Expired",
          subtitle: "Renew to continue using premium features",
          status: "expired" as const,
          color: "text-destructive",
          badge: "Expired",
          badgeColor: "bg-destructive text-destructive-foreground",
        };
      }

      if (isExpiringSoon) {
        return {
          title: getSubscriptionTitle(),
          subtitle: `Expires ${formatDate(expiryDate!)}`,
          status: "expiring" as const,
          color: "text-orange-400",
          badge: "Expiring Soon",
          badgeColor: "bg-orange-500/20 text-orange-400",
        };
      }

      return {
        title: getSubscriptionTitle(),
        subtitle:
          subscriptionType === "lifetime"
            ? "Lifetime access to all features"
            : `Renews ${formatDate(expiryDate!)}`,
        status: "active" as const,
        color: "text-green-400",
        badge: "Active",
        badgeColor: "bg-green-500/20 text-green-400",
      };
    };

    const getSubscriptionTitle = () => {
      switch (subscriptionType) {
        case "monthly":
          return "Premium Monthly";
        case "yearly":
          return "Premium Yearly";
        case "lifetime":
          return "Premium Lifetime";
        default:
          return "Premium Plan";
      }
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const handleManageSubscription = async () => {
      setIsLoading(true);

      // Haptic feedback
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
        Haptics?.impact({ style: ImpactStyle.Medium });
      }

      // Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "subscription_manage_click", {
          event_category: "Subscription",
          event_label: "Manage Subscription",
          custom_parameters: {
            subscription_status: isSubscribed ? "active" : "inactive",
            subscription_type: subscriptionType || "none",
          },
        });
      }

      try {
        await onManageSubscription();
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpgrade = async () => {
      if (!onUpgrade) return;

      setIsLoading(true);

      // Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "subscription_upgrade_click", {
          event_category: "Subscription",
          event_label: "Upgrade Plan",
        });
      }

      try {
        await onUpgrade();
      } finally {
        setIsLoading(false);
      }
    };

    const status = getSubscriptionStatus();

    return (
      <SettingGroup title="Subscription" className={className}>
        {/* Subscription status */}
        <SettingItem
          title={status.title}
          subtitle={status.subtitle}
          onClick={handleManageSubscription}
          disabled={isLoading}
          accessoryType="disclosure"
          icon={
            <div className="relative">
              {/* Subscription icon */}
              <svg
                className={cn("h-6 w-6", status.color)}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>

              {/* Status badge */}
              <motion.div
                className={cn(
                  "absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  status.badgeColor,
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={settingsTokens.animation.fast}
              >
                {status.badge}
              </motion.div>
            </div>
          }
          accessory={
            isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : undefined
          }
        />

        {/* Subscription features */}
        {isSubscribed && (
          <div className={cn(tw.helperText, "px-4 pb-2")}>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Premium Features:</p>
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-3 w-3 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Unlimited weight logs & metrics
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-3 w-3 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Advanced analytics & insights
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-3 w-3 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Export data & custom reports
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-3 w-3 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Priority customer support
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 px-4 pb-2">
          {!isSubscribed && onUpgrade && (
            <motion.button
              onClick={handleUpgrade}
              disabled={isLoading}
              className={cn(
                tw.button,
                "w-full bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              whileTap={{ scale: 0.98 }}
              transition={settingsTokens.animation.fast}
            >
              {isLoading ? "Loading..." : "Upgrade to Premium"}
            </motion.button>
          )}

          {isSubscribed && onCancel && (
            <motion.button
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                tw.button,
                "w-full bg-secondary text-secondary-foreground hover:bg-secondary/80",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              whileTap={{ scale: 0.98 }}
              transition={settingsTokens.animation.fast}
            >
              {isLoading ? "Loading..." : "Cancel Subscription"}
            </motion.button>
          )}
        </div>
      </SettingGroup>
    );
  },
);
