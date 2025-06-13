import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Ruler, ArrowRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingClasses } from '@/styles/onboarding-tokens';

interface OnboardingUnitsProps {
  onComplete: (units: 'imperial' | 'metric') => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialValue: 'imperial' | 'metric';
}

export function OnboardingUnits({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
  initialValue,
}: OnboardingUnitsProps) {
  const [units, setUnits] = useState<'imperial' | 'metric'>(initialValue);
  const isNative = Capacitor.isNativePlatform();

  const handleSelect = async (value: 'imperial' | 'metric') => {
    setUnits(value);
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleContinue = async () => {
    if (isNative) {
      await Haptics.notification({ type: 'success' });
    }
    
    onComplete(units);
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
                  ? 'w-2.5 h-2.5 bg-primary' 
                  : index === currentStep - 1
                    ? 'w-3 h-3 bg-primary'
                    : 'w-2 h-2 bg-muted'
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
              className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Ruler className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className={onboardingClasses.typography.heading}>
              Measurement preference
            </h1>
            <p className={onboardingClasses.typography.helper}>
              Choose your preferred units for tracking
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
              onClick={() => handleSelect('imperial')}
              className={cn(
                'h-32 rounded-2xl border-2 transition-all duration-200',
                'flex flex-col items-center justify-center gap-3 p-4',
                units === 'imperial'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/20 text-foreground border-transparent hover:border-border'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn(
                'text-2xl font-bold',
                units === 'imperial' ? 'text-primary-foreground' : 'text-foreground'
              )}>
                Imperial
              </div>
              <div className={cn(
                'text-sm opacity-80',
                units === 'imperial' ? 'text-primary-foreground' : 'text-muted-foreground'
              )}>
                lbs, ft/in
              </div>
              <div className={cn(
                'text-xs opacity-60 text-center',
                units === 'imperial' ? 'text-primary-foreground' : 'text-muted-foreground'
              )}>
                Used in US, UK
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSelect('metric')}
              className={cn(
                'h-32 rounded-2xl border-2 transition-all duration-200',
                'flex flex-col items-center justify-center gap-3 p-4',
                units === 'metric'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/20 text-foreground border-transparent hover:border-border'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn(
                'text-2xl font-bold',
                units === 'metric' ? 'text-primary-foreground' : 'text-foreground'
              )}>
                Metric
              </div>
              <div className={cn(
                'text-sm opacity-80',
                units === 'metric' ? 'text-primary-foreground' : 'text-muted-foreground'
              )}>
                kg, cm
              </div>
              <div className={cn(
                'text-xs opacity-60 text-center',
                units === 'metric' ? 'text-primary-foreground' : 'text-muted-foreground'
              )}>
                Used worldwide
              </div>
            </motion.button>
          </motion.div>

          {/* Example conversions */}
          <motion.div 
            className="mt-8 p-4 bg-secondary/20 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <p className="text-sm text-center text-muted-foreground">
              {units === 'imperial' ? (
                <>150 lbs = 68 kg • 5'10" = 178 cm</>
              ) : (
                <>68 kg = 150 lbs • 178 cm = 5'10"</>
              )}
            </p>
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
                'flex-1'
              )}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleContinue}
              className={cn(
                onboardingClasses.button.base,
                onboardingClasses.button.primary,
                'flex-1'
              )}
              whileTap={{ scale: 0.98 }}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}