import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { tw, settingsTokens } from '@/styles/settings-design';
import { SettingModal, ModalActions } from './SettingModal';

const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(100, 'Email must be 100 characters or less');

interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSave: (email: string) => void;
}

export const EditEmailModal = React.memo<EditEmailModalProps>(function EditEmailModal({
  isOpen,
  onClose,
  currentEmail,
  onSave,
}) {
  const [value, setValue] = useState(currentEmail);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(currentEmail);
      setError(null);
      setIsShaking(false);
      setIsFocused(false);
      
      // Auto-focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, currentEmail]);

  // Validate on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== currentEmail && value.trim() !== '') {
        try {
          emailSchema.parse(value);
          setError(null);
        } catch (err) {
          if (err instanceof z.ZodError) {
            setError(err.errors[0].message);
          }
        }
      } else {
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, currentEmail]);

  const handleSave = async () => {
    try {
      const validatedEmail = emailSchema.parse(value.trim());
      
      // Emit analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'setting_changed', {
          event_category: 'Settings',
          event_label: 'Email',
          custom_parameters: {
            key: 'email',
            oldValue: currentEmail,
            newValue: validatedEmail,
          },
        });
      }
      
      onSave(validatedEmail);
      onClose();
    } catch (err) {
      // Show validation error with shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && value.trim() !== '') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const isValid = !error && value.trim() !== '' && value !== currentEmail;

  return (
    <SettingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Email"
      actions={
        <ModalActions
          onCancel={onClose}
          onSave={handleSave}
          saveDisabled={!isValid}
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email-input" className={tw.inputLabel}>
            Email Address
          </label>
          
          <div className="relative">
            <motion.input
              ref={inputRef}
              id="email-input"
              type="email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                tw.input,
                error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                'pr-12' // Space for validation indicator
              )}
              placeholder="you@example.com"
              maxLength={100}
              inputMode="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : 'email-hint'}
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
            />
            
            {/* Validation indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {value.trim() !== '' && !error && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {error && (
                <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Character count */}
          <div className="flex justify-between">
            <div className={tw.helperText}>
              {value.length}/100 characters
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            id="email-error"
            className="text-destructive text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* Helper text */}
        <div id="email-hint" className={cn(tw.helperText, 'space-y-1')}>
          <p>• Enter a valid email address</p>
          <p>• This will be used for account recovery and notifications</p>
          {isFocused && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-primary text-sm"
            >
              • We'll send a verification email after saving
            </motion.p>
          )}
        </div>
      </div>
    </SettingModal>
  );
});