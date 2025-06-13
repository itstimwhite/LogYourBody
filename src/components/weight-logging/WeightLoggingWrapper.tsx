import React from 'react';
import { WeightLoggingScreen } from './WeightLoggingScreen';
import { MeasurementMethod } from '@/types/bodymetrics';

interface WeightLoggingWrapperProps {
  show: boolean;
  onSave: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: MeasurementMethod;
    date: Date;
  }) => void;
  onClose: () => void;
  units: 'imperial' | 'metric';
  initialWeight?: number;
  initialBodyFat?: number;
}

export function WeightLoggingWrapper({
  show,
  onSave,
  onClose,
  units,
  initialWeight,
  initialBodyFat,
}: WeightLoggingWrapperProps) {
  if (!show) return null;

  const handleSave = (data: {
    weight: number;
    bodyFatPercentage: number;
    method: MeasurementMethod;
    date: Date;
  }) => {
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <WeightLoggingScreen
        onSave={handleSave}
        onBack={onClose}
        units={units}
        initialWeight={initialWeight}
        initialBodyFat={initialBodyFat}
      />
    </div>
  );
}