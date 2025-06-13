import React from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

interface ProfileSetupProps {
  onComplete: () => void;
  healthKitData?: {
    height?: number;
    dateOfBirth?: Date;
    biologicalSex?: "male" | "female" | "other";
  };
}

export function ProfileSetup({ onComplete, healthKitData }: ProfileSetupProps) {
  return (
    <OnboardingFlow onComplete={onComplete} healthKitData={healthKitData} />
  );
}
