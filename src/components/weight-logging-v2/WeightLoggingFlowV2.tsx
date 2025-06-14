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
import { PhotoCapture } from "@/components/PhotoCapture";

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
    photoUrl?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    weight?: WeightData;
    bodyFat?: BodyFatData;
    method?: MethodData;
  };
  /**
   * Default units if no initial weight is provided
   */
  units?: "imperial" | "metric";
}

interface WeightLoggingFlowContentProps extends WeightLoggingFlowV2Props {
  weightData: WeightData;
  setWeightData: (data: WeightData) => void;
  bodyFatData: BodyFatData;
  setBodyFatData: (data: BodyFatData) => void;
  methodData: MethodData;
  setMethodData: (data: MethodData) => void;
  photoUrl?: string;
  setPhotoUrl: (url: string | undefined) => void;
  showPhotoCapture: boolean;
  setShowPhotoCapture: (show: boolean) => void;
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
  photoUrl,
  setPhotoUrl,
  showPhotoCapture,
  setShowPhotoCapture,
}: WeightLoggingFlowContentProps) {
  const { currentStep, canGoNext, goNext, goBack, goToStep, progress } =
    useStepper();

  // Form data is now passed from parent

  const totalSteps = 4;
  const stepTitles = ["Weight", "Body Fat", "Method", "Review"];

  // Handle complete will be called from parent

  const handleEditStep = (step: number) => {
    goToStep(step);
  };

  const handleAddPhoto = () => {
    setShowPhotoCapture(true);
  };

  const handlePhotoUploaded = (url: string) => {
    setPhotoUrl(url);
    weightAnalytics.trackPhotoAdded({
      photo_url: url,
    });
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col bg-linear-bg font-inter">
      {/* Photo Capture Dialog */}
      <PhotoCapture
        isOpen={showPhotoCapture}
        onClose={() => setShowPhotoCapture(false)}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {/* Header with Progress */}
      <div className="flex-shrink-0 px-6 pt-safe-top">
        {/* Navigation */}
        <div className="flex h-14 items-center justify-between">
          <button
            onClick={currentStep === 0 ? onCancel : goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-border/30 text-linear-text-secondary transition-colors hover:bg-linear-border/50 hover:text-linear-text"
            aria-label={currentStep === 0 ? "Cancel" : "Go back"}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-sm font-medium text-linear-text-secondary">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <div className="text-lg font-semibold text-linear-text">
              {stepTitles[currentStep]}
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center">
            <div className="text-sm font-medium text-linear-text-secondary">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-linear-border">
            <motion.div
              className="h-full rounded-full bg-linear-purple"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 pb-safe-bottom">
          <React.Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-linear-purple border-t-transparent" />
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
                className="h-full text-linear-text"
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
              className="h-14 flex-1 rounded-xl border border-linear-border bg-linear-card font-medium text-linear-text-secondary transition-colors hover:bg-linear-border/50 hover:text-linear-text"
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
              "flex h-14 items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
              currentStep === 0 ? "flex-1" : "flex-[2]",
              canGoNext
                ? "bg-linear-text text-linear-bg hover:bg-linear-text/90"
                : "cursor-not-allowed border border-linear-border bg-linear-card text-linear-text-tertiary",
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
  const defaultUnit = props.units === "metric" ? "kg" : "lbs";
  const [weightData, setWeightData] = useState<WeightData>(
    props.initialData?.weight || { value: 0, unit: defaultUnit },
  );
  const [bodyFatData, setBodyFatData] = useState<BodyFatData>(
    props.initialData?.bodyFat || { value: 15 },
  );
  const [methodData, setMethodData] = useState<MethodData>(
    props.initialData?.method || { value: "scale", label: "Digital Scale" },
  );
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const handleComplete = async () => {
    // Track completion analytics
    weightAnalytics.completeFlow({
      total_steps: 4,
      completion_time_seconds: Date.now() - (weightAnalytics as any).startTime,
      final_weight: `${weightData.value} ${weightData.unit}`,
      final_body_fat: `${bodyFatData.value}%`,
      final_method: methodData.label,
      had_photo: !!photoUrl,
    });

    props.onComplete({
      weight: weightData,
      bodyFat: bodyFatData,
      method: methodData,
      photoUrl: photoUrl,
    });
  };

  return (
    <StepperProvider totalSteps={4} initialStep={0} onComplete={handleComplete}>
      <WeightLoggingFlowContent
        {...props}
        weightData={weightData}
        setWeightData={setWeightData}
        bodyFatData={bodyFatData}
        setBodyFatData={setBodyFatData}
        methodData={methodData}
        setMethodData={setMethodData}
        photoUrl={photoUrl}
        setPhotoUrl={setPhotoUrl}
        showPhotoCapture={showPhotoCapture}
        setShowPhotoCapture={setShowPhotoCapture}
      />
    </StepperProvider>
  );
}
