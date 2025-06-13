/**
 * Design System Tokens for LogYourBody
 * Centralized design tokens for consistent UI across all components
 */

export const tokens = {
  // Typography
  typography: {
    // Profile screen typography tokens
    profileValue: {
      fontSize: '32pt',
      fontWeight: '600', // semibold
      lineHeight: '1.1',
    },
    profileLabel: {
      fontSize: '14pt',
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      opacity: '0.8', // AA compliant (was 0.6)
      letterSpacing: '0.05em',
    },
    profileUnit: {
      fontSize: '28pt',
      fontWeight: '500',
      opacity: '0.9',
    },
    bodyFatOverlay: {
      fontSize: '16pt',
      fontWeight: '500',
      textAlign: 'center' as const,
    },
    attributeLabel: {
      fontSize: '12pt',
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      opacity: '0.8',
      letterSpacing: '0.05em',
    },
    attributeValue: {
      fontSize: '14pt',
      fontWeight: '600',
    },
    timelineLabel: {
      fontSize: '12pt',
      fontWeight: '500',
      opacity: '0.8',
    },
    timelineValue: {
      fontSize: '16pt',
      fontWeight: '600',
    },
  },

  // Spacing
  spacing: {
    statsGridGap: '16pt',
    sectionGap: '24pt',
    containerPadding: '20pt',
    safeAreaPadding: 'env(safe-area-inset-bottom)',
  },

  // Colors (WCAG AA compliant)
  colors: {
    primary: 'hsl(var(--primary))',
    foreground: 'hsl(var(--foreground))',
    background: 'hsl(var(--background))',
    muted: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    // AA compliant text colors on black background
    text: {
      primary: '#FFFFFF', // 100% white
      secondary: '#CCCCCC', // 80% white (AA compliant)
      tertiary: '#999999', // 60% white (upgrade from this)
    },
  },

  // Animation
  animation: {
    spring: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300,
    },
    fadeIn: {
      duration: 0.25,
      ease: 'easeOut' as const,
    },
    slideIn: {
      duration: 0.3,
      ease: 'easeInOut' as const,
    },
  },

  // Breakpoints
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  // Component-specific tokens
  components: {
    statsGrid: {
      mobile: {
        columns: 2,
        gap: '16pt',
        alignment: 'center',
      },
      desktop: {
        columns: 1,
        gap: '20pt',
        alignment: 'left',
      },
    },
    attributeRow: {
      columns: 3,
      gap: '16pt',
      minHeight: '60pt',
    },
    avatar: {
      containerHeight: '400pt',
      overlayPosition: 'absolute',
      overlayTop: '20pt',
    },
    timeline: {
      trackHeight: '8pt',
      thumbSize: '24pt',
      labelSpacing: '12pt',
      containerPadding: '16pt',
    },
    tabs: {
      height: '48pt',
      borderRadius: '12pt',
      activeOpacity: 1,
      inactiveOpacity: 0.7,
    },
  },

  // Accessibility
  accessibility: {
    minimumTapTarget: '44pt',
    focusRingWidth: '2px',
    focusRingColor: 'hsl(var(--primary))',
    contrastRatio: {
      normal: 4.5,
      large: 3,
      minimum: 3,
    },
  },
} as const;

// Utility functions for design tokens
export const getTypographyStyle = (tokenPath: string) => {
  const pathParts = tokenPath.split('.');
  let value: any = tokens.typography;
  
  for (const part of pathParts) {
    value = value[part];
  }
  
  return value;
};

export const getSpacing = (tokenName: keyof typeof tokens.spacing) => {
  return tokens.spacing[tokenName];
};

export const getColor = (tokenPath: string) => {
  const pathParts = tokenPath.split('.');
  let value: any = tokens.colors;
  
  for (const part of pathParts) {
    value = value[part];
  }
  
  return value;
};

export const getAnimation = (tokenName: keyof typeof tokens.animation) => {
  return tokens.animation[tokenName];
};

// Tailwind class generators based on tokens
export const tw = {
  profileValue: 'text-[32pt] font-semibold leading-tight text-white',
  profileLabel: 'text-[14pt] font-medium uppercase opacity-80 tracking-wider text-white',
  profileUnit: 'text-[28pt] font-medium opacity-90 text-white',
  bodyFatOverlay: 'text-[16pt] font-medium text-center text-white',
  attributeLabel: 'text-[12pt] font-medium uppercase opacity-80 tracking-wider text-white',
  attributeValue: 'text-[14pt] font-semibold text-white',
  timelineLabel: 'text-[12pt] font-medium opacity-80 text-foreground',
  timelineValue: 'text-[16pt] font-semibold text-foreground',
  
  // Layout utilities
  statsGrid: 'flex flex-wrap justify-center gap-4 md:flex-col md:gap-5',
  attributeRow: 'grid grid-cols-3 gap-4 min-h-[60pt]',
  avatarContainer: 'relative h-[400pt] w-full',
  safeArea: 'pb-[env(safe-area-inset-bottom)]',
  
  // Interactive states
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  hover: 'hover:opacity-80 transition-opacity duration-200',
  active: 'active:scale-95 transition-transform duration-100',
} as const;