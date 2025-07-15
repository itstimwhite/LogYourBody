/**
 * Prefooter Component Usage Examples
 * 
 * The Prefooter component is designed to sit between main content and the footer,
 * providing a final call-to-action or important information before users reach the footer.
 */

import { Prefooter } from "./Prefooter";

// Example 1: Default variant - Feature highlight with visual elements
export function DefaultPrefooterExample() {
  return (
    <Prefooter variant="default" />
  );
}

// Example 2: Minimal variant - Simple centered CTA
export function MinimalPrefooterExample() {
  return (
    <Prefooter variant="minimal" />
  );
}

// Example 3: CTA variant - Full-featured call-to-action section
export function CTAPrefooterExample() {
  return (
    <Prefooter variant="cta" />
  );
}

// Example 4: With custom className for additional styling
export function CustomStyledPrefooterExample() {
  return (
    <Prefooter 
      variant="default" 
      className="border-t border-linear-border/50" 
    />
  );
}

// Example 5: Usage in a page layout
export function PageLayoutExample() {
  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Page content */}
      <main>
        {/* Your main content goes here */}
      </main>
      
      {/* Prefooter before the main footer */}
      <Prefooter variant="cta" />
      
      {/* Main footer */}
      {/* <Footer /> */}
    </div>
  );
}

/**
 * Usage Notes:
 * 
 * 1. The Prefooter component supports three variants:
 *    - "default": Feature highlight with side-by-side layout
 *    - "minimal": Simple centered text and CTA button
 *    - "cta": Full-featured section with gradient background
 * 
 * 2. All variants are responsive and follow the Linear.app-inspired design system
 * 
 * 3. The component uses the same color scheme as the rest of the app:
 *    - linear-bg: Dark background
 *    - linear-text: Primary text color
 *    - linear-purple: Accent color
 *    - linear-border: Border colors
 * 
 * 4. The component integrates with existing UI components like Button and Badge
 * 
 * 5. You can pass additional className prop for custom styling
 */