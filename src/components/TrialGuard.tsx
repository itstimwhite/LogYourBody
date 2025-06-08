import React from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { Paywall } from "./Paywall";

interface TrialGuardProps {
  children: React.ReactNode;
}

export function TrialGuard({ children }: TrialGuardProps) {
  const { hasAccess, isTrialExpired, subscriptionInfo } = useSubscription();

  // Show paywall if trial expired or no access
  if (!hasAccess || isTrialExpired) {
    return (
      <Paywall
        title="Your trial has ended"
        subtitle="Continue tracking your body composition with LogYourBody Premium"
        showCloseButton={false}
      />
    );
  }

  // Show content if user has access
  return <>{children}</>;
}
