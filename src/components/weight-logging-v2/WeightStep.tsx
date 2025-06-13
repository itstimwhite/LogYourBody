import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Scale, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepper } from '@/contexts/StepperContext';
import { weightSchema, type WeightData, weightUtils } from '@/schemas/weight-logging';
import { weightAnalytics, analyticsUtils } from '@/utils/weight-analytics';
import { useHealthKit } from '@/hooks/use-healthkit';
import { isNativeiOS } from '@/lib/platform';
import { toast } from '@/hooks/use-toast';

interface WeightStepProps {
  value: WeightData;
  onChange: (weight: WeightData) => void;
}

export function WeightStep({ value, onChange }: WeightStepProps) {
  const { setCanGoNext } = useStepper();
  const [inputValue, setInputValue] = useState(value.value > 0 ? value.value.toString() : '');
  const [unit, setUnit] = useState<'lbs' | 'kg'>(value.unit);
  const [syncingHealthKit, setSyncingHealthKit] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isNative = Capacitor.isNativePlatform();
  const healthKit = useHealthKit();
  // Show HealthKit button immediately on iOS, hide if not available after loading
  const showHealthKit = isNativeiOS() && (!healthKit.loading ? healthKit.isAvailable : true);

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
    
    if (isNaN(numValue) || inputValue === '') {
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
    const cleaned = newValue.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : cleaned;
    
    // Limit to 1 decimal place
    const [whole, decimal] = formatted.split('.');
    const finalValue = decimal ? `${whole}.${decimal.slice(0, 1)}` : whole;
    
    setInputValue(finalValue);
    
    // Track analytics
    if (hasInteracted) {
      const precision = analyticsUtils.getPrecision(parseFloat(finalValue) || 0);
      weightAnalytics.trackWeightInput({
        method: 'manual_typing',
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
      unit 
    };
    
    const newUnit = unit === 'lbs' ? 'kg' : 'lbs';
    const convertedWeight = weightUtils.convertWeight(currentWeight, newUnit);
    
    setUnit(newUnit);
    setInputValue(convertedWeight.value.toString());
    
    // Track unit toggle
    weightAnalytics.trackWeightInput({
      method: 'manual_typing',
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
      method: 'preset_chip',
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
            title: 'HealthKit Access Required',
            description: 'Please grant access to import your weight data',
            variant: 'destructive',
          });
          return;
        }
      }

      const healthData = await healthKit.getHealthData();
      if (healthData && healthData.weight) {
        // Convert from kg to current unit
        const healthWeight: WeightData = { value: healthData.weight, unit: 'kg' };
        const convertedWeight = weightUtils.convertWeight(healthWeight, unit);
        
        setInputValue(convertedWeight.value.toString());
        setHasInteracted(true);
        
        // Track HealthKit usage
        weightAnalytics.trackWeightInput({
          method: 'healthkit_import',
          unit_toggle_used: false,
          precision_decimals: analyticsUtils.getPrecision(convertedWeight.value),
        });

        if (isNative) {
          await Haptics.notification({ type: 'success' });
        }
        
        toast({
          title: 'Weight Imported',
          description: `${convertedWeight.value} ${convertedWeight.unit} from HealthKit`,
        });
      } else {
        toast({
          title: 'No Weight Data',
          description: 'No recent weight data found in HealthKit',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('HealthKit import error:', error);
      toast({
        title: 'Import Failed',
        description: 'Could not import weight from HealthKit',
        variant: 'destructive',
      });
      
      if (isNative) {
        await Haptics.notification({ type: 'error' });
      }
    } finally {
      setSyncingHealthKit(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Done') {
      e.preventDefault();
      inputRef.current?.blur();
      
      const numValue = parseFloat(inputValue) || 0;
      if (numValue >= 30 && numValue <= 700) {
        // Auto-advance on valid input
        weightAnalytics.completeStep({
          step_number: 1,
          step_name: 'weight',
          interaction_type: 'keyboard',
          value: `${numValue} ${unit}`,
        });
      }
    }
  };

  const presets = weightUtils.getWeightPresets(unit);
  const currentValue = parseFloat(inputValue) || 0;
  const helperText = currentValue > 0 ? weightUtils.getWeightHelper({ value: currentValue, unit }) : '';
  const isValid = currentValue >= 30 && currentValue <= 700;

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
          <Scale className="w-10 h-10 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            What's your weight?
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your current weight measurement
          </p>
        </div>
      </div>

      {/* HealthKit Import */}
      {showHealthKit && (
        <motion.button
          onClick={handleHealthKitImport}
          disabled={syncingHealthKit}
          className="w-full h-14 bg-secondary/20 border-2 border-transparent rounded-2xl flex items-center justify-center gap-3 hover:border-border transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          {syncingHealthKit ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-foreground font-medium">Importing from HealthKit...</span>
            </>
          ) : (
            <>
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Import from HealthKit</span>
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
        <div className="bg-secondary/30 rounded-2xl p-1 flex">
          <button
            onClick={handleUnitToggle}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all duration-200',
              unit === 'lbs'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            lbs
          </button>
          <button
            onClick={handleUnitToggle}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all duration-200',
              unit === 'kg'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
            placeholder={unit === 'lbs' ? '150.0' : '68.0'}
            className={cn(
              'w-full h-16 px-6 text-center text-3xl font-bold',
              'bg-secondary/20 border-2 rounded-2xl',
              'text-foreground placeholder:text-muted-foreground/50',
              'transition-all duration-200',
              'focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/20',
              !isValid && hasInteracted && currentValue > 0 && 'border-destructive focus:border-destructive focus:ring-destructive/20'
            )}
            aria-label={`Weight in ${unit}`}
            aria-invalid={!isValid && hasInteracted && currentValue > 0}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl font-medium text-muted-foreground">
            {unit}
          </div>
        </div>

        {/* Helper Text */}
        <AnimatePresence mode="wait">
          {helperText && (
            <motion.p
              key={helperText}
              className="text-center text-muted-foreground text-lg"
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
              className="text-center text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              {currentValue < 30 
                ? 'Weight must be at least 30 lbs (13.6 kg)'
                : 'Weight must be less than 700 lbs (317.5 kg)'
              }
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
        <p className="text-center text-sm text-muted-foreground font-medium">
          Quick presets
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {presets.map((preset) => (
            <motion.button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                'flex-shrink-0 px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200',
                parseFloat(inputValue) === preset
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/20 text-foreground border-transparent hover:border-border'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {preset} {unit}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}