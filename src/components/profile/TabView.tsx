import React, { useState, useRef } from "react";
import { Tab } from "@headlessui/react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, getAnimation } from "@/styles/design-tokens";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  defaultIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  swipeEnabled?: boolean;
}

export const TabView = React.memo<TabViewProps>(function TabView({
  tabs,
  defaultIndex = 0,
  onTabChange,
  className,
  swipeEnabled = true,
}) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
    null,
  );
  const spring = getAnimation("spring");
  const fadeIn = getAnimation("fadeIn");

  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    onTabChange?.(index);

    // Analytics for tab changes
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "tab_changed", {
        event_category: "Profile",
        event_label: "Tab Navigation",
        value: index,
        custom_parameters: {
          tab_name: tabs[index]?.label,
          total_tabs: tabs.length,
        },
      });
    }
  };

  const handleSwipe = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (!swipeEnabled) return;

    const threshold = 50; // Minimum swipe distance
    const velocity = 500; // Minimum swipe velocity

    if (
      Math.abs(info.offset.x) > threshold ||
      Math.abs(info.velocity.x) > velocity
    ) {
      if (info.offset.x > 0 && selectedIndex > 0) {
        // Swipe right - go to previous tab
        handleTabChange(selectedIndex - 1);
      } else if (info.offset.x < 0 && selectedIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        handleTabChange(selectedIndex + 1);
      }
    }

    setDragDirection(null);
  };

  const handleSwipeStart = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (!swipeEnabled) return;

    if (info.velocity.x > 0) {
      setDragDirection("right");
    } else if (info.velocity.x < 0) {
      setDragDirection("left");
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
        {/* Tab List - Safe area aware */}
        <div className="pt-safe-top flex-shrink-0">
          <Tab.List className="m-4 flex justify-center rounded-xl bg-secondary/20 p-1">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  cn(
                    "relative flex-1 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "min-h-[48pt]", // Minimum tap target
                    selected
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground",
                  )
                }
                aria-label={`Switch to ${tab.label} view`}
              >
                {({ selected }) => (
                  <>
                    <span className="relative z-10">{tab.label}</span>
                    {selected && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-primary"
                        layoutId="activeTab"
                        transition={spring}
                      />
                    )}
                  </>
                )}
              </Tab>
            ))}
          </Tab.List>
        </div>

        {/* Tab Panels - Swipeable content */}
        <div ref={containerRef} className="relative flex-1 overflow-hidden">
          <Tab.Panels className="h-full">
            <AnimatePresence mode="wait" initial={false}>
              {tabs.map((tab, index) => (
                <Tab.Panel
                  key={`${tab.id}-${selectedIndex}`} // Force remount for animations
                  className={cn(
                    "h-full w-full focus:outline-none",
                    index === selectedIndex ? "block" : "hidden",
                  )}
                  tabIndex={-1}
                >
                  <motion.div
                    className="h-full w-full"
                    drag={swipeEnabled ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragStart={handleSwipeStart}
                    onDragEnd={handleSwipe}
                    initial={{
                      opacity: 0,
                      x:
                        index > selectedIndex
                          ? 20
                          : index < selectedIndex
                            ? -20
                            : 0,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: dragDirection ? 0.98 : 1,
                    }}
                    exit={{
                      opacity: 0,
                      x: index > selectedIndex ? 20 : -20,
                    }}
                    transition={spring}
                    whileDrag={{
                      scale: 0.98,
                      rotateY:
                        dragDirection === "left"
                          ? -2
                          : dragDirection === "right"
                            ? 2
                            : 0,
                    }}
                  >
                    {tab.content}
                  </motion.div>
                </Tab.Panel>
              ))}
            </AnimatePresence>
          </Tab.Panels>
        </div>
      </Tab.Group>

      {/* Swipe indicator */}
      {swipeEnabled && dragDirection && (
        <motion.div
          className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 transform"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={fadeIn}
        >
          <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {dragDirection === "left" &&
              selectedIndex < tabs.length - 1 &&
              "Swipe to next →"}
            {dragDirection === "right" &&
              selectedIndex > 0 &&
              "← Swipe to previous"}
          </div>
        </motion.div>
      )}
    </div>
  );
});

// Hook for tab accessibility improvements
export const useTabAccessibility = (tabs: TabItem[], selectedIndex: number) => {
  React.useEffect(() => {
    // Announce tab change to screen readers
    const currentTab = tabs[selectedIndex];
    if (currentTab) {
      const announcement = `${currentTab.label} tab selected. ${selectedIndex + 1} of ${tabs.length}.`;

      // Create live region for announcement
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";

      document.body.appendChild(liveRegion);

      setTimeout(() => {
        liveRegion.textContent = announcement;

        setTimeout(() => {
          document.body.removeChild(liveRegion);
        }, 1000);
      }, 100);
    }
  }, [tabs, selectedIndex]);

  // Keyboard navigation for tabs
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle when focus is on tab components
      const target = event.target as HTMLElement;
      if (!target?.getAttribute("role")?.includes("tab")) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        // The Tab component handles this automatically
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};

// Utility for creating tab configurations
export const createProfileTabs = (
  avatarContent: React.ReactNode,
  photoContent: React.ReactNode,
): TabItem[] => [
  {
    id: "avatar",
    label: "Avatar",
    content: avatarContent,
  },
  {
    id: "photo",
    label: "Photo",
    content: photoContent,
  },
];
