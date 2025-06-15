import React from "react";
import { WeightLoggingFlowV2 } from "./WeightLoggingFlowV2";
import {
  type WeightData,
  type BodyFatData,
  type MethodData,
} from "@/schemas/weight-logging";
import { ResponsiveFlowWrapper } from "@/components/ui/responsive-flow-wrapper";

interface WeightLoggingWrapperProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: any;
    date: Date;
    photoUrl?: string;
  }) => void;
  units: "metric" | "imperial";
  initialWeight?: number;
  initialBodyFat?: number;
}

export function WeightLoggingWrapper({
  show,
  onClose,
  onSave,
  units,
  initialWeight,
  initialBodyFat,
}: WeightLoggingWrapperProps) {

  const handleComplete = async (data: {
    weight: WeightData;
    bodyFat: BodyFatData;
    method: MethodData;
    photoUrl?: string;
  }) => {
    onSave({
      weight: data.weight.value,
      bodyFatPercentage: data.bodyFat.value,
      method: {
        value: data.method.value,
        label: data.method.label,
      },
      date: new Date(),
      photoUrl: data.photoUrl,
    });
    onClose();
  };

  // Prepare initial data for the flow
  const initialData = {
    weight: initialWeight
      ? {
          value: initialWeight,
          unit: units === "imperial" ? ("lbs" as const) : ("kg" as const),
        }
      : undefined,
    bodyFat: initialBodyFat
      ? {
          value: initialBodyFat,
        }
      : undefined,
    method: undefined,
  };

  return (
    <ResponsiveFlowWrapper
      isOpen={show}
      onClose={onClose}
      showCloseButton={false} // WeightLoggingFlowV2 has its own close button
      className="overflow-hidden"
    >
      <WeightLoggingFlowV2
        onComplete={handleComplete}
        onCancel={onClose}
        initialData={initialData}
      />
    </ResponsiveFlowWrapper>
  );
}
