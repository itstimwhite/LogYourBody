// Onboarding Design Tokens - 2025 Mobile UX Standards
export const onboardingTokens = {
  // Typography
  typography: {
    heading: {
      fontSize: "28pt", // 37.33px
      fontWeight: "600",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
    },
    helper: {
      fontSize: "14pt", // 18.67px
      fontWeight: "400",
      lineHeight: "1.5",
      opacity: "0.6",
    },
    input: {
      fontSize: "16pt", // 21.33px
      fontWeight: "400",
      lineHeight: "1.5",
    },
    button: {
      fontSize: "16pt",
      fontWeight: "600",
      letterSpacing: "0.01em",
    },
  },

  // Spacing & Sizing
  spacing: {
    safeArea: {
      top: "env(safe-area-inset-top)",
      bottom: "env(safe-area-inset-bottom)",
      left: "env(safe-area-inset-left)",
      right: "env(safe-area-inset-right)",
    },
    padding: {
      screen: "24px",
      component: "16px",
    },
    gap: {
      small: "8px",
      medium: "16px",
      large: "24px",
      xlarge: "32px",
    },
  },

  // Component Sizes
  sizes: {
    input: {
      height: "48pt", // 64px
      borderRadius: "12pt", // 16px
      paddingX: "20px",
    },
    button: {
      height: "56pt", // 74.67px
      borderRadius: "16pt", // 21.33px
      minTouchTarget: "44pt", // 58.67px
    },
    progressDot: {
      size: "8px",
      activeSize: "10px",
      gap: "12px",
    },
  },

  // Colors
  colors: {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: {
        primary: "#0D0D0D",
        secondary: "rgba(13, 13, 13, 0.6)",
        error: "#DC2626",
      },
      border: {
        default: "#E5E7EB",
        focus: "#0066FF",
        error: "#DC2626",
      },
      accent: "#0066FF",
      accentHover: "#0052CC",
    },
    dark: {
      background: "#0D0D0D",
      surface: "#1A1A1A",
      text: {
        primary: "#FFFFFF",
        secondary: "rgba(255, 255, 255, 0.6)",
        error: "#EF4444",
      },
      border: {
        default: "#374151",
        focus: "#0066FF",
        error: "#EF4444",
      },
      accent: "#0066FF",
      accentHover: "#3385FF",
    },
  },

  // Shadows
  shadows: {
    active: "0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
    button: "0 2px 4px rgba(0, 0, 0, 0.06)",
    focus: "0 0 0 3px rgba(0, 102, 255, 0.2)",
  },

  // Animation
  animation: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      springy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },

  // Haptic Patterns
  haptics: {
    impact: {
      light: { style: "light" },
      medium: { style: "medium" },
      heavy: { style: "heavy" },
    },
    notification: {
      success: { type: "success" },
      warning: { type: "warning" },
      error: { type: "error" },
    },
  },
} as const;

// Tailwind class mappings for consistent styling
export const onboardingClasses = {
  container: "min-h-svh flex flex-col bg-background",
  // Use platform safe-area insets for proper spacing on notch devices
  safeArea: "flex-1 flex flex-col px-6 pt-safe-top pb-safe-bottom",

  progress: {
    container: "flex items-center justify-center gap-3 py-4",
    dot: "rounded-full transition-all duration-300",
    label: "text-sm text-muted-foreground ml-4",
  },

  content: {
    wrapper: "flex-1 flex flex-col justify-center",
    header: "space-y-4 mb-8",
    form: "space-y-6",
  },

  typography: {
    heading:
      "text-[28pt] font-semibold leading-tight tracking-tight text-foreground",
    helper: "text-[14pt] text-muted-foreground leading-relaxed",
    error: "text-sm text-destructive mt-2",
  },

  input: {
    wrapper: "relative",
    field: `
      w-full h-[48pt] px-5 
      text-[16pt] text-foreground 
      bg-secondary/20 dark:bg-secondary/10
      border-2 border-transparent
      rounded-2xl
      transition-all duration-200
      placeholder:text-muted-foreground/50
      focus:border-primary focus:bg-background
      focus:ring-4 focus:ring-primary/20
      focus:outline-none
    `,
    error:
      "border-destructive focus:border-destructive focus:ring-destructive/20",
  },

  button: {
    base: `
      w-full h-[56pt] 
      text-[16pt] font-semibold
      rounded-[16pt]
      transition-all duration-200
      flex items-center justify-center gap-2
      focus:outline-none focus:ring-4
    `,
    primary: `
      bg-primary text-primary-foreground
      hover:bg-primary/90 active:scale-[0.98]
      focus:ring-primary/20
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-secondary text-secondary-foreground
      hover:bg-secondary/80 active:scale-[0.98]
      focus:ring-secondary/20
    `,
  },

  animation: {
    fadeIn: "animate-in fade-in duration-300",
    slideIn: "animate-in slide-in-from-bottom-4 duration-300",
    slideOut: "animate-out slide-out-to-top-4 duration-300",
  },
} as const;
