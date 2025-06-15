import React, { useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ResponsiveFlowWrapper } from "@/components/ui/responsive-flow-wrapper";
import { useResponsive } from "@/hooks/use-responsive";

interface ProfileSetupProps {
  onComplete: () => void;
  healthKitData?: {
    height?: number;
    dateOfBirth?: Date;
    biologicalSex?: "male" | "female" | "other";
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export function ProfileSetup({ 
  onComplete, 
  healthKitData,
  isOpen = true,
  onClose
}: ProfileSetupProps) {
  const { isMobile } = useResponsive();
  
  // On mobile, render directly. On desktop, use modal
  if (isMobile) {
    return (
      <OnboardingFlow onComplete={onComplete} healthKitData={healthKitData} />
    );
  }

  return (
    <ResponsiveFlowWrapper
      isOpen={isOpen}
      onClose={onClose || onComplete}
      showCloseButton={false}
      className="overflow-hidden"
    >
      <OnboardingFlow onComplete={onComplete} healthKitData={healthKitData} />
    </ResponsiveFlowWrapper>
  );
}
