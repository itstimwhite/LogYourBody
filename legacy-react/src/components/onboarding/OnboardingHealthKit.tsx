import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ChevronLeft, Activity, Scale } from "lucide-react";
import { useHealthKit } from "@/hooks/use-healthkit";
import { onboardingTokens } from "@/styles/onboarding-tokens";

interface OnboardingHealthKitProps {
  onComplete: (enabled: boolean) => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
}

export function OnboardingHealthKit({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
}: OnboardingHealthKitProps) {
  const { isAvailable, requestPermissions } = useHealthKit();
  const [requesting, setRequesting] = useState(false);

  const handleEnable = async () => {
    setRequesting(true);
    try {
      const granted = await requestPermissions();
      // Complete with true whether granted or not - user made their choice
      onComplete(granted);
    } catch (error) {
      console.error("Error requesting HealthKit permissions:", error);
      onComplete(false);
    } finally {
      setRequesting(false);
    }
  };

  const handleSkip = () => {
    onComplete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-svh flex-col bg-background px-6 py-8"
    >
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-muted-foreground"
          disabled={requesting}
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
      )}

      {/* Progress indicator */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < currentStep
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-full bg-primary/10 p-6"
        >
          <Heart className="h-12 w-12 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-center text-3xl font-semibold tracking-tight"
        >
          Connect Apple Health
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 max-w-sm text-center text-muted-foreground"
        >
          Sync your weight and body composition data automatically from Apple Health
        </motion.p>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Automatic Weight Sync</p>
              <p className="text-sm text-muted-foreground">
                Import data from smart scales
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Step Tracking</p>
              <p className="text-sm text-muted-foreground">
                Monitor your daily activity
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <Button
            size="lg"
            onClick={handleEnable}
            disabled={requesting || !isAvailable}
            className={onboardingTokens.button.primary}
          >
            {requesting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Requesting...
              </>
            ) : (
              "Enable Apple Health"
            )}
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={handleSkip}
            disabled={requesting}
            className="h-14"
          >
            Skip for Now
          </Button>
        </motion.div>

        {!isAvailable && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center text-sm text-muted-foreground"
          >
            Apple Health is not available on this device
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}