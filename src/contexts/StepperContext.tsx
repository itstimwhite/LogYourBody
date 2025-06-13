import React, { createContext, useContext, useState, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

interface StepperContextType {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  canGoNext: boolean;
  setCanGoNext: (canGo: boolean) => void;
}

const StepperContext = createContext<StepperContextType | null>(null);

interface StepperProviderProps {
  children: React.ReactNode;
  totalSteps: number;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export function StepperProvider({ 
  children, 
  totalSteps, 
  initialStep = 0,
  onStepChange,
  onComplete
}: StepperProviderProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [canGoNext, setCanGoNext] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goNext = useCallback(async () => {
    if (!canGoNext) return;

    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    if (isLastStep) {
      onComplete?.();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCanGoNext(false); // Reset for next step
      onStepChange?.(nextStep);
    }
  }, [currentStep, isLastStep, canGoNext, onComplete, onStepChange, isNative]);

  const goBack = useCallback(async () => {
    if (isFirstStep) return;

    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setCanGoNext(true); // Assume previous step was valid
    onStepChange?.(prevStep);
  }, [currentStep, isFirstStep, onStepChange, isNative]);

  const goToStep = useCallback(async (step: number) => {
    if (step < 0 || step >= totalSteps || step === currentStep) return;

    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    setCurrentStep(step);
    setCanGoNext(true); // Assume target step can be navigated from
    onStepChange?.(step);
  }, [currentStep, totalSteps, onStepChange, isNative]);

  const value: StepperContextType = {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    goNext,
    goBack,
    goToStep,
    canGoNext,
    setCanGoNext,
  };

  return (
    <StepperContext.Provider value={value}>
      {children}
    </StepperContext.Provider>
  );
}

export function useStepper() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
}