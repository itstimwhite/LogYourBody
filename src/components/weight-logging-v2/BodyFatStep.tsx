import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { Percent, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStepper } from "@/contexts/StepperContext";
import {
  bodyFatSchema,
  type BodyFatData,
  bodyFatUtils,
} from "@/schemas/weight-logging";
import { weightAnalytics } from "@/utils/weight-analytics";

interface BodyFatStepProps {
  value: BodyFatData;
  onChange: (bodyFat: BodyFatData) => void;
}

export function BodyFatStep({ value, onChange }: BodyFatStepProps) {
  const { setCanGoNext } = useStepper();
  const [currentValue, setCurrentValue] = useState(value.value);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  const isNative = Capacitor.isNativePlatform();
  const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

  useEffect(() => {
    weightAnalytics.startStep(2);
  }, []);

  // Validate and update parent whenever value changes
  useEffect(() => {
    const bodyFatData: BodyFatData = { value: currentValue };

    try {
      bodyFatSchema.parse(bodyFatData);
      onChange(bodyFatData);
      setCanGoNext(true);
    } catch {
      setCanGoNext(false);
    }
  }, [currentValue, onChange, setCanGoNext]);

  const handleSliderChange = async (newValue: number) => {
    const snappedValue = bodyFatUtils.snapToHalf(newValue);
    setCurrentValue(snappedValue);
    setHasInteracted(true);

    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleSliderStart = () => {
    setIsDragging(true);
    setTooltipVisible(true);
  };

  const handleSliderEnd = () => {
    setIsDragging(false);
    setTooltipVisible(false);

    // Track analytics
    if (hasInteracted) {
      weightAnalytics.trackBodyFatInput({
        method: "slider_drag",
        final_value: currentValue,
        snapped_to_increment: true,
      });
    }
  };

  const handleLabelTap = async (targetValue: number) => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    setCurrentValue(targetValue);
    setHasInteracted(true);

    // Track analytics
    weightAnalytics.trackBodyFatInput({
      method: "tap_labels",
      final_value: targetValue,
      snapped_to_increment: true,
    });
  };

  const handlePresetSelect = async (preset: { value: number }) => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    setCurrentValue(preset.value);
    setHasInteracted(true);

    // Track analytics
    weightAnalytics.trackBodyFatInput({
      method: "preset_chip",
      final_value: preset.value,
      snapped_to_increment: true,
    });
  };

  const presets = bodyFatUtils.getPresets();
  const category = bodyFatUtils.getCategoryForValue(currentValue);
  const healthWarning = bodyFatUtils.getHealthWarning(currentValue);

  // Calculate slider position for custom styling
  const sliderPosition = ((currentValue - 4) / (50 - 4)) * 100;

  const containerContent = (
    <>
      {/* Header */}
      <div className="space-y-4 text-center">
        {isTestEnv ? (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Percent className="h-10 w-10 text-primary" />
          </div>
        ) : (
          <motion.div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Percent className="h-10 w-10 text-primary" />
          </motion.div>
        )}

        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Body fat percentage?
          </h1>
          <p className="text-lg text-muted-foreground">
            Estimate or enter your body fat percentage
          </p>
        </div>
      </div>

      {/* Current Value Display */}
      {isTestEnv ? (
        <div className="space-y-2 text-center">
          <div className="text-5xl font-bold text-foreground">
            {currentValue.toFixed(1)}%
          </div>
          <div className={cn(
            "text-lg",
            currentValue < 6 ? "text-destructive font-semibold" : "text-muted-foreground"
          )}>
            {category}
          </div>
        </div>
      ) : (
        <motion.div
          className="space-y-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          <div className="text-5xl font-bold text-foreground">
            {currentValue.toFixed(1)}%
          </div>
          <div className={cn(
            "text-lg",
            currentValue < 6 ? "text-destructive font-semibold" : "text-muted-foreground"
          )}>
            {category}
          </div>
        </motion.div>
      )}

      {/* Health Warning */}
      {isTestEnv ? (
        healthWarning && (
          <div className="mx-4 overflow-hidden">
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
        )
      ) : (
        <AnimatePresence>
          {healthWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-4 overflow-hidden"
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
          )}
        </AnimatePresence>
      )}

      {/* Custom Slider */}
      {isTestEnv ? (
        <div className="space-y-6 px-4">
          <div className="relative">
            {/* Custom Slider */}
            <div className="relative">
              <input
                ref={sliderRef}
                type="range"
                min="4"
                max="50"
                step="0.5"
                value={currentValue}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                onMouseDown={handleSliderStart}
                onMouseUp={handleSliderEnd}
                onTouchStart={handleSliderStart}
                onTouchEnd={handleSliderEnd}
                className="slider-enhanced h-4 w-full cursor-pointer bg-transparent"
                style={{
                  background: `linear-gradient(to right, 
                    ${currentValue < 6 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 0%, 
                    ${currentValue < 6 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} ${sliderPosition}%, 
                    hsl(var(--secondary)) ${sliderPosition}%, 
                    hsl(var(--secondary)) 100%)`,
                }}
                aria-label="Body fat percentage"
                aria-valuemin={4}
                aria-valuemax={50}
                aria-valuenow={currentValue}
                aria-valuetext={`${currentValue.toFixed(1)} percent body fat`}
                data-warning={currentValue < 6}
              />

              {/* Tappable Labels */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
                {[4, 8, 15, 22, 30, 50].map((labelValue) => {
                  const position = ((labelValue - 4) / (50 - 4)) * 100;
                  return (
                    <button
                      key={labelValue}
                      onClick={() => handleLabelTap(labelValue)}
                      className={cn(
                        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-200",
                        "hover:scale-110 active:scale-95",
                        Math.abs(currentValue - labelValue) < 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                      style={{
                        position: "absolute",
                        left: `calc(${position}% - 16px)`,
                      }}
                      aria-label={`Set body fat to ${labelValue} percent`}
                    >
                      {labelValue}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range Labels */}
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span className={currentValue < 6 ? "text-destructive font-semibold" : ""}>Min (4%)</span>
              <span>Athletic</span>
              <span>Fitness</span>
              <span>Acceptable</span>
              <span>High (50%)</span>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          className="space-y-6 px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
        >
          <div className="relative">
            {/* Tooltip */}
            <AnimatePresence>
              {tooltipVisible && (
                <motion.div
                  className="pointer-events-none absolute -top-12 z-10 rounded-lg bg-foreground px-3 py-1 text-sm font-medium text-background"
                  style={{ left: `calc(${sliderPosition}% - 20px)` }}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentValue.toFixed(1)}%
                  <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Slider */}
            <div className="relative">
              <input
                ref={sliderRef}
                type="range"
                min="4"
                max="50"
                step="0.5"
                value={currentValue}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                onMouseDown={handleSliderStart}
                onMouseUp={handleSliderEnd}
                onTouchStart={handleSliderStart}
                onTouchEnd={handleSliderEnd}
                className="slider-enhanced h-4 w-full cursor-pointer bg-transparent"
                style={{
                  background: `linear-gradient(to right, 
                    ${currentValue < 6 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 0%, 
                    ${currentValue < 6 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} ${sliderPosition}%, 
                    hsl(var(--secondary)) ${sliderPosition}%, 
                    hsl(var(--secondary)) 100%)`,
                }}
                aria-label="Body fat percentage"
                aria-valuemin={4}
                aria-valuemax={50}
                aria-valuenow={currentValue}
                aria-valuetext={`${currentValue.toFixed(1)} percent body fat`}
                data-warning={currentValue < 6}
              />

              {/* Tappable Labels */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
                {[4, 8, 15, 22, 30, 50].map((labelValue) => {
                  const position = ((labelValue - 4) / (50 - 4)) * 100;
                  return (
                    <button
                      key={labelValue}
                      onClick={() => handleLabelTap(labelValue)}
                      className={cn(
                        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-200",
                        "hover:scale-110 active:scale-95",
                        Math.abs(currentValue - labelValue) < 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                      style={{
                        position: "absolute",
                        left: `calc(${position}% - 16px)`,
                      }}
                      aria-label={`Set body fat to ${labelValue} percent`}
                    >
                      {labelValue}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range Labels */}
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span className={currentValue < 6 ? "text-destructive font-semibold" : ""}>Min (4%)</span>
              <span>Athletic</span>
              <span>Fitness</span>
              <span>Acceptable</span>
              <span>High (50%)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preset Chips */}
      {isTestEnv ? (
        <div className="space-y-3">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Quick presets
          </p>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-center transition-all duration-200",
                  Math.abs(currentValue - preset.value) < 0.5
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent bg-secondary/20 text-foreground hover:border-border",
                )}
              >
                <div className="text-lg font-semibold">{preset.value}%</div>
                <div className="text-sm opacity-80">{preset.label}</div>
                <div className="text-xs opacity-60">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
        >
          <p className="text-center text-sm font-medium text-muted-foreground">
            Quick presets
          </p>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <motion.button
                key={preset.value}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-center transition-all duration-200",
                  Math.abs(currentValue - preset.value) < 0.5
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent bg-secondary/20 text-foreground hover:border-border",
                )}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-lg font-semibold">{preset.value}%</div>
                <div className="text-sm opacity-80">{preset.label}</div>
                <div className="text-xs opacity-60">{preset.description}</div>
              </motion.button>
            ))}
          </div>
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

/* Enhanced slider styles */
const sliderStyles = `
  .slider-enhanced::-webkit-slider-thumb {
    appearance: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 4px solid hsl(var(--background));
    transition: all 0.2s ease;
  }

  .slider-enhanced[data-warning="true"]::-webkit-slider-thumb {
    background: hsl(var(--destructive));
  }

  .slider-enhanced::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .slider-enhanced::-webkit-slider-thumb:active {
    transform: scale(1.15);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .slider-enhanced::-webkit-slider-track {
    height: 16px;
    border-radius: 8px;
    border: none;
  }

  .slider-enhanced::-moz-range-thumb {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 4px solid hsl(var(--background));
    transition: all 0.2s ease;
  }

  .slider-enhanced[data-warning="true"]::-moz-range-thumb {
    background: hsl(var(--destructive));
  }

  .slider-enhanced::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .slider-enhanced::-moz-range-thumb:active {
    transform: scale(1.15);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .slider-enhanced::-moz-range-track {
    height: 16px;
    border-radius: 8px;
    border: none;
  }
`;

// Inject styles into document head
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = sliderStyles;
  document.head.appendChild(style);
}
