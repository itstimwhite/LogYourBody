import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export function StepTrackerHeader() {
  return (
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
        Steps aren&apos;t just numbers. They&apos;re energy, recovery, and progress. See how daily movement impacts your body composition.
      </motion.p>
    </div>
  );
}

