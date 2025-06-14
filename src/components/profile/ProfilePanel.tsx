import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, getAnimation } from "@/styles/design-tokens";
import { DashboardMetrics, UserProfile } from "@/types/bodymetrics";

import { StatsGrid, useStatsAnnouncement } from "./StatsGrid";
import { AttributeRow, useAttributeAnnouncement } from "./AttributeRow";

interface ProfilePanelProps {
  metrics: DashboardMetrics;
  user: UserProfile;
  userAge: number;
  formattedWeight: string;
  formattedHeight: string;
  formattedLeanBodyMass: string;
  className?: string;
}

export const ProfilePanel = React.memo<ProfilePanelProps>(
  function ProfilePanel({
    metrics,
    user,
    userAge,
    formattedWeight,
    formattedHeight,
    formattedLeanBodyMass,
    className,
  }) {
    const fadeIn = getAnimation("fadeIn");

    // Accessibility hooks
    useStatsAnnouncement(metrics, formattedWeight);
    useAttributeAnnouncement(user, userAge, formattedHeight);

    // Profile viewed analytics
    React.useEffect(() => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "profile_viewed", {
          event_category: "Profile",
          event_label: "Profile Panel",
          custom_parameters: {
            user_has_name: !!user.name,
            user_has_height: !!formattedHeight,
            user_has_age: userAge > 0,
            body_fat_percentage: metrics.bodyFatPercentage,
            ffmi: metrics.ffmi,
          },
        });
      }
    }, [metrics, user, userAge, formattedHeight]);

    return (
      <motion.div
        className={cn(
          "flex h-full w-full flex-col justify-center p-3 md:p-6",
          "bg-linear-bg/95 backdrop-blur-sm",
          className,
        )}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={fadeIn}
        role="region"
        aria-label="User profile and body metrics"
      >
        {/* User name header */}
        <motion.div
          className="mb-3 md:mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fadeIn, delay: 0.1 }}
        >
          <h1 className="text-sm font-semibold tracking-tight text-linear-text md:text-lg">
            {user.name || 'Anonymous User'}
          </h1>
        </motion.div>

        {/* Main stats grid */}
        <StatsGrid
          metrics={metrics}
          formattedWeight={formattedWeight}
          formattedLeanBodyMass={formattedLeanBodyMass}
        />

        {/* User attributes row */}
        <div className="mt-auto border-t border-linear-border/30">
          <AttributeRow
            user={user}
            userAge={userAge}
            formattedHeight={formattedHeight}
          />
        </div>
      </motion.div>
    );
  },
);

// Hook for comprehensive profile analytics
export const useProfileAnalytics = (
  metrics: DashboardMetrics,
  user: UserProfile,
  selectedTimelineIndex: number,
) => {
  React.useEffect(() => {
    // Track profile engagement metrics
    const profileData = {
      body_fat_percentage: metrics.bodyFatPercentage,
      weight_provided: !!metrics.weight,
      ffmi: metrics.ffmi,
      lean_body_mass: metrics.leanBodyMass,
      has_profile_image: !!user.profileImage,
      has_birth_date: !!user.birthDate,
      gender: user.gender,
      timeline_position: selectedTimelineIndex,
    };

    // Delayed analytics to track engagement
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "profile_engagement", {
          event_category: "Profile",
          event_label: "Extended View",
          custom_parameters: profileData,
        });
      }
    }, 5000); // Track after 5 seconds of viewing

    return () => clearTimeout(timer);
  }, [metrics, user, selectedTimelineIndex]);
};
