import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepperProvider } from '@/contexts/StepperContext';
import { type WeightData, type BodyFatData, type MethodData } from '@/schemas/weight-logging';
import { weightAnalytics } from '@/utils/weight-analytics';

// Lazy load steps for better performance
const WeightStep = React.lazy(() => import('./WeightStep').then(m => ({ default: m.WeightStep })));
const BodyFatStep = React.lazy(() => import('./BodyFatStep').then(m => ({ default: m.BodyFatStep })));
const MethodStep = React.lazy(() => import('./MethodStep').then(m => ({ default: m.MethodStep })));
const ReviewStep = React.lazy(() => import('./ReviewStep').then(m => ({ default: m.ReviewStep })));

interface WeightLoggingFlowV2Props {
  onComplete: (data: {
    weight: WeightData;
    bodyFat: BodyFatData;
    method: MethodData;
    photo?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    weight?: WeightData;
    bodyFat?: BodyFatData;
    method?: MethodData;
  };
}

export function WeightLoggingFlowV2({ 
  onComplete, 
  onCancel,
  initialData 
}: WeightLoggingFlowV2Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [canGoNext, setCanGoNext] = useState(false);
  
  // Form data state
  const [weightData, setWeightData] = useState<WeightData>(
    initialData?.weight || { value: 0, unit: 'lbs' }
  );
  const [bodyFatData, setBodyFatData] = useState<BodyFatData>(
    initialData?.bodyFat || { value: 15 }
  );
  const [methodData, setMethodData] = useState<MethodData>(
    initialData?.method || { value: 'scale', label: 'Digital Scale' }
  );
  const [photoData, setPhotoData] = useState<string | undefined>();

  const totalSteps = 4;
  const stepTitles = ['Weight', 'Body Fat', 'Method', 'Review'];

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1 && canGoNext) {
      setCurrentStep(prev => prev + 1);
      setCanGoNext(false);
    } else if (currentStep === totalSteps - 1) {
      // Complete the flow
      handleComplete();
    }
  }, [currentStep, canGoNext]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      setCanGoNext(false);
    }
  }, [totalSteps]);

  const handleComplete = async () => {
    // Track completion analytics
    weightAnalytics.completeFlow({
      total_steps: totalSteps,
      completion_time_seconds: Date.now() - (weightAnalytics as any).startTime,
      final_weight: `${weightData.value} ${weightData.unit}`,
      final_body_fat: `${bodyFatData.value}%`,
      final_method: methodData.label,
      had_photo: !!photoData,
    });

    onComplete({
      weight: weightData,
      bodyFat: bodyFatData,
      method: methodData,
      photo: photoData,
    });
  };

  const handleEditStep = (step: number) => {
    goToStep(step);
  };

  const handleAddPhoto = () => {
    // TODO: Implement photo capture
    console.log('Photo capture not yet implemented');
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WeightStep 
            value={weightData} 
            onChange={setWeightData} 
          />
        );
      case 1:
        return (
          <BodyFatStep 
            value={bodyFatData} 
            onChange={setBodyFatData} 
          />
        );
      case 2:
        return (
          <MethodStep 
            value={methodData} 
            onChange={setMethodData} 
          />
        );
      case 3:
        return (
          <ReviewStep 
            weight={weightData}
            bodyFat={bodyFatData}
            method={methodData}
            onEditStep={handleEditStep}
            onAddPhoto={handleAddPhoto}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StepperProvider
      currentStep={currentStep}
      totalSteps={totalSteps}
      canGoNext={canGoNext}
      setCanGoNext={setCanGoNext}
      goNext={goNext}
      goBack={goBack}
      goToStep={goToStep}
    >
      <div className="h-full flex flex-col bg-background">
        {/* Header with Progress */}
        <div className="flex-shrink-0 px-6 pt-safe-top">
          {/* Navigation */}
          <div className="flex items-center justify-between h-14">
            <button
              onClick={currentStep === 0 ? onCancel : goBack}
              className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
              aria-label={currentStep === 0 ? 'Cancel' : 'Go back'}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </div>
              <div className="text-lg font-semibold text-foreground">
                {stepTitles[currentStep]}
              </div>
            </div>

            <div className="w-10 h-10 flex items-center justify-center">
              <div className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 mb-6">
            <div className="w-full bg-secondary/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full px-6 pb-safe-bottom overflow-y-auto">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, type: 'spring', damping: 20 }}
                  className="h-full"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </React.Suspense>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4">
          <div className="flex gap-3">
            {/* Back Button (hidden on first step) */}
            {currentStep > 0 && (
              <motion.button
                onClick={goBack}
                className="flex-1 h-14 bg-secondary/20 text-foreground font-semibold rounded-2xl transition-colors hover:bg-secondary/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Back
              </motion.button>
            )}

            {/* Next/Complete Button */}
            <motion.button
              onClick={goNext}
              disabled={!canGoNext}
              className={cn(
                'h-14 font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2',
                currentStep === 0 ? 'flex-1' : 'flex-[2]',
                canGoNext
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary/20 text-muted-foreground cursor-not-allowed'
              )}
              whileTap={canGoNext ? { scale: 0.98 } : {}}
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Save Entry
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </StepperProvider>
  );
}