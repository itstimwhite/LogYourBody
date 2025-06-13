import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { AttributeRow, calculateAge } from "../AttributeRow";
import { UserProfile } from "@/types/bodymetrics";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement("div", props, children),
  },
}));

describe("AttributeRow", () => {
  beforeEach(() => {
    // Mock the current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-12"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const mockUser: UserProfile = {
    id: "1",
    name: "John Doe",
    gender: "male",
    height: 180,
    birthDate: new Date("1990-06-12"),
    profileImage: "",
  };

  describe("calculateAge function", () => {
    it("calculates age correctly for exact birthday", () => {
      const birthDate = new Date("1990-06-12");
      const age = calculateAge(birthDate);
      expect(age).toBe(35);
    });

    it("calculates age correctly before birthday", () => {
      const birthDate = new Date("1990-12-25");
      const age = calculateAge(birthDate);
      expect(age).toBe(34); // Birthday hasn't passed yet
    });

    it("calculates age correctly after birthday", () => {
      const birthDate = new Date("1990-01-01");
      const age = calculateAge(birthDate);
      expect(age).toBe(35); // Birthday has passed
    });

    it("handles string birth dates", () => {
      const birthDate = "1990-06-12";
      const age = calculateAge(birthDate);
      expect(age).toBe(35);
    });

    it("returns 0 for null birth date", () => {
      const age = calculateAge(null);
      expect(age).toBe(0);
    });

    it("handles leap years correctly", () => {
      const birthDate = new Date("1988-02-29"); // Leap year
      const age = calculateAge(birthDate);
      expect(age).toBe(37);
    });

    it("uses 365.25 day calculation for accuracy", () => {
      // Test with a date that would give different results with 365 vs 365.25
      const birthDate = new Date("1989-06-12");
      const age = calculateAge(birthDate);
      expect(age).toBe(36);
    });
  });

  describe("AttributeRow component", () => {
    it("renders all attributes when age is provided", () => {
      render(
        <AttributeRow
          user={mockUser}
          userAge={35}
          formattedHeight="6'0&quot;"
        />,
      );

      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("35")).toBeInTheDocument();
      expect(screen.getByText("Height")).toBeInTheDocument();
      expect(screen.getByText("6'0\"")).toBeInTheDocument();
      expect(screen.getByText("Sex")).toBeInTheDocument();
      expect(screen.getByText("Male")).toBeInTheDocument();
    });

    it("hides age when userAge is 0", () => {
      render(
        <AttributeRow
          user={{ ...mockUser, birthDate: null }}
          userAge={0}
          formattedHeight="6'0&quot;"
        />,
      );

      const ageElement = screen.getByText("Age").closest("div");
      expect(ageElement).toHaveClass("opacity-0");
    });

    it("calculates age from birthDate when available", () => {
      render(
        <AttributeRow
          user={mockUser}
          userAge={0} // This should be overridden by calculated age
          formattedHeight="6'0&quot;"
        />,
      );

      expect(screen.getByText("35")).toBeInTheDocument();
    });

    it("falls back to userAge when birthDate is missing", () => {
      render(
        <AttributeRow
          user={{ ...mockUser, birthDate: null }}
          userAge={40}
          formattedHeight="6'0&quot;"
        />,
      );

      expect(screen.getByText("40")).toBeInTheDocument();
    });

    it("handles missing gender gracefully", () => {
      render(
        <AttributeRow
          user={{ ...mockUser, gender: undefined as any }}
          userAge={35}
          formattedHeight="6'0&quot;"
        />,
      );

      expect(screen.getByText("Not specified")).toBeInTheDocument();
    });

    it("capitalizes gender correctly", () => {
      render(
        <AttributeRow
          user={{ ...mockUser, gender: "female" }}
          userAge={35}
          formattedHeight="6'0&quot;"
        />,
      );

      expect(screen.getByText("Female")).toBeInTheDocument();
    });

    it("has proper accessibility labels", () => {
      render(
        <AttributeRow
          user={mockUser}
          userAge={35}
          formattedHeight="6'0&quot;"
        />,
      );

      expect(screen.getByLabelText("Age: 35 years old")).toBeInTheDocument();
      expect(screen.getByLabelText("Height: 6'0\"")).toBeInTheDocument();
      expect(screen.getByLabelText("Sex: male")).toBeInTheDocument();
    });

    it("renders in a 3-column grid", () => {
      const { container } = render(
        <AttributeRow
          user={mockUser}
          userAge={35}
          formattedHeight="6'0&quot;"
        />,
      );

      const gridElement = container.firstChild;
      expect(gridElement).toHaveClass("grid", "grid-cols-3");
    });
  });
});
