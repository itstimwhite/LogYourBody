import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { OnboardingName } from "./OnboardingName";
import { OnboardingGender } from "./OnboardingGender";
import { OnboardingBirthday } from "./OnboardingBirthday";
import { OnboardingUnits } from "./OnboardingUnits";
import { OnboardingHeight } from "./OnboardingHeight";
import { OnboardingHealthKit } from "./OnboardingHealthKit";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { isNativeiOS } from "@/lib/platform";

interface OnboardingFlowProps {
  onComplete: () => void;
  healthKitData?: {
    height?: number;
    dateOfBirth?: Date;
    biologicalSex?: "male" | "female" | "other";
  };
}

export interface OnboardingData {
  name: string;
  gender: "male" | "female";
  birthday: string;
  units: "imperial" | "metric";
  height: number; // in cm
  healthKitEnabled?: boolean;
}

export function OnboardingFlow({
  onComplete,
  healthKitData,
}: OnboardingFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<Partial<OnboardingData>>({
    name: user?.user_metadata?.name || "",
    gender: healthKitData?.biologicalSex as "male" | "female" | undefined,
    birthday: healthKitData?.dateOfBirth?.toISOString().split("T")[0],
    units: "imperial",
    height: healthKitData?.height,
  });

  // Determine which steps to show based on existing data
  const steps = [
    { id: "name", show: !data.name },
    { id: "gender", show: !data.gender },
    { id: "birthday", show: !data.birthday },
    { id: "units", show: true }, // Always show units preference
    { id: "height", show: !data.height },
    { id: "healthkit", show: isNativeiOS() }, // Show HealthKit step on iOS
  ].filter((step) => step.show);

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !data.name || !data.gender || !data.birthday || !data.height) {
      setError("Please complete all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? null,
        name: data.name,
        gender: data.gender,
        birthday: data.birthday,
        height: Math.round(data.height),
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Save settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          units: data.units || "imperial",
          health_kit_sync_enabled: data.healthKitEnabled || !!healthKitData,
          updated_at: new Date().toISOString(),
        });

      if (settingsError) throw settingsError;

      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      setLoading(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  if (steps.length === 0 || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">
            {loading ? "Setting up your profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentStepData?.id === "name" && (
        <OnboardingName
          key="name"
          onComplete={(name) => {
            updateData({ name });
            handleNext();
          }}
          onBack={currentStep > 0 ? handleBack : undefined}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          initialValue={data.name || ""}
        />
      )}

      {currentStepData?.id === "gender" && (
        <OnboardingGender
          key="gender"
          onComplete={(gender) => {
            updateData({ gender });
            handleNext();
          }}
          onBack={handleBack}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          initialValue={data.gender}
        />
      )}

      {currentStepData?.id === "birthday" && (
        <OnboardingBirthday
          key="birthday"
          onComplete={(birthday) => {
            updateData({ birthday });
            handleNext();
          }}
          onBack={handleBack}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          initialValue={data.birthday}
        />
      )}

      {currentStepData?.id === "units" && (
        <OnboardingUnits
          key="units"
          onComplete={(units) => {
            updateData({ units });
            handleNext();
          }}
          onBack={handleBack}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          initialValue={data.units || "imperial"}
        />
      )}

      {currentStepData?.id === "height" && (
        <OnboardingHeight
          key="height"
          onComplete={(height) => {
            updateData({ height });
            handleNext();
          }}
          onBack={handleBack}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          initialValue={data.height}
          units={data.units || "imperial"}
        />
      )}

      {currentStepData?.id === "healthkit" && (
        <OnboardingHealthKit
          key="healthkit"
          onComplete={(enabled) => {
            updateData({ healthKitEnabled: enabled });
            handleNext();
          }}
          onBack={handleBack}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
        />
      )}

      {error && (
        <div className="fixed bottom-20 left-6 right-6 rounded-2xl bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}
    </AnimatePresence>
  );
}
