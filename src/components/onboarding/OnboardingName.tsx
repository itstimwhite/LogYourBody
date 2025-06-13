import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingClasses, onboardingTokens } from '@/styles/onboarding-tokens';

interface OnboardingNameProps {
  onComplete: (name: string) => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  initialValue?: string;
}

export function OnboardingName({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  initialValue = '',
}: OnboardingNameProps) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNative = Capacitor.isNativePlatform();

  // Auto-focus on mount with delay for animation
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      if (isNative) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [isNative]);

  // Validate name
  const validateName = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError('Please enter at least 2 characters');
      return false;
    }
    
    // Check for at least first and last name
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      setError('Please enter your full name (first and last)');
      return false;
    }
    
    // Basic validation for each part
    const validParts = parts.every(part => /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF'-]+$/.test(part));
    if (!validParts) {
      setError('Please use only letters, hyphens, and apostrophes');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Clear error on valid input
    if (touched && value.trim().length >= 2) {
      setError('');
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (name.trim()) {
      validateName(name);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    
    if (!validateName(name)) {
      if (isNative) {
        await Haptics.notification({ type: 'error' });
      }
      return;
    }
    
    if (isNative) {
      await Haptics.notification({ type: 'success' });
    }
    
    onComplete(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isValid = name.trim().length >= 2 && !error;

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
            {/* Optional Avatar/Icon */}
            <motion.div 
              className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className={onboardingClasses.typography.heading}>
              What's your name?
            </h1>
            <p className={onboardingClasses.typography.helper}>
              We'll use this to personalize your experience
            </p>
          </motion.div>

          <motion.form 
            className={onboardingClasses.content.form}
            onSubmit={handleSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className={onboardingClasses.input.wrapper}>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect="off"
                autoComplete="name"
                spellCheck={false}
                className={cn(
                  onboardingClasses.input.field,
                  touched && error && onboardingClasses.input.error
                )}
                aria-label="Full name"
                aria-invalid={touched && !!error}
                aria-describedby={error ? 'name-error' : undefined}
              />
              
              <AnimatePresence mode="wait">
                {touched && error && (
                  <motion.p
                    id="name-error"
                    className={onboardingClasses.typography.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>

        {/* Bottom Actions */}
        <motion.div 
          className="space-y-4 pb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="flex gap-4">
            {onBack && (
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
                Back
              </motion.button>
            )}
            
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid}
              className={cn(
                onboardingClasses.button.base,
                onboardingClasses.button.primary,
                onBack ? 'flex-1' : 'w-full'
              )}
              whileTap={isValid ? { scale: 0.98 } : {}}
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