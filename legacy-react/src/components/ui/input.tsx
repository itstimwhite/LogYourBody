import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-linear-border bg-linear-card px-3 py-2 text-base text-linear-text placeholder:text-linear-text-tertiary file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-linear-text transition-all duration-200 focus:border-linear-purple focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
