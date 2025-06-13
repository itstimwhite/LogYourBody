import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";

interface SettingGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingGroup = React.memo<SettingGroupProps>(
  function SettingGroup({ title, children, className }) {
    return (
      <motion.div
        className={cn("space-y-6", className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={settingsTokens.animation.normal}
      >
        {title && (
          <h2 className={cn(tw.sectionTitle, "border-b border-border pb-3")}>
            {title}
          </h2>
        )}

        <div className="space-y-1">{children}</div>
      </motion.div>
    );
  },
);
