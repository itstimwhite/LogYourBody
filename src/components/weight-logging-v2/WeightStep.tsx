import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { Scale, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStepper } from "@/contexts/StepperContext";
import {
  weightSchema,
  type WeightData,
  weightUtils,
} from "@/schemas/weight-logging";
import { weightAnalytics, analyticsUtils } from "@/utils/weight-analytics";
import { useHealthKit } from "@/hooks/use-healthkit";
import { isNativeiOS } from "@/lib/platform";
import { toast } from "@/hooks/use-toast";
import { StepContainer, StepHeader, QuickPresets, FormField } from "@/components/ui/step-container";

interface WeightStepProps {
  value: WeightData;
  onChange: (weight: WeightData) => void;
}

export function WeightStep({ value, onChange }: WeightStepProps) {
  const { setCanGoNext } = useStepper();
  const [inputValue, setInputValue] = useState(
    value.value > 0 ? value.value.toString() : "",
  );
  const [unit, setUnit] = useState<"lbs" | "kg">(value.unit);
  const [syncingHealthKit, setSyncingHealthKit] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNative = Capacitor.isNativePlatform();
  const healthKit = useHealthKit();
  // Show HealthKit button immediately on iOS, hide if not available after loading
  const showHealthKit =
    isNativeiOS() && (!healthKit.loading ? healthKit.isAvailable : true);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      weightAnalytics.startStep(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Validate and update parent whenever input changes
  useEffect(() => {
    const numValue = parseFloat(inputValue);

    if (isNaN(numValue) || inputValue === "") {
      setCanGoNext(false);
      return;
    }

    const weightData: WeightData = { value: numValue, unit };

    try {
      weightSchema.parse(weightData);
      onChange(weightData);
      setCanGoNext(true);
    } catch {
      setCanGoNext(false);
    }
  }, [inputValue, unit, onChange, setCanGoNext]);

  const handleInputChange = (newValue: string) => {
    setHasInteracted(true);

    // Remove any non-numeric characters except decimal point
    const cleaned = newValue.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleaned.split(".");
    const formatted =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;

    // Limit to 1 decimal place
    const [whole, decimal] = formatted.split(".");
    const finalValue = decimal ? `${whole}.${decimal.slice(0, 1)}` : whole;

    setInputValue(finalValue);

    // Track analytics
    if (hasInteracted) {
      const precision = analyticsUtils.getPrecision(
        parseFloat(finalValue) || 0,
      );
      weightAnalytics.trackWeightInput({
        method: "manual_typing",
        unit_toggle_used: false,
        precision_decimals: precision,
      });
    }
  };

  const handleUnitToggle = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    const currentWeight: WeightData = {
      value: parseFloat(inputValue) || 0,
      unit,
    };

    const newUnit = unit === "lbs" ? "kg" : "lbs";
    const convertedWeight = weightUtils.convertWeight(currentWeight, newUnit);

    setUnit(newUnit);
    setInputValue(convertedWeight.value.toString());

    // Track unit toggle
    weightAnalytics.trackWeightInput({
      method: "manual_typing",
      unit_toggle_used: true,
      precision_decimals: analyticsUtils.getPrecision(convertedWeight.value),
    });
  };

  const handlePresetSelect = async (preset: number) => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    setInputValue(preset.toString());
    setHasInteracted(true);

    // Track preset usage
    weightAnalytics.trackWeightInput({
      method: "preset_chip",
      unit_toggle_used: false,
      precision_decimals: 0,
    });
  };

  const handleHealthKitImport = async () => {
    if (!showHealthKit) return;

    setSyncingHealthKit(true);
    try {
      if (!healthKit.isAuthorized) {
        const granted = await healthKit.requestPermissions();
        if (!granted) {
          toast({
            title: "HealthKit Access Required",
            description: "Please grant access to import your weight data",
            variant: "destructive",
          });
          return;
        }
      }

      const healthData = await healthKit.getHealthData();
      if (healthData && healthData.weight) {
        // Convert from kg to current unit
        const healthWeight: WeightData = {
          value: healthData.weight,
          unit: "kg",
        };
        const convertedWeight = weightUtils.convertWeight(healthWeight, unit);
        
        // Round to 1 decimal place and convert to string
        const roundedValue = Math.round(convertedWeight.value * 10) / 10;
        setInputValue(roundedValue.toString());
        setHasInteracted(true);
        
        // Manually trigger validation for HealthKit import
        const validatedData: WeightData = { value: roundedValue, unit };
        onChange(validatedData);
        setCanGoNext(true);

        // Track HealthKit usage
        weightAnalytics.trackWeightInput({
          method: "healthkit_import",
          unit_toggle_used: false,
          precision_decimals: analyticsUtils.getPrecision(
            convertedWeight.value,
          ),
        });

        if (isNative) {
          await Haptics.notification({ type: "success" });
        }

        toast({
          title: "Weight Imported",
          description: `${roundedValue} ${unit} from HealthKit`,
        });
      } else {
        toast({
          title: "No Weight Data",
          description: "No recent weight data found in HealthKit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("HealthKit import error:", error);
      toast({
        title: "Import Failed",
        description: "Could not import weight from HealthKit",
        variant: "destructive",
      });

      if (isNative) {
        await Haptics.notification({ type: "error" });
      }
    } finally {
      setSyncingHealthKit(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Done") {
      e.preventDefault();
      inputRef.current?.blur();

      const numValue = parseFloat(inputValue) || 0;
      if (numValue >= 30 && numValue <= 700) {
        // Auto-advance on valid input
        weightAnalytics.completeStep({
          step_number: 1,
          step_name: "weight",
          interaction_type: "keyboard",
          value: `${numValue} ${unit}`,
        });
      }
    }
  };

  const presets = weightUtils.getWeightPresets(unit);
  const currentValue = parseFloat(inputValue) || 0;
  const helperText =
    currentValue > 0
      ? weightUtils.getWeightHelper({ value: currentValue, unit })
      : "";
  const isValid = currentValue >= 30 && currentValue <= 700;

  return (
    <StepContainer>
      {/* Header */}
      <StepHeader
        icon={<Scale />}
        title="What's your weight?"
        subtitle="Enter your current weight measurement"
      />

      {/* HealthKit Import */}
      {showHealthKit && (
        <motion.button
          onClick={handleHealthKitImport}
          disabled={syncingHealthKit}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-linear-border bg-linear-card transition-colors hover:bg-linear-border/50 disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          {syncingHealthKit ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-linear-purple" />
              <span className="font-medium text-linear-text">
                Importing from HealthKit...
              </span>
            </>
          ) : (
            <>
              <Activity className="h-5 w-5 text-linear-purple" />
              <span className="font-medium text-linear-text">
                Import from HealthKit
              </span>
            </>
          )}
        </motion.button>
      )}

      {/* Unit Toggle */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
      >
        <div className="flex rounded-xl bg-linear-card border border-linear-border p-1">
          <button
            onClick={handleUnitToggle}
            className={cn(
              "rounded-lg px-6 py-3 font-medium transition-all duration-200",
              unit === "lbs"
                ? "bg-linear-purple text-white shadow-sm"
                : "text-linear-text-secondary hover:text-linear-text",
            )}
          >
            lbs
          </button>
          <button
            onClick={handleUnitToggle}
            className={cn(
              "rounded-lg px-6 py-3 font-medium transition-all duration-200",
              unit === "kg"
                ? "bg-linear-purple text-white shadow-sm"
                : "text-linear-text-secondary hover:text-linear-text",
            )}
          >
            kg
          </button>
        </div>
      </motion.div>

      {/* Weight Input */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.25 }}
      >
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]{1})?"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={unit === "lbs" ? "150.0" : "68.0"}
            className={cn(
              "h-16 w-full px-6 text-center text-3xl font-bold",
              "rounded-xl border border-linear-border bg-linear-card",
              "text-linear-text placeholder:text-linear-text-tertiary/50",
              "transition-all duration-200",
              "focus:border-linear-purple focus:bg-linear-card focus:outline-none",
              !isValid &&
                hasInteracted &&
                currentValue > 0 &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            )}
            aria-label={`Weight in ${unit}`}
            aria-invalid={!isValid && hasInteracted && currentValue > 0}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 transform text-xl font-medium text-linear-text-secondary">
            {unit}
          </div>
        </div>

        {/* Helper Text */}
        <AnimatePresence mode="wait">
          {helperText && (
            <motion.p
              key={helperText}
              className="text-center text-lg text-linear-text-secondary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {!isValid && hasInteracted && currentValue > 0 && (
            <motion.p
              className="text-center text-red-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              {currentValue < 30
                ? "Weight must be at least 30 lbs (13.6 kg)"
                : "Weight must be less than 700 lbs (317.5 kg)"}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preset Chips */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.25 }}
      >
        <p className="text-center text-sm font-medium text-linear-text-tertiary">
          Quick presets
        </p>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {presets.map((preset) => (
            <motion.button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "flex-shrink-0 rounded-xl border px-4 py-3 font-medium transition-all duration-200",
                parseFloat(inputValue) === preset
                  ? "border-linear-purple bg-linear-purple text-white"
                  : "border-linear-border bg-linear-card text-linear-text hover:bg-linear-border/50",
              )}
              whileTap={{ scale: 0.95 }}
            >
              {preset} {unit}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </StepContainer>
  );
}
