import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { 
  Scale, 
  Scan, 
  Ruler, 
  Eye, 
  Zap, 
  MoreHorizontal,
  TrendingUp,
  CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepper } from '@/contexts/StepperContext';
import { methodSchema, type MethodData } from '@/schemas/weight-logging';
import { weightAnalytics } from '@/utils/weight-analytics';

interface MethodStepProps {
  value: MethodData;
  onChange: (method: MethodData) => void;
}

const methodOptions = [
  {
    value: 'scale' as const,
    label: 'Digital Scale',
    icon: Scale,
    description: 'Home or gym scale',
  },
  {
    value: 'dexa' as const,
    label: 'DEXA Scan',
    icon: Scan,
    description: 'Professional scan',
  },
  {
    value: 'calipers' as const,
    label: 'Calipers',
    icon: Ruler,
    description: 'Skinfold measurement',
  },
  {
    value: 'visual' as const,
    label: 'Visual Estimate',
    icon: Eye,
    description: 'Mirror assessment',
  },
  {
    value: 'bioimpedance' as const,
    label: 'Bio-impedance',
    icon: Zap,
    description: 'Smart scale/device',
  },
  {
    value: 'other' as const,
    label: 'Other',
    icon: MoreHorizontal,
    description: 'Different method',
  },
];

export function MethodStep({ value, onChange }: MethodStepProps) {
  const { setCanGoNext, goNext } = useStepper();
  const [selectedMethod, setSelectedMethod] = useState<string>(value.value);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    weightAnalytics.startStep(3);
  }, []);

  // Validate and update parent whenever selection changes
  useEffect(() => {
    if (selectedMethod) {
      const selectedOption = methodOptions.find(opt => opt.value === selectedMethod);
      if (selectedOption) {
        const methodData: MethodData = {
          value: selectedOption.value,
          label: selectedOption.label,
        };
        
        try {
          methodSchema.parse(methodData);
          onChange(methodData);
          setCanGoNext(true);
        } catch {
          setCanGoNext(false);
        }
      }
    }
  }, [selectedMethod, onChange, setCanGoNext]);

  const handleMethodSelect = async (methodValue: string) => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    setSelectedMethod(methodValue);
    setHasInteracted(true);
    
    // Track analytics
    weightAnalytics.completeStep({
      step_number: 3,
      step_name: 'method',
      interaction_type: 'tap',
      value: methodValue,
    });

    // Auto-advance after selection with slight delay for feedback
    setTimeout(() => {
      goNext();
    }, 300);
  };

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
          <TrendingUp className="w-10 h-10 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            How did you measure?
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your measurement method
          </p>
        </div>
      </div>

      {/* Method Grid */}
      <motion.div 
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        {methodOptions.map((option, index) => {
          const IconComponent = option.icon;
          const isSelected = selectedMethod === option.value;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => handleMethodSelect(option.value)}
              className={cn(
                'relative p-6 rounded-2xl border-2 transition-all duration-200',
                'flex flex-col items-center gap-3 text-center',
                'min-h-[120px] focus:outline-none focus:ring-4 focus:ring-primary/20',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/20 text-foreground border-transparent hover:border-border hover:bg-secondary/30'
              )}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              aria-label={`Select ${option.label} measurement method`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <CheckCircle className="w-5 h-5" />
                </motion.div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center',
                isSelected 
                  ? 'bg-primary-foreground/20' 
                  : 'bg-primary/10'
              )}>
                <IconComponent className={cn(
                  'w-6 h-6',
                  isSelected ? 'text-primary-foreground' : 'text-primary'
                )} />
              </div>

              {/* Label */}
              <div>
                <div className={cn(
                  'font-semibold text-sm mb-1',
                  isSelected ? 'text-primary-foreground' : 'text-foreground'
                )}>
                  {option.label}
                </div>
                <div className={cn(
                  'text-xs opacity-80',
                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                )}>
                  {option.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Helper Text */}
      <motion.div 
        className="text-center text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.25 }}
      >
        <p>Tap to select your measurement method</p>
        <p className="mt-1 opacity-75">Different methods may have varying accuracy</p>
      </motion.div>
    </motion.div>
  );
}