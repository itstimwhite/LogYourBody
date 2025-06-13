import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepper } from '@/contexts/StepperContext';
import { bodyFatSchema, type BodyFatData, bodyFatUtils } from '@/schemas/weight-logging';
import { weightAnalytics } from '@/utils/weight-analytics';

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
        method: 'slider_drag',
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
      method: 'tap_labels',
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
      method: 'preset_chip',
      final_value: preset.value,
      snapped_to_increment: true,
    });
  };

  const presets = bodyFatUtils.getPresets();
  const category = bodyFatUtils.getCategoryForValue(currentValue);
  
  // Calculate slider position for custom styling
  const sliderPosition = ((currentValue - 3) / (50 - 3)) * 100;

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, type: 'spring', damping: 20 }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Percent className="w-10 h-10 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Body fat percentage?
          </h1>
          <p className="text-lg text-muted-foreground">
            Estimate or enter your body fat percentage
          </p>
        </div>
      </div>

      {/* Current Value Display */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <div className="text-5xl font-bold text-foreground">
          {currentValue.toFixed(1)}%
        </div>
        <div className="text-muted-foreground text-lg">
          {category}
        </div>
      </motion.div>

      {/* Custom Slider */}
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
                className="absolute -top-12 bg-foreground text-background px-3 py-1 rounded-lg text-sm font-medium pointer-events-none z-10"
                style={{ left: `calc(${sliderPosition}% - 20px)` }}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {currentValue.toFixed(1)}%
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Slider */}
          <div className="relative">
            <input
              ref={sliderRef}
              type="range"
              min="3"
              max="50"
              step="0.5"
              value={currentValue}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              onMouseDown={handleSliderStart}
              onMouseUp={handleSliderEnd}
              onTouchStart={handleSliderStart}
              onTouchEnd={handleSliderEnd}
              className="w-full h-4 bg-transparent cursor-pointer slider-enhanced"
              style={{
                background: `linear-gradient(to right, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)) ${sliderPosition}%, 
                  hsl(var(--secondary)) ${sliderPosition}%, 
                  hsl(var(--secondary)) 100%)`
              }}
              aria-label="Body fat percentage"
              aria-valuemin={3}
              aria-valuemax={50}
              aria-valuenow={currentValue}
              aria-valuetext={`${currentValue.toFixed(1)} percent body fat`}
            />

            {/* Tappable Labels */}
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
              {[3, 8, 15, 22, 30, 50].map((labelValue) => {
                const position = ((labelValue - 3) / (50 - 3)) * 100;
                return (
                  <button
                    key={labelValue}
                    onClick={() => handleLabelTap(labelValue)}
                    className={cn(
                      'pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200',
                      'hover:scale-110 active:scale-95',
                      Math.abs(currentValue - labelValue) < 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    style={{ position: 'absolute', left: `calc(${position}% - 16px)` }}
                    aria-label={`Set body fat to ${labelValue} percent`}
                  >
                    {labelValue}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Range Labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-3">
            <span>Essential (3%)</span>
            <span>Athletic</span>
            <span>Fitness</span>
            <span>Acceptable</span>
            <span>High (50%)</span>
          </div>
        </div>
      </motion.div>

      {/* Preset Chips */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.25 }}
      >
        <p className="text-center text-sm text-muted-foreground font-medium">
          Quick presets
        </p>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <motion.button
              key={preset.value}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                'p-4 rounded-2xl border-2 transition-all duration-200 text-center',
                Math.abs(currentValue - preset.value) < 0.5
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/20 text-foreground border-transparent hover:border-border'
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-lg">{preset.value}%</div>
              <div className="text-sm opacity-80">{preset.label}</div>
              <div className="text-xs opacity-60">{preset.description}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
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
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = sliderStyles;
  document.head.appendChild(style);
}