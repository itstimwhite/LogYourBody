import React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";

interface SwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  accessibilityLabel?: string;
  loading?: boolean;
}

export const Switch = React.memo<SwitchProps>(function Switch({
  enabled,
  onChange,
  disabled = false,
  className,
  size = "md",
  accessibilityLabel,
  loading = false,
}) {
  const sizes = {
    sm: {
      switch: "h-6 w-11",
      thumb: "h-4 w-4",
      translate: enabled ? "translate-x-6" : "translate-x-1",
    },
    md: {
      switch: "h-7 w-12",
      thumb: "h-5 w-5",
      translate: enabled ? "translate-x-6" : "translate-x-1",
    },
    lg: {
      switch: "h-8 w-14",
      thumb: "h-6 w-6",
      translate: enabled ? "translate-x-7" : "translate-x-1",
    },
  };

  const sizeConfig = sizes[size];

  const handleChange = (newEnabled: boolean) => {
    if (!disabled && !loading) {
      // Haptic feedback
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
        Haptics?.impact({ style: ImpactStyle.Light });
      }

      onChange(newEnabled);
    }
  };

  return (
    <HeadlessSwitch
      checked={enabled}
      onChange={handleChange}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center rounded-full transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeConfig.switch,
        enabled ? "bg-primary" : "border border-border bg-secondary/40",
        className,
      )}
      aria-label={accessibilityLabel}
    >
      {/* Track background for enabled state */}
      {enabled && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={settingsTokens.animation.fast}
        />
      )}

      {/* Thumb */}
      <motion.div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-white shadow-sm transition-all duration-200",
          sizeConfig.thumb,
          sizeConfig.translate,
          loading && "animate-pulse",
        )}
        layout
        transition={settingsTokens.animation.fast}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-primary" />
          </div>
        )}

        {/* Enabled/disabled icons */}
        {!loading && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={settingsTokens.animation.fast}
            className="flex items-center justify-center"
          >
            {enabled ? (
              <svg
                className="h-3 w-3 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </motion.div>
        )}
      </motion.div>
    </HeadlessSwitch>
  );
});

// Specialized variants for common settings
export const NotificationSwitch = React.memo<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  type: "push" | "email" | "sms";
  disabled?: boolean;
}>(function NotificationSwitch({ enabled, onChange, type, disabled }) {
  const labels = {
    push: "Push notifications",
    email: "Email notifications",
    sms: "SMS notifications",
  };

  return (
    <Switch
      enabled={enabled}
      onChange={onChange}
      disabled={disabled}
      accessibilityLabel={`Toggle ${labels[type]}`}
    />
  );
});

export const PrivacySwitch = React.memo<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  type: "analytics" | "crashReports" | "dataSharing";
  disabled?: boolean;
}>(function PrivacySwitch({ enabled, onChange, type, disabled }) {
  const labels = {
    analytics: "Analytics and usage data",
    crashReports: "Automatic crash reports",
    dataSharing: "Data sharing with partners",
  };

  return (
    <Switch
      enabled={enabled}
      onChange={onChange}
      disabled={disabled}
      accessibilityLabel={`Toggle ${labels[type]}`}
    />
  );
});
