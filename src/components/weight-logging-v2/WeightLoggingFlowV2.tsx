import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { StepperProvider, useStepper } from "@/contexts/StepperContext";
import {
  type WeightData,
  type BodyFatData,
  type MethodData,
} from "@/schemas/weight-logging";
import { weightAnalytics } from "@/utils/weight-analytics";

// Lazy load steps for better performance
const WeightStep = React.lazy(() =>
  import("./WeightStep").then((m) => ({ default: m.WeightStep })),
);
const BodyFatStep = React.lazy(() =>
  import("./BodyFatStep").then((m) => ({ default: m.BodyFatStep })),
);
const MethodStep = React.lazy(() =>
  import("./MethodStep").then((m) => ({ default: m.MethodStep })),
);
const ReviewStep = React.lazy(() =>
  import("./ReviewStep").then((m) => ({ default: m.ReviewStep })),
);

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

interface WeightLoggingFlowContentProps extends WeightLoggingFlowV2Props {
  weightData: WeightData;
  setWeightData: (data: WeightData) => void;
  bodyFatData: BodyFatData;
  setBodyFatData: (data: BodyFatData) => void;
  methodData: MethodData;
  setMethodData: (data: MethodData) => void;
  photoData?: string;
  setPhotoData: (data: string | undefined) => void;
}

function WeightLoggingFlowContent({
  onComplete,
  onCancel,
  initialData,
  weightData,
  setWeightData,
  bodyFatData,
  setBodyFatData,
  methodData,
  setMethodData,
  photoData,
  setPhotoData,
}: WeightLoggingFlowContentProps) {
  const { currentStep, canGoNext, goNext, goBack, goToStep, progress } = useStepper();

  // Form data is now passed from parent

  const totalSteps = 4;
  const stepTitles = ["Weight", "Body Fat", "Method", "Review"];

  // Handle complete will be called from parent

  const handleEditStep = (step: number) => {
    goToStep(step);
  };

  const handleAddPhoto = async () => {
    try {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'user'; // Use front camera on mobile
      
      // Handle file selection
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select an image under 5MB",
            variant: "destructive",
          });
          return;
        }
        
        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setPhotoData(base64);
          
          // Track photo addition
          weightAnalytics.trackPhotoAdded({
            file_size_kb: Math.round(file.size / 1024),
            file_type: file.type,
          });
          
          toast({
            title: "Photo added",
            description: "Your progress photo has been attached",
          });
        };
        
        reader.onerror = () => {
          toast({
            title: "Error",
            description: "Failed to process photo",
            variant: "destructive",
          });
        };
        
        reader.readAsDataURL(file);
      };
      
      // Trigger file picker
      input.click();
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast({
        title: "Error",
        description: "Failed to capture photo",
        variant: "destructive",
      });
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WeightStep value={weightData} onChange={setWeightData} />;
      case 1:
        return <BodyFatStep value={bodyFatData} onChange={setBodyFatData} />;
      case 2:
        return <MethodStep value={methodData} onChange={setMethodData} />;
      case 3:
        return (
          <ReviewStep
            weight={weightData}
            bodyFat={bodyFatData}
            method={methodData}
            onEditStep={handleEditStep}
            onAddPhoto={handleAddPhoto}
            photoData={photoData}
          />
        );
      default:
        return null;
    }
  };

  return (
      <div className="flex h-full flex-col bg-background">
        {/* Header with Progress */}
        <div className="pt-safe-top flex-shrink-0 px-6">
          {/* Navigation */}
          <div className="flex h-14 items-center justify-between">
            <button
              onClick={currentStep === 0 ? onCancel : goBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 transition-colors hover:bg-secondary/30"
              aria-label={currentStep === 0 ? "Cancel" : "Go back"}
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>

            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </div>
              <div className="text-lg font-semibold text-foreground">
                {stepTitles[currentStep]}
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center">
              <div className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/20">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <div className="pb-safe-bottom h-full overflow-y-auto px-6">
            <React.Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, type: "spring", damping: 20 }}
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
                className="h-14 flex-1 rounded-2xl bg-secondary/20 font-semibold text-foreground transition-colors hover:bg-secondary/30"
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
                "flex h-14 items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200",
                currentStep === 0 ? "flex-1" : "flex-[2]",
                canGoNext
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-secondary/20 text-muted-foreground",
              )}
              whileTap={canGoNext ? { scale: 0.98 } : {}}
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <Check className="h-5 w-5" />
                  Save Entry
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
  );
}

export function WeightLoggingFlowV2(props: WeightLoggingFlowV2Props) {
  // Store form data at the top level
  const [weightData, setWeightData] = useState<WeightData>(
    props.initialData?.weight || { value: 0, unit: "lbs" },
  );
  const [bodyFatData, setBodyFatData] = useState<BodyFatData>(
    props.initialData?.bodyFat || { value: 15 },
  );
  const [methodData, setMethodData] = useState<MethodData>(
    props.initialData?.method || { value: "scale", label: "Digital Scale" },
  );
  const [photoData, setPhotoData] = useState<string | undefined>();
  
  const handleComplete = async () => {
    // Track completion analytics
    weightAnalytics.completeFlow({
      total_steps: 4,
      completion_time_seconds: Date.now() - (weightAnalytics as any).startTime,
      final_weight: `${weightData.value} ${weightData.unit}`,
      final_body_fat: `${bodyFatData.value}%`,
      final_method: methodData.label,
      had_photo: !!photoData,
    });

    props.onComplete({
      weight: weightData,
      bodyFat: bodyFatData,
      method: methodData,
      photo: photoData,
    });
  };
  
  return (
    <StepperProvider
      totalSteps={4}
      initialStep={0}
      onComplete={handleComplete}
    >
      <WeightLoggingFlowContent 
        {...props}
        weightData={weightData}
        setWeightData={setWeightData}
        bodyFatData={bodyFatData}
        setBodyFatData={setBodyFatData}
        methodData={methodData}
        setMethodData={setMethodData}
        photoData={photoData}
        setPhotoData={setPhotoData}
      />
    </StepperProvider>
  );
}
