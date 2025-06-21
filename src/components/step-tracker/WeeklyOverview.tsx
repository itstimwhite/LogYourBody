import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export interface WeekDay {
  day: string;
  steps: number;
  percentage: number;
}

interface WeeklyOverviewProps {
  weekData: WeekDay[];
  activeDay: number;
  setActiveDay: (index: number) => void;
}

export function WeeklyOverview({ weekData, activeDay, setActiveDay }: WeeklyOverviewProps) {
  return (
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
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className={`relative cursor-pointer rounded-lg p-3 text-center transition-all ${
              index === activeDay ? 'bg-linear-purple/10 ring-1 ring-linear-purple/30' : 'hover:bg-linear-border/30'
            }`}
            onClick={() => setActiveDay(index)}
          >
            <div className="mb-2 text-xs font-medium text-linear-text-tertiary">{day.day}</div>
            <div className="mb-3 h-24 relative">
              <div className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2 rounded-full bg-linear-border" style={{ height: '100%' }}>
                <motion.div
                  className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-linear-purple to-blue-400"
                  initial={{ height: 0 }}
                  animate={{ height: `${day.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                />
              </div>
            </div>
            <div className="text-xs font-semibold text-linear-text">
              {day.steps > 0 ? `${(day.steps / 1000).toFixed(1)}k` : '—'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

