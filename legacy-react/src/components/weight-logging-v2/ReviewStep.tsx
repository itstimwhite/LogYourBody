import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Edit3,
  Scale,
  Percent,
  TrendingUp,
  Calendar,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStepper } from "@/contexts/StepperContext";
import {
  type WeightData,
  type BodyFatData,
  type MethodData,
  weightUtils,
  bodyFatUtils,
} from "@/schemas/weight-logging";
import { weightAnalytics } from "@/utils/weight-analytics";

interface ReviewStepProps {
  weight: WeightData;
  bodyFat: BodyFatData;
  method: MethodData;
  onEditStep: (step: number) => void;
  onAddPhoto?: () => void;
}

export function ReviewStep({
  weight,
  bodyFat,
  method,
  onEditStep,
  onAddPhoto,
}: ReviewStepProps) {
  const { setCanGoNext } = useStepper();
  const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

  useEffect(() => {
    weightAnalytics.startStep(4);
    setCanGoNext(true); // Review step is always valid
  }, [setCanGoNext]);

  // Format date with proper localization
  const formatDate = (date: Date): string => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    } catch {
      // Fallback for unsupported locales
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }
  };

  const currentDate = new Date();
  const weightHelper = weightUtils.getWeightHelper(weight);
  const healthWarning = bodyFatUtils.getHealthWarning(bodyFat.value);

  const reviewItems = [
    {
      icon: Scale,
      label: "Weight",
      value: `${weight.value.toFixed(1)} ${weight.unit}`,
      subtitle: weightHelper,
      step: 0,
    },
    {
      icon: Percent,
      label: "Body Fat",
      value: `${bodyFat.value.toFixed(1)}%`,
      subtitle: bodyFat.value < 6 ? "⚠️ Dangerously low" : "Body fat percentage",
      step: 1,
      warning: bodyFat.value < 6,
    },
    {
      icon: TrendingUp,
      label: "Method",
      value: method.label,
      subtitle: "Measurement method",
      step: 2,
    },
    {
      icon: Calendar,
      label: "Date & Time",
      value: formatDate(currentDate),
      subtitle: "Recorded automatically",
      step: -1, // Not editable
    },
  ];

  const containerContent = (
    <>
      {/* Header */}
      <div className="space-y-4 text-center">
        {isTestEnv ? (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </div>
        ) : (
          <motion.div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="h-10 w-10 text-primary" />
          </motion.div>
        )}

        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Review measurement
          </h1>
          <p className="text-lg text-muted-foreground">
            Confirm your weight entry details
          </p>
        </div>
      </div>

      {/* Health Warning for low body fat */}
      {healthWarning && (
        isTestEnv ? (
          <div className="mx-4">
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">
                  Health Warning
                </p>
                <p className="text-sm text-destructive/90">
                  {healthWarning}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="mx-4"
          >
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">
                  Health Warning
                </p>
                <p className="text-sm text-destructive/90">
                  {healthWarning}
                </p>
              </div>
            </div>
          </motion.div>
        )
      )}

      {/* Review Card */}
      {isTestEnv ? (
        <div className="space-y-4 rounded-3xl bg-secondary/20 p-6">
          {reviewItems.map((item, index) => {
            const IconComponent = item.icon;
            const canEdit = item.step >= 0;

            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-4 transition-all duration-200",
                  canEdit
                    ? "group cursor-pointer hover:bg-secondary/30"
                    : "cursor-default",
                )}
                onClick={() => canEdit && onEditStep(item.step)}
                role={canEdit ? "button" : undefined}
                aria-label={canEdit ? `Edit ${item.label}` : undefined}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </span>
                    {canEdit && (
                      <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </div>
                  <div className={cn(
                    "truncate text-lg font-semibold",
                    item.warning ? "text-destructive" : "text-foreground"
                  )}>
                    {item.value}
                  </div>
                  <div className={cn(
                    "truncate text-sm",
                    item.warning ? "text-destructive font-semibold" : "text-muted-foreground"
                  )}>
                    {item.subtitle}
                  </div>
                </div>

                {/* Edit Indicator */}
                {canEdit && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 opacity-0 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100">
                    <Edit3 className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <motion.div
          className="space-y-4 rounded-3xl bg-secondary/20 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          {reviewItems.map((item, index) => {
            const IconComponent = item.icon;
            const canEdit = item.step >= 0;

            return (
              <motion.div
                key={item.label}
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-4 transition-all duration-200",
                  canEdit
                    ? "group cursor-pointer hover:bg-secondary/30"
                    : "cursor-default",
                )}
                onClick={() => canEdit && onEditStep(item.step)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                whileTap={canEdit ? { scale: 0.98 } : {}}
                role={canEdit ? "button" : undefined}
                aria-label={canEdit ? `Edit ${item.label}` : undefined}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </span>
                    {canEdit && (
                      <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </div>
                  <div className={cn(
                    "truncate text-lg font-semibold",
                    item.warning ? "text-destructive" : "text-foreground"
                  )}>
                    {item.value}
                  </div>
                  <div className={cn(
                    "truncate text-sm",
                    item.warning ? "text-destructive font-semibold" : "text-muted-foreground"
                  )}>
                    {item.subtitle}
                  </div>
                </div>

                {/* Edit Indicator */}
                {canEdit && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 opacity-0 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100">
                    <Edit3 className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Additional Actions */}
      {onAddPhoto && (
        isTestEnv ? (
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-muted-foreground">
              Optional
            </p>
            <button
              onClick={onAddPhoto}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/20 transition-all duration-200 hover:border-primary/50 hover:bg-secondary/30"
            >
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Add photo</span>
            </button>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.25 }}
          >
            <p className="text-center text-sm font-medium text-muted-foreground">
              Optional
            </p>
            <motion.button
              onClick={onAddPhoto}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/20 transition-all duration-200 hover:border-primary/50 hover:bg-secondary/30"
              whileTap={{ scale: 0.98 }}
            >
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Add photo</span>
            </motion.button>
          </motion.div>
        )
      )}

      {/* Summary Stats */}
      {isTestEnv ? (
        <div className="space-y-2 rounded-2xl bg-primary/5 p-4">
          <div className="text-center">
            <div className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Quick Summary
            </div>
            <div className="text-foreground">
              <span className="text-lg font-semibold">
                {weight.value.toFixed(1)} {weight.unit}
              </span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-lg font-semibold">
                {bodyFat.value.toFixed(1)}%
              </span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">{method.label}</span>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          className="space-y-2 rounded-2xl bg-primary/5 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
        >
          <div className="text-center">
            <div className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Quick Summary
            </div>
            <div className="text-foreground">
              <span className="text-lg font-semibold">
                {weight.value.toFixed(1)} {weight.unit}
              </span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-lg font-semibold">
                {bodyFat.value.toFixed(1)}%
              </span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">{method.label}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Helper Text */}
      {isTestEnv ? (
        <div className="space-y-1 text-center text-sm text-muted-foreground">
          <p>Tap any field above to edit</p>
          <p className="opacity-75">
            Your measurement will be saved with the current date and time
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-1 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.25 }}
        >
          <p>Tap any field above to edit</p>
          <p className="opacity-75">
            Your measurement will be saved with the current date and time
          </p>
        </motion.div>
      )}
    </>
  );

  return isTestEnv ? (
    <div className="space-y-8">
      {containerContent}
    </div>
  ) : (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, type: "spring", damping: 20 }}
    >
      {containerContent}
    </motion.div>
  );
}
