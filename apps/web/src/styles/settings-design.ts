/**
 * Settings Design System Tokens for LogYourBody
 * 2025 Mobile-UX Standards with WCAG 2.2 AA Compliance
 */

export const settingsTokens = {
  // Layout & Spacing
  layout: {
    maxWidth: "max-w-md",
    padding: "px-4",
    safeArea: {
      top: "pt-safe-top",
      bottom: "pb-safe-bottom",
    },
    container: "mx-auto",
  },

  spacing: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    12: "48px",
    16: "64px",
    20: "80px",
  },

  // Typography
  typography: {
    // Headers
    screenTitle: {
      fontSize: "24pt",
      fontWeight: "700",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
    },
    sectionTitle: {
      fontSize: "12pt",
      fontWeight: "600",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      opacity: "0.8",
    },

    // Settings Items
    itemTitle: {
      fontSize: "16pt",
      fontWeight: "500",
      lineHeight: "1.4",
    },
    itemSubtitle: {
      fontSize: "14pt",
      fontWeight: "400",
      opacity: "0.8", // WCAG AA compliant
    },
    itemValue: {
      fontSize: "14pt",
      fontWeight: "400",
      opacity: "0.8",
    },

    // Form Elements
    inputLabel: {
      fontSize: "14pt",
      fontWeight: "500",
      marginBottom: "8px",
    },
    inputText: {
      fontSize: "16pt",
      fontWeight: "400",
      lineHeight: "1.5",
    },
    helperText: {
      fontSize: "12pt",
      fontWeight: "400",
      opacity: "0.8",
    },

    // Modal & Dialog
    modalTitle: {
      fontSize: "20pt",
      fontWeight: "600",
      lineHeight: "1.3",
    },

    // Buttons
    buttonText: {
      fontSize: "16pt",
      fontWeight: "500",
    },
  },

  // Colors (WCAG 2.2 AA Compliant)
  colors: {
    // Base colors
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",

    // Text colors (on black background)
    text: {
      primary: "#FFFFFF", // 100% white - AAA
      secondary: "#CCCCCC", // 80% white - AA compliant
      tertiary: "#999999", // 60% white - minimal use only
      disabled: "#666666", // 40% white - disabled states
    },

    // Status colors
    primary: "hsl(var(--primary))",
    destructive: "hsl(var(--destructive))",
    success: "#10B981",
    warning: "#F59E0B",

    // Interactive states
    surface: {
      default: "hsl(var(--secondary))",
      hover: "hsl(var(--secondary)/.3)",
      pressed: "hsl(var(--secondary)/.5)",
      selected: "hsl(var(--primary))",
      disabled: "hsl(var(--secondary)/.1)",
    },

    // Borders
    border: {
      default: "hsl(var(--border))",
      focused: "hsl(var(--primary))",
      error: "hsl(var(--destructive))",
    },
  },

  // Component-specific tokens
  components: {
    // Settings Group
    settingGroup: {
      spacing: "32px",
      titleMargin: "24px",
      borderColor: "hsl(var(--border))",
    },

    // Settings Item
    settingItem: {
      height: "56px", // 44pt minimum touch target + padding
      padding: "12px 16px",
      borderRadius: "12px",
      spacing: "12px",
      iconSize: "20px",
      chevronSize: "16px",
    },

    // Cards
    card: {
      padding: "20px",
      borderRadius: "16px",
      shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      border: "1px solid hsl(var(--border))",
    },

    // Modals
    modal: {
      maxWidth: "400px",
      padding: "24px",
      borderRadius: "20px",
      backdrop: "rgba(0, 0, 0, 0.5)",
      animation: {
        duration: "250ms",
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },

    // Form Controls
    input: {
      height: "48px",
      padding: "12px 16px",
      borderRadius: "12px",
      fontSize: "16pt",
      border: "1px solid hsl(var(--border))",
    },

    button: {
      height: "48px",
      padding: "12px 24px",
      borderRadius: "12px",
      fontSize: "16pt",
      fontWeight: "500",
    },

    switch: {
      width: "52px",
      height: "32px",
      thumbSize: "28px",
      padding: "2px",
    },

    segmentedControl: {
      height: "40px",
      borderRadius: "10px",
      itemPadding: "8px 16px",
      selectedShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },

    // Picker Wheel
    pickerWheel: {
      height: "240px",
      itemHeight: "40px",
      visibleItems: 6,
      fontSize: "18pt",
      spacing: "20px",
    },

    // Status indicators
    badge: {
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12pt",
      fontWeight: "500",
    },

    // Subscription card
    subscriptionCard: {
      padding: "20px",
      borderRadius: "16px",
      iconSize: "40px",
      badgeSpacing: "8px",
    },
  },

  // Animation & Transitions
  animation: {
    // Spring animations
    spring: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
      mass: 0.8,
    },

    // Standard transitions
    fast: {
      duration: 0.15,
      ease: "easeOut" as const,
    },
    normal: {
      duration: 0.25,
      ease: "easeInOut" as const,
    },
    slow: {
      duration: 0.35,
      ease: "easeInOut" as const,
    },

    // Modal animations
    modalSlideIn: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { duration: 0.25, ease: "easeOut" },
    },

    // List item animations
    listItem: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 },
      transition: { duration: 0.2, ease: "easeOut" },
    },
  },

  // Accessibility
  accessibility: {
    minimumTapTarget: "44px",
    focusRingWidth: "2px",
    focusRingColor: "hsl(var(--primary))",
    focusRingOffset: "2px",

    // ARIA labels
    labels: {
      editButton: "Edit {field}",
      toggleButton: "Toggle {feature}",
      closeModal: "Close dialog",
      saveChanges: "Save changes",
      cancelChanges: "Cancel changes",
    },

    // Reduced motion support
    reducedMotion: {
      duration: "0.01s",
      easing: "linear",
    },
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: "0px",
    tablet: "768px",
    desktop: "1024px",
  },
} as const;

// Utility functions for accessing tokens
export const getSpacing = (size: keyof typeof settingsTokens.spacing) => {
  return settingsTokens.spacing[size];
};

export const getColor = (path: string) => {
  const pathParts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = settingsTokens.colors;

  for (const part of pathParts) {
    value = value[part];
  }

  return value;
};

export const getTypography = (path: string) => {
  const pathParts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = settingsTokens.typography;

  for (const part of pathParts) {
    value = value[part];
  }

  return value;
};

// Tailwind class utilities based on tokens
export const tw = {
  // Layout
  container: `${settingsTokens.layout.maxWidth} ${settingsTokens.layout.container} ${settingsTokens.layout.padding}`,
  safeArea: `${settingsTokens.layout.safeArea.top} ${settingsTokens.layout.safeArea.bottom}`,

  // Typography
  screenTitle: "text-[24pt] font-bold leading-tight tracking-tight text-white",
  sectionTitle:
    "text-[12pt] font-semibold uppercase tracking-wider opacity-80 text-white",
  itemTitle: "text-[16pt] font-medium leading-normal text-white",
  itemSubtitle: "text-[14pt] font-normal opacity-80 text-white",
  itemValue: "text-[14pt] font-normal opacity-80 text-white",
  inputLabel: "text-[14pt] font-medium mb-2 text-white",
  inputText: "text-[16pt] font-normal leading-relaxed text-white",
  helperText: "text-[12pt] font-normal opacity-80 text-white",
  modalTitle: "text-[20pt] font-semibold leading-tight text-white",
  buttonText: "text-[16pt] font-medium text-white",

  // Components
  settingItem:
    "flex items-center justify-between min-h-[56px] px-4 py-3 rounded-xl hover:bg-secondary/20 transition-colors",
  card: "p-5 rounded-2xl border border-border bg-secondary/10",
  input:
    "h-12 px-4 rounded-xl border border-border bg-secondary text-white text-[16pt] focus:border-primary focus:outline-none",
  button: "h-12 px-6 rounded-xl text-[16pt] font-medium transition-colors",

  // States
  hover: "hover:bg-secondary/20 transition-colors duration-200",
  pressed: "active:scale-95 transition-transform duration-100",
  focus:
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  disabled: "opacity-40 pointer-events-none",
} as const;
