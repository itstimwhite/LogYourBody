'use client'

import React, { useMemo } from "react";
import { Badge } from "./ui/badge";

interface VersionDisplayProps {
  className?: string;
  showBuildInfo?: boolean;
}

export const VersionDisplay = React.memo(function VersionDisplay({
  className = "",
}: VersionDisplayProps) {

  const versionInfo = useMemo(
    () => ({
      version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
    }),
    [],
  );

  return (
    <Badge
      variant="outline"
      className={`text-xs opacity-50 border-linear-border text-linear-text-tertiary ${className}`}
    >
      v{versionInfo.version}
    </Badge>
  );
});