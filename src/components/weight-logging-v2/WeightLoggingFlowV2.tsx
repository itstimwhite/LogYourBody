import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepperProvider, useStepper } from "@/contexts/StepperContext";
import {
  type WeightData,
  type BodyFatData,
  type MethodData,
} from "@/schemas/weight-logging";
import { weightAnalytics } from "@/utils/weight-analytics";
import { PhotoCapture } from "@/components/PhotoCapture";
import { StepperNavigation, StepperActions } from "@/components/ui/responsive-flow-wrapper";

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
      <StepperNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitles={stepTitles}
        progress={progress}
        onBack={goBack}
        onCancel={onCancel}
      />

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
      <StepperActions
        currentStep={currentStep}
        totalSteps={totalSteps}
        canGoNext={canGoNext}
        onBack={goBack}
        onNext={goNext}
      />
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
