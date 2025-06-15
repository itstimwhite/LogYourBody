import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContainer({ children, className }: StepContainerProps) {
  return (
    <motion.div
      className={cn("space-y-8", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, type: "spring", damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface StepHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function StepHeader({
  icon,
  title,
  subtitle,
  iconBgColor = "bg-linear-purple/10",
  iconColor = "text-linear-purple",
}: StepHeaderProps) {
  return (
    <div className="space-y-4 text-center">
      <motion.div
        className={cn(
          "mx-auto flex h-20 w-20 items-center justify-center rounded-3xl",
          iconBgColor
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={cn("h-10 w-10", iconColor)}>{icon}</div>
      </motion.div>

      <div>
        <h1 className="mb-2 text-3xl font-bold text-linear-text">{title}</h1>
        {subtitle && (
          <p className="text-lg text-linear-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface QuickPresetsProps {
  presets: Array<{ label: string; value: any }>;
  selectedValue: any;
  onSelect: (value: any) => void;
  formatLabel?: (preset: any) => string;
  className?: string;
}

export function QuickPresets({
  presets,
  selectedValue,
  onSelect,
  formatLabel = (preset) => preset.label,
  className,
}: QuickPresetsProps) {
  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.25 }}
    >
      <p className="text-center text-sm font-medium text-linear-text-tertiary">
        Quick presets
      </p>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {presets.map((preset, index) => (
          <motion.button
            key={index}
            onClick={() => onSelect(preset.value)}
            className={cn(
              "flex-shrink-0 rounded-xl border px-4 py-3 font-medium transition-all duration-200",
              selectedValue === preset.value
                ? "border-linear-purple bg-linear-purple text-white"
                : "border-linear-border bg-linear-card text-linear-text hover:bg-linear-border/50"
            )}
            whileTap={{ scale: 0.95 }}
          >
            {formatLabel(preset)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
}

export function FormField({
  children,
  label,
  error,
  helper,
  className,
}: FormFieldProps) {
  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.25 }}
    >
      {label && (
        <label className="block text-sm font-medium text-linear-text">
          {label}
        </label>
      )}
      
      {children}

      {/* Helper Text */}
      {helper && !error && (
        <motion.p
          className="text-center text-lg text-linear-text-secondary"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {helper}
        </motion.p>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          className="text-center text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}