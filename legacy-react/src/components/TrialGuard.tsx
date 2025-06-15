import React from "react";
import { useSupabaseSubscription } from "@/hooks/use-supabase-subscription";
import { Paywall } from "./Paywall";

interface TrialGuardProps {
  children: React.ReactNode;
}

export function TrialGuard({ children }: TrialGuardProps) {
  // TEMPORARY: Bypass all subscription checks for iOS testing
  // TODO: Re-enable subscription logic after testing
  return <>{children}</>;

  // Original subscription logic (commented out for testing)
  /*
  const { hasAccess, isTrialExpired, subscriptionInfo, loading } =
    useSupabaseSubscription();

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking subscription...</p>
        </div>
      </div>
    );
  }

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
  */
}
