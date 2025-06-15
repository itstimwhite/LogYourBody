import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BodyFatStep } from "../BodyFatStep";
import { StepperProvider } from "@/contexts/StepperContext";
import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";

// Mock capacitor
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    impact: vi.fn(),
  },
  ImpactStyle: {
    Light: "light",
  },
}));

// Mock analytics
vi.mock("@/utils/weight-analytics", () => ({
  weightAnalytics: {
    startStep: vi.fn(),
    trackBodyFatInput: vi.fn(),
    completeStep: vi.fn(),
  },
}));

const renderWithStepper = (component: React.ReactElement) => {
  return render(
    <StepperProvider totalSteps={4} initialStep={1}>
      {component}
    </StepperProvider>
  );
};

describe("BodyFatStep", () => {
  const mockOnChange = vi.fn();
  const defaultValue = { value: 15 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the body fat slider with default value", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      expect(slider).toHaveValue("15");
    });

    it("displays header with icon and title", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      expect(screen.getByText("Body fat percentage?")).toBeInTheDocument();
      expect(screen.getByText("Estimate or enter your body fat percentage")).toBeInTheDocument();
    });

    it("shows slider with correct range", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      expect(slider).toHaveAttribute("min", "4");
      expect(slider).toHaveAttribute("max", "50");
      expect(slider).toHaveValue("15");
    });

    it("displays quick preset buttons", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      // Actual body fat presets from schema
      expect(screen.getByText("8%")).toBeInTheDocument();
      expect(screen.getByText("15%")).toBeInTheDocument();
      expect(screen.getByText("22%")).toBeInTheDocument();
      expect(screen.getByText("30%")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("displays current value correctly", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      // Check the current value display
      expect(screen.getByText("15.0%")).toBeInTheDocument();
    });

    it("updates value when moving slider", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      
      fireEvent.change(slider, { target: { value: "22" } });
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 22 });
    });

    it("updates value when clicking preset", async () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const preset22 = screen.getByRole("button", { name: "22% Fitness Average" });
      
      await userEvent.click(preset22);
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 22 });
    });

    it("triggers haptic feedback on native platform", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const preset = screen.getByRole("button", { name: "22% Fitness Average" });
      await userEvent.click(preset);
      
      expect(Haptics.impact).toHaveBeenCalled();
    });
  });

  describe("Slider Validation", () => {
    it("slider has correct min and max values", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      expect(slider).toHaveAttribute("min", "4");
      expect(slider).toHaveAttribute("max", "50");
    });

    it("snaps to half values when using slider", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      
      // Simulate changing to 15.3, should snap to 15.5
      fireEvent.change(slider, { target: { value: "15.3" } });
      
      expect(mockOnChange).toHaveBeenLastCalledWith({ value: 15.5 });
    });
  });

  describe("Health Warnings", () => {
    it("shows warning for extremely low body fat (< 6%)", () => {
      renderWithStepper(<BodyFatStep value={{ value: 4 }} onChange={mockOnChange} />);
      
      expect(screen.getByText(/essential levels only/i)).toBeInTheDocument();
      expect(screen.getByText(/hormone production/i)).toBeInTheDocument();
    });

    it("shows fitness info for low body fat (6-12%)", () => {
      renderWithStepper(<BodyFatStep value={{ value: 8 }} onChange={mockOnChange} />);
      
      expect(screen.getByText("8.0%")).toBeInTheDocument();
      // Check that we're in the athletic category (avoid multiple matches by using getAllByText)
      const athleticTexts = screen.getAllByText("Athletic");
      expect(athleticTexts.length).toBeGreaterThan(0);
    });

    it("shows fitness info for moderate body fat (13-17%)", () => {
      renderWithStepper(<BodyFatStep value={{ value: 15 }} onChange={mockOnChange} />);
      
      expect(screen.getByText("15.0%")).toBeInTheDocument();
      const fitnessTexts = screen.getAllByText("Fitness");
      expect(fitnessTexts.length).toBeGreaterThan(0);
    });

    it("shows average info for normal body fat (18-24%)", () => {
      renderWithStepper(<BodyFatStep value={{ value: 20 }} onChange={mockOnChange} />);
      
      expect(screen.getByText("20.0%")).toBeInTheDocument();
      const acceptableTexts = screen.getAllByText("Acceptable");
      expect(acceptableTexts.length).toBeGreaterThan(0);
    });

    it("shows health warning for high body fat (> 30%)", () => {
      renderWithStepper(<BodyFatStep value={{ value: 35 }} onChange={mockOnChange} />);
      
      expect(screen.getByText("35.0%")).toBeInTheDocument();
      expect(screen.getByText("Above Average")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("updates value with keyboard arrows on slider", async () => {
      const user = userEvent.setup();
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      await user.click(slider);
      
      // Arrow right should increase value
      await user.keyboard("{ArrowRight}");
      
      // The exact increment depends on the slider step
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels on slider", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const slider = screen.getByRole("slider", { name: /body fat percentage/i });
      expect(slider).toHaveAttribute("aria-label", "Body fat percentage");
      expect(slider).toHaveAttribute("aria-valuemin", "4");
      expect(slider).toHaveAttribute("aria-valuemax", "50");
      expect(slider).toHaveAttribute("aria-valuenow", "15");
    });

    it("announces error messages", () => {
      renderWithStepper(<BodyFatStep value={{ value: 4 }} onChange={mockOnChange} />);
      
      // Health warning should be visible
      expect(screen.getByText(/essential levels only/i)).toBeInTheDocument();
      expect(screen.getByText("Health Warning")).toBeInTheDocument();
    });
  });

  describe("Preset Selection", () => {
    it("highlights selected preset", () => {
      renderWithStepper(<BodyFatStep value={{ value: 22 }} onChange={mockOnChange} />);
      
      const preset22 = screen.getByRole("button", { name: "22% Fitness Average" });
      expect(preset22).toHaveClass("border-primary");
      expect(preset22).toHaveClass("bg-primary");
    });

    it("shows all available presets", () => {
      renderWithStepper(<BodyFatStep value={defaultValue} onChange={mockOnChange} />);
      
      const presets = ["8% Essential Athlete", "15% Athletic Fit", "22% Fitness Average", "30% Acceptable High"];
      presets.forEach(preset => {
        expect(screen.getByRole("button", { name: preset })).toBeInTheDocument();
      });
    });
  });
});