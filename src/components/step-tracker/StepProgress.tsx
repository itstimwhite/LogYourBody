import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
  targetSteps: number;
}

export function StepProgress({ currentStep, targetSteps }: StepProgressProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-2 text-sm font-medium text-linear-text-tertiary">Today&apos;s Progress</div>
      <div className="mb-4 flex items-baseline justify-center gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-5xl font-bold text-linear-text"
          >
            {currentStep.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span className="text-xl text-linear-text-secondary">/ {targetSteps.toLocaleString()}</span>
      </div>

      <div className="relative mx-auto h-48 w-48">
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-linear-border"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: currentStep / targetSteps }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ strokeDasharray: 553.1, strokeDashoffset: 0 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5E6AD2" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <Footprints className="mx-auto mb-2 h-8 w-8 text-linear-purple" />
            <div className="text-2xl font-bold text-linear-text">
              {Math.round((currentStep / targetSteps) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

