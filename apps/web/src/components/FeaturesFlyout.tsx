import React from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDown, BarChart3, TrendingUp, Camera, Smartphone, Shield, Clock, Activity, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  id?: string;
  category?: string;
}

const trackingFeatures: Feature[] = [
  {
    icon: BarChart3,
    title: "Body Fat % Tracking",
    description: "Navy, 3-site, and 7-site methods with ±2% accuracy",
    id: "body-fat-tracking",
    category: "Core Metrics"
  },
  {
    icon: TrendingUp,
    title: "FFMI Calculator",
    description: "Track lean muscle gains and genetic potential",
    id: "ffmi-calculator",
    category: "Core Metrics"
  },
  {
    icon: Activity,
    title: "Step Tracking",
    description: "Daily movement tracking with weekly insights",
    id: "step-tracking",
    category: "Activity"
  },
];

const visualFeatures: Feature[] = [
  {
    icon: Camera,
    title: "Progress Photos",
    description: "Automated reminders with consistent angles",
    id: "progress-photos",
    category: "Visual Progress"
  },
  {
    icon: Calendar,
    title: "Timeline View",
    description: "See your body's journey through time",
    id: "timeline-feature",
    category: "Visual Progress"
  },
];

const integrationFeatures: Feature[] = [
  {
    icon: Smartphone,
    title: "Health App Sync",
    description: "Auto-import from Apple Health & Google Fit",
    id: "health-app-sync",
    category: "Integration"
  },
  {
    icon: Clock,
    title: "Quick Logging",
    description: "Complete body metrics in 30 seconds",
    id: "quick-logging",
    category: "Experience"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encrypted, you own your data",
    id: "your-data-private",
    category: "Security"
  },
];

interface FeaturesFlyoutProps {
  onFeatureClick?: (featureId: string) => void;
}

export function FeaturesFlyout({ onFeatureClick }: FeaturesFlyoutProps) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none",
              open 
                ? "text-linear-text" 
                : "text-linear-text-secondary hover:text-linear-text"
            )}
          >
            Features
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute -left-8 z-50 mt-3 w-screen max-w-3xl transform px-4 sm:px-0 lg:max-w-4xl">
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                {/* Main content area */}
                <div className="relative bg-linear-card backdrop-blur-xl">
                  {/* Header */}
                  <div className="border-b border-linear-border/50 bg-linear-bg/50 px-8 py-6">
                    <h3 className="text-lg font-semibold text-linear-text">
                      Everything you need to track real progress
                    </h3>
                    <p className="mt-1 text-sm text-linear-text-secondary">
                      Professional body composition tracking with scientific accuracy
                    </p>
                  </div>

                  {/* Features grid */}
                  <div className="grid gap-x-8 gap-y-1 p-8 lg:grid-cols-3">
                    {/* Tracking & Metrics */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                        Tracking & Metrics
                      </h4>
                      <div className="space-y-1">
                        {trackingFeatures.map((feature) => (
                          <FeatureItem
                            key={feature.id}
                            feature={feature}
                            onClick={() => onFeatureClick?.(feature.id!)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Visual Progress */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                        Visual Progress
                      </h4>
                      <div className="space-y-1">
                        {visualFeatures.map((feature) => (
                          <FeatureItem
                            key={feature.id}
                            feature={feature}
                            onClick={() => onFeatureClick?.(feature.id!)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Integration & Experience */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                        Integration & Experience
                      </h4>
                      <div className="space-y-1">
                        {integrationFeatures.map((feature) => (
                          <FeatureItem
                            key={feature.id}
                            feature={feature}
                            onClick={() => onFeatureClick?.(feature.id!)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="border-t border-linear-border/50 bg-linear-bg/30 px-8 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-linear-text-secondary">
                        <span className="font-medium text-linear-text">New!</span>{' '}
                        Step tracking now available for all users
                      </p>
                      <button
                        onClick={() => onFeatureClick?.('step-tracking')}
                        className="text-sm font-medium text-white hover:text-white/80 transition-colors"
                      >
                        Learn more →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

interface FeatureItemProps {
  feature: Feature;
  onClick: () => void;
}

function FeatureItem({ feature, onClick }: FeatureItemProps) {
  const Icon = feature.icon;
  
  return (
    <Popover.Button
      as="button"
      onClick={onClick}
      className="group relative -mx-3 flex w-full items-start gap-4 rounded-lg p-3 text-left transition-colors hover:bg-white/10"
    >
      {/* Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
        <Icon className="h-5 w-5 text-white" />
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <h5 className="mb-0.5 text-sm font-medium text-white">
          {feature.title}
        </h5>
        <p className="text-xs text-white/60">
          {feature.description}
        </p>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute inset-y-0 left-0 w-0.5 bg-white opacity-0 transition-opacity group-hover:opacity-100"
        layoutId="activeFeature"
      />
    </Popover.Button>
  );
}