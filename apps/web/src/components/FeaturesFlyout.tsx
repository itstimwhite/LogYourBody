import React from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FeatureSection {
  title: string;
  items: FeatureItem[];
}

interface FeatureItem {
  title: string;
  description: string;
  href?: string;
  id?: string;
  isNew?: boolean;
}

const featureSections: FeatureSection[] = [
  {
    title: "Core Features",
    items: [
      {
        title: "Track",
        description: "Log weight, body fat %, and measurements with scientific accuracy",
        id: "track-metrics",
        href: "/features/tracking"
      },
      {
        title: "Analyze",
        description: "FFMI, muscle gain rate, and phase detection insights",
        id: "analyze-progress",
        href: "/features/analytics"
      },
      {
        title: "Photos",
        description: "Progress photos with automated reminders and comparisons",
        id: "progress-photos",
        href: "/features/photos"
      },
      {
        title: "Timeline",
        description: "Visualize your body transformation journey",
        id: "timeline-view",
        href: "/features/timeline"
      }
    ]
  },
  {
    title: "More",
    items: [
      {
        title: "Health Sync",
        description: "Import from Apple Health & Google Fit",
        id: "health-sync",
        href: "/features/integrations"
      },
      {
        title: "Step Tracking",
        description: "Daily activity and NEAT insights",
        id: "step-tracking",
        href: "/features/steps",
        isNew: true
      },
      {
        title: "Privacy Shield",
        description: "Your data, encrypted and private",
        id: "privacy",
        href: "/security"
      },
      {
        title: "AI Coach",
        description: "Personalized insights powered by AI",
        id: "ai-coach",
        href: "/features/ai-coach",
        isNew: true
      }
    ]
  }
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
              "inline-flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none",
              "text-gray-400 hover:text-gray-200"
            )}
          >
            Product
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Popover.Panel className="absolute left-0 z-50 mt-6 w-[min(600px,calc(100vw-2rem))]">
              <div className="overflow-hidden rounded-xl bg-gray-900 shadow-2xl ring-1 ring-gray-800">
                <div className="relative">
                  {/* Features grid - Linear style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-800">
                    {featureSections.map((section, sectionIdx) => (
                      <div key={section.title} className="px-6 py-5">
                        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {section.title}
                        </h3>
                        <div className="space-y-0.5">
                          {section.items.map((item) => (
                            <FeatureItem
                              key={item.id || item.title}
                              item={item}
                              onClick={() => item.id && onFeatureClick?.(item.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom section with new feature highlight */}
                  <div className="border-t border-gray-800 bg-gray-900/50 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-400">
                          New: Step Tracking
                        </span>
                        <span className="text-xs text-gray-500">
                          Track daily activity and NEAT
                        </span>
                      </div>
                      <Link
                        href="/changelog"
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Changelog
                      </Link>
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
  item: FeatureItem;
  onClick: () => void;
}

function FeatureItem({ item, onClick }: FeatureItemProps) {
  const content = (
    <div className="group relative -mx-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-800/50">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
            {item.title}
          </h5>
          {item.isNew && (
            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
              NEW
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          {item.description}
        </p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} onClick={onClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="block w-full">
      {content}
    </button>
  );
}