import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { RadioGroup } from "@headlessui/react";
import {
  Scale,
  Scan,
  Ruler,
  Eye,
  Zap,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStepper } from "@/contexts/StepperContext";
import { methodSchema, type MethodData } from "@/schemas/weight-logging";
import { weightAnalytics } from "@/utils/weight-analytics";

interface MethodStepProps {
  value: MethodData;
  onChange: (method: MethodData) => void;
}

const methodOptions = [
  {
    value: "scale" as const,
    label: "Digital Scale",
    icon: Scale,
    description: "Home or gym scale",
  },
  {
    value: "dexa" as const,
    label: "DEXA Scan",
    icon: Scan,
    description: "Professional scan",
  },
  {
    value: "calipers" as const,
    label: "Calipers",
    icon: Ruler,
    description: "Skinfold measurement",
  },
  {
    value: "visual" as const,
    label: "Visual Estimate",
    icon: Eye,
    description: "Mirror assessment",
  },
  {
    value: "bioimpedance" as const,
    label: "Bio-impedance",
    icon: Zap,
    description: "Smart scale/device",
  },
  {
    value: "other" as const,
    label: "Other",
    icon: MoreHorizontal,
    description: "Different method",
  },
];

export function MethodStep({ value, onChange }: MethodStepProps) {
  const { setCanGoNext, goNext } = useStepper();
  const [selectedMethod, setSelectedMethod] = useState<typeof methodOptions[0]>(
    methodOptions.find(opt => opt.value === value.value) || methodOptions[0]
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    weightAnalytics.startStep(3);
  }, []);

  // Validate and update parent whenever selection changes
  useEffect(() => {
    if (selectedMethod) {
      const methodData: MethodData = {
        value: selectedMethod.value,
        label: selectedMethod.label,
      };

      try {
        methodSchema.parse(methodData);
        onChange(methodData);
        setCanGoNext(true);
      } catch {
        setCanGoNext(false);
      }
    }
  }, [selectedMethod, onChange, setCanGoNext]);

  const handleMethodSelect = async (method: typeof methodOptions[0]) => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    setSelectedMethod(method);
    setHasInteracted(true);

    // Track analytics
    weightAnalytics.completeStep({
      step_number: 3,
      step_name: "method",
      interaction_type: "tap",
      value: method.value,
    });

    // Auto-advance after selection with slight delay for feedback
    setTimeout(() => {
      goNext();
    }, 300);
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, type: "spring", damping: 20 }}
    >
      {/* Header */}
      <div className="space-y-4 text-center">
        <motion.div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TrendingUp className="h-10 w-10 text-primary" />
        </motion.div>

        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            How did you measure?
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your measurement method
          </p>
        </div>
      </div>

      {/* Method Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <RadioGroup value={selectedMethod} onChange={handleMethodSelect}>
          <RadioGroup.Label className="sr-only">
            Choose measurement method
          </RadioGroup.Label>
          <div className="grid grid-cols-2 gap-4">
            {methodOptions.map((option, index) => {
              const IconComponent = option.icon;
              
              return (
                <RadioGroup.Option
                  key={option.value}
                  value={option}
                  className={({ active, checked }) =>
                    cn(
                      "relative rounded-2xl border-2 p-6 transition-all duration-200",
                      "flex flex-col items-center gap-3 text-center cursor-pointer",
                      "min-h-[120px] focus:outline-none focus:ring-4 focus:ring-primary/20",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-transparent bg-secondary/20 text-foreground hover:border-border hover:bg-secondary/30",
                      active && "ring-4 ring-primary/20"
                    )
                  }
                >
                  {({ checked }) => (
                    <motion.div
                      className="flex flex-col items-center gap-3 w-full"
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                    >
                      {/* Selection Indicator */}
                      {checked && (
                        <motion.div
                          className="absolute right-2 top-2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.2 }}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </motion.div>
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          checked ? "bg-primary-foreground/20" : "bg-primary/10",
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "h-6 w-6",
                            checked ? "text-primary-foreground" : "text-primary",
                          )}
                        />
                      </div>

                      {/* Label */}
                      <div>
                        <div
                          className={cn(
                            "mb-1 text-sm font-semibold",
                            checked ? "text-primary-foreground" : "text-foreground",
                          )}
                        >
                          {option.label}
                        </div>
                        <div
                          className={cn(
                            "text-xs opacity-80",
                            checked
                              ? "text-primary-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {option.description}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </RadioGroup.Option>
              );
            })}
          </div>
        </RadioGroup>
      </motion.div>

      {/* Helper Text */}
      <motion.div
        className="text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.25 }}
      >
        <p>Tap to select your measurement method</p>
        <p className="mt-1 opacity-75">
          Different methods may have varying accuracy
        </p>
      </motion.div>
    </motion.div>
  );
}
