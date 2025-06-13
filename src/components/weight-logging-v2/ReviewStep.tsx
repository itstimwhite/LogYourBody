import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Edit3, 
  Scale, 
  Percent, 
  TrendingUp, 
  Calendar,
  Camera 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepper } from '@/contexts/StepperContext';
import { type WeightData, type BodyFatData, type MethodData, weightUtils } from '@/schemas/weight-logging';
import { weightAnalytics } from '@/utils/weight-analytics';

interface ReviewStepProps {
  weight: WeightData;
  bodyFat: BodyFatData;
  method: MethodData;
  onEditStep: (step: number) => void;
  onAddPhoto?: () => void;
}

export function ReviewStep({ 
  weight, 
  bodyFat, 
  method, 
  onEditStep,
  onAddPhoto 
}: ReviewStepProps) {
  const { setCanGoNext } = useStepper();

  useEffect(() => {
    weightAnalytics.startStep(4);
    setCanGoNext(true); // Review step is always valid
  }, [setCanGoNext]);

  // Format date with proper localization
  const formatDate = (date: Date): string => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch {
      // Fallback for unsupported locales
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const currentDate = new Date();
  const weightHelper = weightUtils.getWeightHelper(weight);

  const reviewItems = [
    {
      icon: Scale,
      label: 'Weight',
      value: `${weight.value} ${weight.unit}`,
      subtitle: weightHelper,
      step: 0,
    },
    {
      icon: Percent,
      label: 'Body Fat',
      value: `${bodyFat.value.toFixed(1)}%`,
      subtitle: 'Body fat percentage',
      step: 1,
    },
    {
      icon: TrendingUp,
      label: 'Method',
      value: method.label,
      subtitle: 'Measurement method',
      step: 2,
    },
    {
      icon: Calendar,
      label: 'Date & Time',
      value: formatDate(currentDate),
      subtitle: 'Recorded automatically',
      step: -1, // Not editable
    },
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, type: 'spring', damping: 20 }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Check className="w-10 h-10 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Review measurement
          </h1>
          <p className="text-lg text-muted-foreground">
            Confirm your weight entry details
          </p>
        </div>
      </div>

      {/* Review Card */}
      <motion.div 
        className="bg-secondary/20 rounded-3xl p-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        {reviewItems.map((item, index) => {
          const IconComponent = item.icon;
          const canEdit = item.step >= 0;
          
          return (
            <motion.div
              key={item.label}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-200',
                canEdit 
                  ? 'hover:bg-secondary/30 cursor-pointer group' 
                  : 'cursor-default'
              )}
              onClick={() => canEdit && onEditStep(item.step)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              whileTap={canEdit ? { scale: 0.98 } : {}}
              role={canEdit ? 'button' : undefined}
              aria-label={canEdit ? `Edit ${item.label}` : undefined}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </span>
                  {canEdit && (
                    <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="text-lg font-semibold text-foreground truncate">
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {item.subtitle}
                </div>
              </div>

              {/* Edit Indicator */}
              {canEdit && (
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
                  <Edit3 className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Additional Actions */}
      {onAddPhoto && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
        >
          <p className="text-center text-sm text-muted-foreground font-medium">
            Optional
          </p>
          <motion.button
            onClick={onAddPhoto}
            className="w-full h-14 bg-secondary/20 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-3 hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200"
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Add photo</span>
          </motion.button>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div 
        className="bg-primary/5 rounded-2xl p-4 space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.25 }}
      >
        <div className="text-center">
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-1">
            Quick Summary
          </div>
          <div className="text-foreground">
            <span className="font-semibold text-lg">{weight.value} {weight.unit}</span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="font-semibold text-lg">{bodyFat.value.toFixed(1)}%</span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-muted-foreground">{method.label}</span>
          </div>
        </div>
      </motion.div>

      {/* Helper Text */}
      <motion.div 
        className="text-center text-muted-foreground text-sm space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.25 }}
      >
        <p>Tap any field above to edit</p>
        <p className="opacity-75">Your measurement will be saved with the current date and time</p>
      </motion.div>
    </motion.div>
  );
}