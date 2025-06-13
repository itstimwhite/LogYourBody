import React from 'react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, settingsTokens } from '@/styles/settings-design';

interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const SegmentedControl = React.memo<SegmentedControlProps>(function SegmentedControl({
  options,
  value,
  onChange,
  className,
  disabled = false,
  accessibilityLabel,
}) {
  const selectedIndex = options.findIndex(option => option.value === value);

  return (
    <Tab.Group
      selectedIndex={Math.max(0, selectedIndex)}
      onChange={(index) => {
        const selectedOption = options[index];
        if (selectedOption && !selectedOption.disabled && !disabled) {
          onChange(selectedOption.value);
        }
      }}
    >
      <Tab.List
        className={cn(
          'relative flex bg-secondary/20 rounded-xl p-1 border border-border',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        aria-label={accessibilityLabel}
      >
        {options.map((option, index) => (
          <Tab
            key={option.value}
            disabled={disabled || option.disabled}
            className={({ selected }) =>
              cn(
                'relative flex-1 px-4 py-2 text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
            aria-label={`Select ${option.label}`}
          >
            {({ selected }) => (
              <>
                {/* Background indicator */}
                {selected && (
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    layoutId="segmented-control-background"
                    transition={settingsTokens.animation.fast}
                  />
                )}
                
                {/* Label */}
                <span className="relative z-10">
                  {option.label}
                </span>
              </>
            )}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
});

// Predefined variants for common use cases
export const BiologicalSexControl = React.memo<{
  value: 'male' | 'female';
  onChange: (value: 'male' | 'female') => void;
  disabled?: boolean;
}>(function BiologicalSexControl({ value, onChange, disabled }) {
  const options: SegmentedControlOption[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange as (value: string) => void}
      disabled={disabled}
      accessibilityLabel="Select biological sex"
    />
  );
});

export const UnitsControl = React.memo<{
  value: 'imperial' | 'metric';
  onChange: (value: 'imperial' | 'metric') => void;
  disabled?: boolean;
}>(function UnitsControl({ value, onChange, disabled }) {
  const options: SegmentedControlOption[] = [
    { value: 'imperial', label: 'Imperial (lbs, ft/in)' },
    { value: 'metric', label: 'Metric (kg, cm)' },
  ];

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange as (value: string) => void}
      disabled={disabled}
      accessibilityLabel="Select unit system"
    />
  );
});