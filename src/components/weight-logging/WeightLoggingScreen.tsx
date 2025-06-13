import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { 
  Scale, 
  Activity, 
  ArrowLeft, 
  Check, 
  Loader2,
  Percent,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingClasses } from '@/styles/onboarding-tokens';
import { MeasurementMethod, MEASUREMENT_METHODS } from '@/types/bodymetrics';
import { useHealthKit } from '@/hooks/use-healthkit';
import { isNativeiOS } from '@/lib/platform';

interface WeightLoggingScreenProps {
  onSave: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: MeasurementMethod;
    date: Date;
  }) => void;
  onBack: () => void;
  units: 'imperial' | 'metric';
  initialWeight?: number;
  initialBodyFat?: number;
}

type Step = 'weight' | 'body-fat' | 'method' | 'confirm';

export function WeightLoggingScreen({
  onSave,
  onBack,
  units,
  initialWeight,
  initialBodyFat = 15,
}: WeightLoggingScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>('weight');
  const [weight, setWeight] = useState<string>(initialWeight?.toString() || '');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number>(initialBodyFat);
  const [method, setMethod] = useState<MeasurementMethod>('scale');
  const [saving, setSaving] = useState(false);
  const [syncingHealthKit, setSyncingHealthKit] = useState(false);
  
  const isNative = Capacitor.isNativePlatform();
  const healthKit = useHealthKit();

  const steps: Step[] = ['weight', 'body-fat', 'method', 'confirm'];
  const currentStepIndex = steps.indexOf(currentStep);

  useEffect(() => {
    if (isNative) {
      Haptics.impact({ style: ImpactStyle.Light });
    }
  }, [currentStep, isNative]);

  const getStepConfig = (step: Step) => {
    switch (step) {
      case 'weight':
        return {
          title: 'What\'s your weight?',
          description: 'Enter your current weight measurement',
          icon: Scale,
        };
      case 'body-fat':
        return {
          title: 'Body fat percentage?',
          description: 'Estimate or enter your body fat percentage',
          icon: Percent,
        };
      case 'method':
        return {
          title: 'How did you measure?',
          description: 'Select your measurement method',
          icon: TrendingUp,
        };
      case 'confirm':
        return {
          title: 'Review measurement',
          description: 'Confirm your weight entry',
          icon: Check,
        };
    }
  };

  const handleNext = async () => {
    if (isNative) {
      await Haptics.notification({ type: 'success' });
    }

    if (currentStep === 'confirm') {
      await handleSave();
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    } else {
      onBack();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error('Invalid weight');
      }

      // Convert weight to kg if needed for internal storage
      let weightInKg = weightNum;
      if (units === 'imperial') {
        weightInKg = weightNum / 2.20462;
      }

      onSave({
        weight: weightInKg,
        bodyFatPercentage,
        method,
        date: new Date(),
      });

      if (isNative) {
        await Haptics.notification({ type: 'success' });
      }
    } catch (error) {
      if (isNative) {
        await Haptics.notification({ type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleHealthKitImport = async () => {
    if (!isNativeiOS() || !healthKit.isAvailable) {
      return;
    }

    setSyncingHealthKit(true);
    try {
      if (!healthKit.isAuthorized) {
        const granted = await healthKit.requestPermissions();
        if (!granted) {
          console.warn('HealthKit permissions not granted');
          return;
        }
      }

      const healthData = await healthKit.getHealthData();
      if (healthData && healthData.weight) {
        let displayWeight = healthData.weight;
        if (units === 'imperial') {
          displayWeight = Math.round(healthData.weight * 2.20462 * 10) / 10;
        }
        
        setWeight(displayWeight.toString());
        setMethod('healthkit');
        
        if (isNative) {
          await Haptics.notification({ type: 'success' });
        }
        
        console.log('HealthKit data imported:', displayWeight, units === 'imperial' ? 'lbs' : 'kg');
      }
    } catch (error) {
      console.error('Error importing HealthKit data:', error);
      if (isNative) {
        await Haptics.notification({ type: 'error' });
      }
    } finally {
      setSyncingHealthKit(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'weight':
        return weight && parseFloat(weight) > 0;
      case 'body-fat':
        return bodyFatPercentage >= 3 && bodyFatPercentage <= 50;
      case 'method':
        return method;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const config = getStepConfig(currentStep);

  return (
    <motion.div 
      className={onboardingClasses.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={onboardingClasses.safeArea}>
        {/* Header with Back Button */}
        <motion.div 
          className="flex items-center justify-between py-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          
          <div className="text-sm text-muted-foreground font-medium">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="w-full h-1 bg-secondary/30 rounded-full mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (currentStepIndex + 1) / steps.length }}
            transition={{ duration: 0.3 }}
          />
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
              className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <config.icon className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className={onboardingClasses.typography.heading}>
              {config.title}
            </h1>
            <p className={onboardingClasses.typography.helper}>
              {config.description}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {currentStep === 'weight' && (
                <WeightInput
                  value={weight}
                  onChange={setWeight}
                  units={units}
                  onHealthKitImport={handleHealthKitImport}
                  syncingHealthKit={syncingHealthKit}
                  showHealthKit={isNativeiOS() && healthKit.isAvailable}
                />
              )}

              {currentStep === 'body-fat' && (
                <BodyFatInput
                  value={bodyFatPercentage}
                  onChange={setBodyFatPercentage}
                />
              )}

              {currentStep === 'method' && (
                <MethodSelection
                  value={method}
                  onChange={setMethod}
                />
              )}

              {currentStep === 'confirm' && (
                <ConfirmationView
                  weight={parseFloat(weight)}
                  bodyFat={bodyFatPercentage}
                  method={method}
                  units={units}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Action */}
        <motion.div 
          className="space-y-4 pb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className={cn(
              onboardingClasses.button.base,
              onboardingClasses.button.primary,
              'w-full'
            )}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : currentStep === 'confirm' ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Measurement
              </>
            ) : (
              'Continue'
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Weight Input Component
function WeightInput({ 
  value, 
  onChange, 
  units, 
  onHealthKitImport, 
  syncingHealthKit, 
  showHealthKit 
}: {
  value: string;
  onChange: (value: string) => void;
  units: 'imperial' | 'metric';
  onHealthKitImport: () => void;
  syncingHealthKit: boolean;
  showHealthKit: boolean;
}) {
  const placeholder = units === 'imperial' ? '150' : '68';
  const unitLabel = units === 'imperial' ? 'lbs' : 'kg';

  return (
    <div className="space-y-6">
      {showHealthKit && (
        <>
          <motion.button
            onClick={onHealthKitImport}
            disabled={syncingHealthKit}
            className="w-full h-14 bg-secondary/20 border-2 border-transparent rounded-2xl flex items-center justify-center gap-3 hover:border-border transition-colors"
            whileTap={{ scale: 0.98 }}
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">
                Or enter manually
              </span>
            </div>
          </div>
        </>
      )}

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            onboardingClasses.input.field,
            'text-center text-2xl pr-16'
          )}
          autoFocus
          step={units === 'imperial' ? '0.1' : '0.1'}
          min="0"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg text-muted-foreground font-medium">
          {unitLabel}
        </div>
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-3 gap-2">
        {(units === 'imperial' ? ['140', '160', '180'] : ['60', '70', '80']).map((preset) => (
          <motion.button
            key={preset}
            onClick={() => onChange(preset)}
            className="h-12 bg-secondary/20 rounded-xl text-foreground font-medium hover:bg-secondary/30 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {preset}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Body Fat Input Component
function BodyFatInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-foreground mb-2">
          {value.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">
          Body fat percentage
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="range"
          min="3"
          max="50"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-secondary/30 rounded-full appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>3%</span>
          <span>Athlete</span>
          <span>Average</span>
          <span>High</span>
          <span>50%</span>
        </div>
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Athlete', value: 8 },
          { label: 'Fit', value: 15 },
          { label: 'Average', value: 22 },
          { label: 'High', value: 30 },
        ].map((preset) => (
          <motion.button
            key={preset.label}
            onClick={() => onChange(preset.value)}
            className="h-12 bg-secondary/20 rounded-xl text-xs font-medium hover:bg-secondary/30 transition-colors flex flex-col items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-foreground">{preset.value}%</span>
            <span className="text-muted-foreground">{preset.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Method Selection Component
function MethodSelection({ value, onChange }: { value: MeasurementMethod; onChange: (value: MeasurementMethod) => void }) {
  const methods = Object.entries(MEASUREMENT_METHODS).filter(([key]) => key !== 'healthkit');

  return (
    <div className="space-y-3">
      {methods.map(([key, label]) => (
        <motion.button
          key={key}
          onClick={() => onChange(key as MeasurementMethod)}
          className={cn(
            'w-full h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center',
            'text-lg font-medium',
            value === key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary/20 text-foreground border-transparent hover:border-border'
          )}
          whileTap={{ scale: 0.98 }}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}

// Confirmation View Component
function ConfirmationView({ 
  weight, 
  bodyFat, 
  method, 
  units 
}: { 
  weight: number; 
  bodyFat: number; 
  method: MeasurementMethod; 
  units: 'imperial' | 'metric';
}) {
  const displayWeight = units === 'imperial' ? (weight * 2.20462).toFixed(1) : weight.toFixed(1);
  const unitLabel = units === 'imperial' ? 'lbs' : 'kg';

  return (
    <div className="space-y-6">
      <div className="bg-secondary/20 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Weight</span>
          <span className="text-xl font-semibold text-foreground">
            {displayWeight} {unitLabel}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Body fat</span>
          <span className="text-xl font-semibold text-foreground">
            {bodyFat.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Method</span>
          <span className="text-xl font-semibold text-foreground">
            {MEASUREMENT_METHODS[method]}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Date</span>
          <span className="text-lg text-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}