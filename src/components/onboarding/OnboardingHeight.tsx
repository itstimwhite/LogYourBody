import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { Ruler, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { onboardingClasses } from "@/styles/onboarding-tokens";

interface OnboardingHeightProps {
  onComplete: (height: number) => void; // height in cm
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialValue?: number;
  units: "imperial" | "metric";
}

export function OnboardingHeight({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
  initialValue,
  units,
}: OnboardingHeightProps) {
  const isNative = Capacitor.isNativePlatform();

  // Initialize values based on units and initial value
  const initialHeightCm = initialValue || 170;
  const initialFeet = Math.floor(initialHeightCm / 30.48);
  const initialInches = Math.round((initialHeightCm / 2.54) % 12);

  const [feet, setFeet] = useState(initialFeet);
  const [inches, setInches] = useState(initialInches);
  const [cm, setCm] = useState(initialHeightCm);
  const [error, setError] = useState("");

  const feetRef = useRef<HTMLInputElement>(null);
  const inchesRef = useRef<HTMLInputElement>(null);
  const cmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus appropriate input
    const timer = setTimeout(() => {
      if (units === "imperial") {
        feetRef.current?.focus();
      } else {
        cmRef.current?.focus();
      }
      if (isNative) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [isNative, units]);

  const validateHeight = (): boolean => {
    let heightInCm: number;

    if (units === "imperial") {
      heightInCm = (feet * 12 + inches) * 2.54;
    } else {
      heightInCm = cm;
    }

    if (heightInCm < 90 || heightInCm > 250) {
      setError("Please enter a valid height");
      return false;
    }

    setError("");
    return true;
  };

  const handleContinue = async () => {
    if (!validateHeight()) {
      if (isNative) {
        await Haptics.notification({ type: "error" });
      }
      return;
    }

    if (isNative) {
      await Haptics.notification({ type: "success" });
    }

    const heightInCm = units === "imperial" ? (feet * 12 + inches) * 2.54 : cm;

    onComplete(Math.round(heightInCm));
  };

  const handleFeetChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= 8) {
      setFeet(num);
      if (value.length === 1 && num >= 3) {
        inchesRef.current?.focus();
      }
    }
  };

  const handleInchesChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num < 12) {
      setInches(num);
    }
  };

  const handleCmChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= 250) {
      setCm(num);
    }
  };

  // Preview conversion
  const getConversion = () => {
    if (units === "imperial") {
      const totalInches = feet * 12 + inches;
      const heightCm = Math.round(totalInches * 2.54);
      return `${heightCm} cm`;
    } else {
      const totalInches = Math.round(cm / 2.54);
      const displayFeet = Math.floor(totalInches / 12);
      const displayInches = totalInches % 12;
      return `${displayFeet}'${displayInches}"`;
    }
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
              <Ruler className="h-10 w-10 text-primary" />
            </motion.div>

            <h1 className={onboardingClasses.typography.heading}>
              How tall are you?
            </h1>
            <p className={onboardingClasses.typography.helper}>
              This is essential for accurate body composition calculations
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {units === "imperial" ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Feet
                  </label>
                  <input
                    ref={feetRef}
                    type="number"
                    value={feet || ""}
                    onChange={(e) => handleFeetChange(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="8"
                    className={cn(
                      onboardingClasses.input.field,
                      "text-center",
                      error && "border-destructive",
                    )}
                    aria-label="Height in feet"
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Inches
                  </label>
                  <input
                    ref={inchesRef}
                    type="number"
                    value={inches || ""}
                    onChange={(e) => handleInchesChange(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="11"
                    className={cn(
                      onboardingClasses.input.field,
                      "text-center",
                      error && "border-destructive",
                    )}
                    aria-label="Height in inches"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-center text-sm font-medium text-muted-foreground">
                  Height in centimeters
                </label>
                <input
                  ref={cmRef}
                  type="number"
                  value={cm || ""}
                  onChange={(e) => handleCmChange(e.target.value)}
                  placeholder="170"
                  min="90"
                  max="250"
                  className={cn(
                    onboardingClasses.input.field,
                    "text-center",
                    error && "border-destructive",
                  )}
                  aria-label="Height in centimeters"
                />
              </div>
            )}

            {/* Conversion preview */}
            <motion.div
              className="rounded-2xl bg-secondary/20 p-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <p className="text-sm text-muted-foreground">
                = {getConversion()}
              </p>
            </motion.div>

            {error && (
              <motion.p
                className={onboardingClasses.typography.error}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                role="alert"
              >
                {error}
              </motion.p>
            )}
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
              disabled={units === "imperial" ? !feet && !inches : !cm}
              className={cn(
                onboardingClasses.button.base,
                onboardingClasses.button.primary,
                "flex-1",
              )}
              whileTap={{ scale: 0.98 }}
            >
              Complete
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
