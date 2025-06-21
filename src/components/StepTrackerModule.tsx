import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StepTrackerHeader } from "./step-tracker/StepTrackerHeader";
import { StepProgress } from "./step-tracker/StepProgress";
import { WeeklyOverview, WeekDay } from "./step-tracker/WeeklyOverview";
import { StepInsights } from "./step-tracker/StepInsights";

export function StepTrackerSection() {
  const [currentStep, setCurrentStep] = useState(7234);
  const [targetSteps] = useState(10000);
  const [activeDay, setActiveDay] = useState(4); // Friday

  // Simulate real-time step counting
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + Math.floor(Math.random() * 3);
        return next > targetSteps ? targetSteps : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [targetSteps]);

  const weekData: WeekDay[] = [
    { day: "M", steps: 8234, percentage: 82 },
    { day: "T", steps: 12456, percentage: 100 },
    { day: "W", steps: 9876, percentage: 98 },
    { day: "T", steps: 6543, percentage: 65 },
    { day: "F", steps: currentStep, percentage: (currentStep / targetSteps) * 100 },
    { day: "S", steps: 0, percentage: 0 },
    { day: "S", steps: 0, percentage: 0 },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-linear-bg via-linear-bg/95 to-linear-bg">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
      
      <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:py-32">
        <StepTrackerHeader />

        {/* Interactive dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="relative rounded-2xl border border-linear-border/50 bg-linear-card/50 p-8 backdrop-blur-xl shadow-2xl">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-linear-purple/20 to-blue-400/20 opacity-50 blur-xl" />
            
            <div className="relative">
              <StepProgress currentStep={currentStep} targetSteps={targetSteps} />

              <WeeklyOverview weekData={weekData} activeDay={activeDay} setActiveDay={setActiveDay} />

              <StepInsights />
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-linear-text-tertiary">
            Syncs automatically with Apple Health and Google Fit. No manual logging required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
