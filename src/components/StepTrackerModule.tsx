import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, TrendingUp, Zap, Activity } from "lucide-react";

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

  const weekData = [
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
        {/* Section header with Linear-style emphasis */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-linear-purple/5 px-4 py-1.5 backdrop-blur-sm"
          >
            <Activity className="h-4 w-4 text-linear-purple" />
            <span className="text-sm font-medium text-linear-purple">Now with step tracking</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-4xl font-bold tracking-tight text-linear-text sm:text-5xl lg:text-6xl"
          >
            Movement matters.
            <br />
            <span className="bg-gradient-to-r from-linear-purple to-blue-400 bg-clip-text text-transparent">
              We track it all.
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-linear-text-secondary sm:text-xl"
          >
            Steps aren&apos;t just numbers. They&apos;re energy, recovery, and progress. 
            See how daily movement impacts your body composition.
          </motion.p>
        </div>

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
              {/* Today's progress */}
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
                
                {/* Progress ring */}
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
                      animate={{ pathLength: (currentStep / targetSteps) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        strokeDasharray: 553.1,
                        strokeDashoffset: 0,
                      }}
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

              {/* Weekly overview */}
              <div className="border-t border-linear-border/50 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-linear-text-tertiary">This Week</h3>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+18% vs last week</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {weekData.map((day, index) => (
                    <motion.button
                      key={day.day}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className={`relative cursor-pointer rounded-lg p-3 text-center transition-all ${
                        index === activeDay
                          ? "bg-linear-purple/10 ring-1 ring-linear-purple/30"
                          : "hover:bg-linear-border/30"
                      }`}
                      onClick={() => setActiveDay(index)}
                      aria-pressed={index === activeDay}
                      aria-label={`Show data for day ${day.day}`}
                    >
                      <div className="mb-2 text-xs font-medium text-linear-text-tertiary">{day.day}</div>
                      <div className="mb-3 h-24 relative">
                        <div className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2 rounded-full bg-linear-border" 
                             style={{ height: '100%' }}>
                          <motion.div
                            className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-linear-purple to-blue-400"
                            initial={{ height: 0 }}
                            animate={{ height: `${day.percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-linear-text">
                        {day.steps > 0 ? `${(day.steps / 1000).toFixed(1)}k` : "—"}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Key insights */}
              <div className="mt-6 grid gap-4 border-t border-linear-border/50 pt-6 sm:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="rounded-lg bg-linear-border/20 p-4 text-center"
                >
                  <Zap className="mx-auto mb-2 h-5 w-5 text-yellow-500" />
                  <div className="text-2xl font-bold text-linear-text">1,247</div>
                  <div className="text-xs text-linear-text-tertiary">Calories burned</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="rounded-lg bg-linear-border/20 p-4 text-center"
                >
                  <Activity className="mx-auto mb-2 h-5 w-5 text-green-500" />
                  <div className="text-2xl font-bold text-linear-text">5.2</div>
                  <div className="text-xs text-linear-text-tertiary">Miles walked</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="rounded-lg bg-linear-border/20 p-4 text-center"
                >
                  <TrendingUp className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                  <div className="text-2xl font-bold text-linear-text">87%</div>
                  <div className="text-xs text-linear-text-tertiary">Goal completion</div>
                </motion.div>
              </div>
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