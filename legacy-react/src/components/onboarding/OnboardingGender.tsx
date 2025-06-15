import React, { useState } from "react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { User, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { onboardingClasses } from "@/styles/onboarding-tokens";

interface OnboardingGenderProps {
  onComplete: (gender: "male" | "female") => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialValue?: "male" | "female";
}

export function OnboardingGender({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
  initialValue,
}: OnboardingGenderProps) {
  const [gender, setGender] = useState<"male" | "female" | undefined>(
    initialValue,
  );
  const isNative = Capacitor.isNativePlatform();

  const handleSelect = async (value: "male" | "female") => {
    setGender(value);
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleContinue = async () => {
    if (!gender) return;

    if (isNative) {
      await Haptics.notification({ type: "success" });
    }

    onComplete(gender);
  };

  return (
    <motion.div
      className={onboardingClasses.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={onboardingClasses.safeArea}>
        {/* Progress Indicator */}
        <motion.div
          className={onboardingClasses.progress.container}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                onboardingClasses.progress.dot,
                index < currentStep
                  ? "h-2.5 w-2.5 bg-primary"
                  : index === currentStep - 1
                    ? "h-3 w-3 bg-primary"
                    : "h-2 w-2 bg-muted",
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
          <span className={onboardingClasses.progress.label}>
            Step {currentStep} of {totalSteps}
          </span>
        </motion.div>

        {/* Content */}
        <div className={onboardingClasses.content.wrapper}>
          <motion.div
            className={onboardingClasses.content.header}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="h-10 w-10 text-primary" />
            </motion.div>

            <h1 className={onboardingClasses.typography.heading}>
              What's your gender?
            </h1>
            <p className={onboardingClasses.typography.helper}>
              This helps us calculate accurate body composition metrics
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={() => handleSelect("male")}
              className={cn(
                "h-24 rounded-2xl border-2 transition-all duration-200",
                "flex flex-col items-center justify-center gap-2",
                "text-lg font-medium",
                gender === "male"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent bg-secondary/20 text-foreground hover:border-border",
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  gender === "male"
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10",
                )}
              >
                <User
                  className={cn(
                    "h-6 w-6",
                    gender === "male"
                      ? "text-primary-foreground"
                      : "text-primary",
                  )}
                />
              </div>
              Male
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSelect("female")}
              className={cn(
                "h-24 rounded-2xl border-2 transition-all duration-200",
                "flex flex-col items-center justify-center gap-2",
                "text-lg font-medium",
                gender === "female"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent bg-secondary/20 text-foreground hover:border-border",
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  gender === "female"
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10",
                )}
              >
                <User
                  className={cn(
                    "h-6 w-6",
                    gender === "female"
                      ? "text-primary-foreground"
                      : "text-primary",
                  )}
                />
              </div>
              Female
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom Actions */}
        <motion.div
          className="space-y-4 pb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={onBack}
              className={cn(
                onboardingClasses.button.base,
                onboardingClasses.button.secondary,
                "flex-1",
              )}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </motion.button>

            <motion.button
              type="button"
              onClick={handleContinue}
              disabled={!gender}
              className={cn(
                onboardingClasses.button.base,
                onboardingClasses.button.primary,
                "flex-1",
              )}
              whileTap={gender ? { scale: 0.98 } : {}}
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
