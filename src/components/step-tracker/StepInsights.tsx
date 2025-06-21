import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, TrendingUp } from 'lucide-react';

export function StepInsights() {
  return (
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
  );
}

