import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, getAnimation } from '@/styles/design-tokens';
import { DashboardMetrics } from '@/types/bodymetrics';

interface StatItem {
  value: string;
  unit?: string;
  label: string;
  accessibilityLabel: string;
}

interface StatsGridProps {
  metrics: DashboardMetrics;
  formattedWeight: string;
  formattedLeanBodyMass: string;
  className?: string;
}

export const StatsGrid = React.memo<StatsGridProps>(function StatsGrid({
  metrics,
  formattedWeight,
  formattedLeanBodyMass,
  className,
}) {
  const fadeIn = getAnimation('fadeIn');

  const stats: StatItem[] = [
    {
      value: metrics.bodyFatPercentage.toFixed(1),
      unit: '%',
      label: 'Body Fat',
      accessibilityLabel: `Body fat percentage: ${metrics.bodyFatPercentage.toFixed(1)} percent`,
    },
    {
      value: formattedWeight,
      label: 'Weight',
      accessibilityLabel: `Weight: ${formattedWeight}`,
    },
    {
      value: metrics.ffmi.toString(),
      label: 'FFMI',
      accessibilityLabel: `Fat Free Mass Index: ${metrics.ffmi}`,
    },
    {
      value: formattedLeanBodyMass,
      label: 'Lean Body Mass',
      accessibilityLabel: `Lean body mass: ${formattedLeanBodyMass}`,
    },
  ];

  return (
    <motion.div
      className={cn(tw.statsGrid, 'mb-6 md:mb-8', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeIn}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center md:text-left min-w-0 flex-shrink-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            ...fadeIn,
            delay: index * 0.05,
          }}
        >
          {/* Value with unit */}
          <div 
            className="flex items-baseline justify-center md:justify-start gap-1"
            aria-label={stat.accessibilityLabel}
          >
            <span className={cn(tw.profileValue, 'font-inter tracking-tight')}>
              {stat.value}
            </span>
            {stat.unit && (
              <span className={tw.profileUnit}>
                {stat.unit}
              </span>
            )}
          </div>
          
          {/* Label */}
          <div className={cn(tw.profileLabel, 'mt-1')}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});

// Helper hook for accessibility announcements
export const useStatsAnnouncement = (metrics: DashboardMetrics, formattedWeight: string) => {
  React.useEffect(() => {
    // Announce stats update for screen readers
    const announcement = `Stats updated: Body fat ${metrics.bodyFatPercentage.toFixed(1)} percent, Weight ${formattedWeight}, FFMI ${metrics.ffmi}`;
    
    // Create a live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    
    // Slight delay to ensure the element is ready
    setTimeout(() => {
      liveRegion.textContent = announcement;
      
      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }, 100);
  }, [metrics.bodyFatPercentage, formattedWeight, metrics.ffmi]);
};