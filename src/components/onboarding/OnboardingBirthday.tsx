import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Calendar, ArrowRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingClasses } from '@/styles/onboarding-tokens';

interface OnboardingBirthdayProps {
  onComplete: (birthday: string) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialValue?: string;
}

export function OnboardingBirthday({
  onComplete,
  onBack,
  currentStep,
  totalSteps,
  initialValue,
}: OnboardingBirthdayProps) {
  const isNative = Capacitor.isNativePlatform();
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 13; // Minimum age 13
  
  const initialDate = initialValue ? new Date(initialValue) : new Date(currentYear - 25, 0, 1);
  const [month, setMonth] = useState(initialDate.getMonth() + 1);
  const [day, setDay] = useState(initialDate.getDate());
  const [year, setYear] = useState(initialDate.getFullYear());
  const [error, setError] = useState('');

  // Date input refs for focus management
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus month input
    const timer = setTimeout(() => {
      monthRef.current?.focus();
      if (isNative) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [isNative]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const validateDate = (): boolean => {
    const daysInMonth = getDaysInMonth(month, year);
    if (day > daysInMonth) {
      setError(`${new Date(0, month - 1).toLocaleString('en', { month: 'long' })} only has ${daysInMonth} days`);
      return false;
    }
    
    const birthDate = new Date(year, month - 1, day);
    const age = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (age < 13) {
      setError('You must be at least 13 years old');
      return false;
    }
    
    if (age > 100) {
      setError('Please enter a valid birth year');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleContinue = async () => {
    if (!validateDate()) {
      if (isNative) {
        await Haptics.notification({ type: 'error' });
      }
      return;
    }
    
    if (isNative) {
      await Haptics.notification({ type: 'success' });
    }
    
    const birthday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onComplete(birthday);
  };

  const handleMonthChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 12) {
      setMonth(num);
      if (value.length === 2 || num > 1) {
        dayRef.current?.focus();
      }
    }
  };

  const handleDayChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 31) {
      setDay(num);
      if (value.length === 2 || num > 3) {
        yearRef.current?.focus();
      }
    }
  };

  const handleYearChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num <= currentYear) {
      setYear(num);
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
              <Calendar className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className={onboardingClasses.typography.heading}>
              When were you born?
            </h1>
            <p className={onboardingClasses.typography.helper}>
              We use this to calculate age-adjusted metrics
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Month
                </label>
                <input
                  ref={monthRef}
                  type="number"
                  value={month || ''}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  placeholder="MM"
                  min="1"
                  max="12"
                  className={cn(
                    onboardingClasses.input.field,
                    'text-center',
                    error && 'border-destructive'
                  )}
                  aria-label="Birth month"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Day
                </label>
                <input
                  ref={dayRef}
                  type="number"
                  value={day || ''}
                  onChange={(e) => handleDayChange(e.target.value)}
                  placeholder="DD"
                  min="1"
                  max="31"
                  className={cn(
                    onboardingClasses.input.field,
                    'text-center',
                    error && 'border-destructive'
                  )}
                  aria-label="Birth day"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Year
                </label>
                <input
                  ref={yearRef}
                  type="number"
                  value={year || ''}
                  onChange={(e) => handleYearChange(e.target.value)}
                  placeholder="YYYY"
                  min={minYear}
                  max={maxYear}
                  className={cn(
                    onboardingClasses.input.field,
                    'text-center',
                    error && 'border-destructive'
                  )}
                  aria-label="Birth year"
                />
              </div>
            </div>

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
              disabled={!month || !day || !year}
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