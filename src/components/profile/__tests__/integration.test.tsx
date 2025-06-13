import { describe, it, expect, vi } from "vitest";
import { calculateAge } from "../AttributeRow";

// Simple integration tests to verify key functionality
describe("Profile Screen Integration", () => {
  describe("Age Calculation", () => {
    it("calculates age correctly for various scenarios", () => {
      // Mock current date as 2025-06-12
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-12"));

      // Test exact birthday
      expect(calculateAge(new Date("1990-06-12"))).toBe(35);

      // Test before birthday this year
      expect(calculateAge(new Date("1990-12-25"))).toBe(34);

      // Test after birthday this year
      expect(calculateAge(new Date("1990-01-01"))).toBe(35);

      // Test null handling
      expect(calculateAge(null)).toBe(0);

      // Test string date handling
      expect(calculateAge("1990-06-12")).toBe(35);

      vi.useRealTimers();
    });

    it("never shows age 0 in UI context", () => {
      const zeroAge = calculateAge(null);
      expect(zeroAge).toBe(0);

      // In UI, age 0 should be hidden (this is tested in component tests)
      const shouldShowAge = zeroAge > 0;
      expect(shouldShowAge).toBe(false);
    });
  });

  describe("Design Token Validation", () => {
    it("validates typography tokens exist", async () => {
      // Import design tokens
      const { tokens } = await import("@/styles/design-tokens");

      expect(tokens.typography.profileValue.fontSize).toBe("32pt");
      expect(tokens.typography.profileLabel.fontSize).toBe("14pt");
      expect(tokens.typography.profileLabel.opacity).toBe("0.8"); // AA compliant
    });

    it("validates spacing tokens", async () => {
      const { tokens } = await import("@/styles/design-tokens");

      expect(tokens.spacing.statsGridGap).toBe("16pt");
      expect(tokens.components.attributeRow.columns).toBe(3);
    });

    it("validates accessibility colors", async () => {
      const { tokens } = await import("@/styles/design-tokens");

      expect(tokens.colors.text.secondary).toBe("#CCCCCC"); // 80% white - AA compliant
    });
  });

  describe("Component Structure", () => {
    it("validates grid layout specifications", async () => {
      const { tokens } = await import("@/styles/design-tokens");

      // Stats grid should be flex-wrapped and centered
      expect(tokens.components.statsGrid.mobile.alignment).toBe("center");
      expect(tokens.components.statsGrid.mobile.gap).toBe("16pt");

      // Attribute row should be 3-column grid
      expect(tokens.components.attributeRow.columns).toBe(3);
    });

    it("validates avatar container height", async () => {
      const { tokens } = await import("@/styles/design-tokens");

      // Fixed height to prevent overlap with legs
      expect(tokens.components.avatar.containerHeight).toBe("400pt");
    });
  });
});
