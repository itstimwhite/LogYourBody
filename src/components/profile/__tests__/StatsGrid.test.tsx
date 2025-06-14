import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { StatsGrid } from "../StatsGrid";
import { DashboardMetrics } from "@/types/bodymetrics";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement("div", props, children),
  },
}));

describe("StatsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockMetrics: DashboardMetrics = {
    bodyFatPercentage: 15.5,
    ffmi: 21,
    weight: 80,
    leanBodyMass: 67.6,
    stepCount: 9000,
    date: new Date(),
  };

  it("renders exactly 5 stat items", () => {
    const { container } = render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    // Check that we have 5 stat items
    const statItems = container.querySelectorAll('[aria-label*=":"]');
    expect(statItems).toHaveLength(5);
  });

  it("displays body fat percentage with unit", () => {
    render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(screen.getByText("15.5")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("Body Fat")).toBeInTheDocument();
  });

  it("displays weight correctly", () => {
    render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(screen.getByText("176 lbs")).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
  });

  it("displays FFMI correctly", () => {
    render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("FFMI")).toBeInTheDocument();
  });

  it("displays lean body mass correctly", () => {
    render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(screen.getByText("149 lbs")).toBeInTheDocument();
    expect(screen.getByText("Lean Body Mass")).toBeInTheDocument();
  });

  it("displays step count correctly", () => {
    render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(screen.getByText("9000")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
  });

  it("has proper accessibility labels for all stats", () => {
    render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(
      screen.getByLabelText("Body fat percentage: 15.5 percent"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Weight: 176 lbs")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Fat Free Mass Index: 21"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Lean body mass: 149 lbs"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Step count: 9000")).toBeInTheDocument();
  });

  it("uses flex-wrapped, centered grid layout", () => {
    const { container } = render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass("flex", "flex-wrap", "justify-center");
  });

  it("applies design tokens correctly", () => {
    const { container } = render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    // Check for value styling (32pt, semibold)
    const valueElements = container.querySelectorAll(".text-\\[32pt\\]");
    expect(valueElements.length).toBeGreaterThan(0);

    // Check for label styling (14pt, uppercase, 80% opacity)
    const labelElements = container.querySelectorAll(".text-\\[14pt\\]");
    expect(labelElements.length).toBeGreaterThan(0);
  });

  it("handles zero values correctly", () => {
    const zeroMetrics: DashboardMetrics = {
      ...mockMetrics,
      bodyFatPercentage: 0,
      ffmi: 0,
      stepCount: 0,
    };

    render(
      <StatsGrid
        metrics={zeroMetrics}
        formattedWeight="0 lbs"
        formattedLeanBodyMass="0 lbs"
      />,
    );

    expect(screen.getByText("0.0")).toBeInTheDocument(); // Body fat with 1 decimal
    expect(screen.getByText("0")).toBeInTheDocument(); // FFMI
  });

  it("formats body fat to 1 decimal place", () => {
    const precisionMetrics: DashboardMetrics = {
      ...mockMetrics,
      bodyFatPercentage: 15.789,
    };

    render(
      <StatsGrid
        metrics={precisionMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    expect(screen.getByText("15.8")).toBeInTheDocument();
    expect(screen.queryByText("15.789")).not.toBeInTheDocument();
  });

  it("applies responsive classes correctly", () => {
    const { container } = render(
      <StatsGrid
        metrics={mockMetrics}
        formattedWeight="176 lbs"
        formattedLeanBodyMass="149 lbs"
      />,
    );

    // Should have responsive classes for mobile/desktop layouts
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass("md:flex-col");
  });
});
