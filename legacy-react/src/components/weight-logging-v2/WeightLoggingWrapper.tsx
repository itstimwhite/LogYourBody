import React, { useState } from "react";
import { WeightLoggingFlowV2 } from "./WeightLoggingFlowV2";
import {
  type WeightData,
  type BodyFatData,
  type MethodData,
} from "@/schemas/weight-logging";
import { ResponsiveFlowWrapper } from "@/components/ui/responsive-flow-wrapper";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

interface InitialData {
  weight?: WeightData;
  bodyFat?: BodyFatData;
  method?: MethodData;
}

interface WeightLoggingWrapperProps {
  onSave?: (data: {
    weight: WeightData;
    bodyFat: BodyFatData;
    method: MethodData;
    photoUrl?: string;
  }) => void | Promise<void>;
  trigger?: React.ReactNode;
  initialData?: InitialData;
}

export function WeightLoggingWrapper({
  onSave,
  trigger,
  initialData,
}: WeightLoggingWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { saveEntry, isLoading } = useBodyMetrics();

  const handleComplete = async (data: {
    weight: WeightData;
    bodyFat: BodyFatData;
    method: MethodData;
    photoUrl?: string;
  }) => {
    try {
      // Format data for saveEntry (database format)
      const dbData = {
        weight: data.weight.value,
        weight_unit: data.weight.unit,
        body_fat_percentage: data.bodyFat.value,
        measurement_method: data.method.value,
        photo_url: data.photoUrl,
      };

      // Use custom onSave if provided (pass raw data)
      if (onSave) {
        await onSave(data);
      }
      
      // Always call saveEntry for database persistence
      await saveEntry(dbData);

      toast({
        title: "Entry saved",
        description: "Your weight has been logged successfully",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving weight data:", error);
      toast({
        title: "Error saving entry",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="gap-2"
          variant="default"
        >
          <Scale className="h-4 w-4" />
          Log Weight
        </Button>
      )}

      {/* Flow Modal/Sheet */}
      <ResponsiveFlowWrapper
        isOpen={isOpen}
        onClose={handleCancel}
        showCloseButton={true}
        className="overflow-hidden"
      >
        <WeightLoggingFlowV2
          onComplete={handleComplete}
          onCancel={handleCancel}
          initialData={initialData}
          isLoading={isLoading}
        />
      </ResponsiveFlowWrapper>
    </>
  );
}
