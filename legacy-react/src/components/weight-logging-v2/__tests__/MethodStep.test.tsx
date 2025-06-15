import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MethodStep } from "../MethodStep";
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
    trackMethodSelection: vi.fn(),
    completeStep: vi.fn(),
  },
}));

const renderWithStepper = (component: React.ReactElement) => {
  return render(
    <StepperProvider totalSteps={4} initialStep={2}>
      {component}
    </StepperProvider>
  );
};

describe("MethodStep", () => {
  const mockOnChange = vi.fn();
  const defaultValue = { value: "scale", label: "Digital Scale" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all measurement method options", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Check all method options are displayed
      expect(screen.getByText("Digital Scale")).toBeInTheDocument();
      expect(screen.getByText("DEXA Scan")).toBeInTheDocument();
      expect(screen.getByText("Calipers")).toBeInTheDocument();
      expect(screen.getByText("Visual Estimate")).toBeInTheDocument();
      expect(screen.getByText("Bio-impedance")).toBeInTheDocument();
      expect(screen.getByText("Other")).toBeInTheDocument();
    });

    it("displays header with icon and title", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      expect(screen.getByText("How did you measure?")).toBeInTheDocument();
      expect(screen.getByText("Select your measurement method")).toBeInTheDocument();
    });

    it("shows accuracy level for each method", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Check accuracy descriptions - multiple instances exist, so use getAllByText
      const moderateAccuracy = screen.getAllByText("Moderate accuracy"); // Digital Scale and Bio-impedance
      expect(moderateAccuracy.length).toBeGreaterThan(0);
      
      const highAccuracy = screen.getAllByText("High accuracy"); // DEXA and Calipers
      expect(highAccuracy.length).toBeGreaterThan(0);
      
      expect(screen.getByText("Low accuracy")).toBeInTheDocument(); // Visual Estimate
      expect(screen.getByText("Variable accuracy")).toBeInTheDocument(); // Other
    });

    it("highlights the selected method", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const selectedOption = screen.getByRole("radio", { name: /digital scale/i });
      expect(selectedOption).toHaveAttribute("aria-checked", "true");
      expect(selectedOption).toHaveClass("border-primary");
    });
  });

  describe("User Interactions", () => {
    it("selects a method when clicked", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const dexaMethod = screen.getByRole("radio", { name: /dexa scan/i });
      await user.click(dexaMethod);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "dexa",
        label: "DEXA Scan"
      });
    });

    it("triggers haptic feedback on native platform", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      const user = userEvent.setup();
      
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const method = screen.getByRole("radio", { name: /dexa scan/i });
      await user.click(method);
      
      expect(Haptics.impact).toHaveBeenCalled();
    });

    it("updates selection when different method is clicked", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Clear the initial call from useEffect
      mockOnChange.mockClear();
      
      // Click on different methods
      await user.click(screen.getByRole("radio", { name: /calipers/i }));
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "calipers",
        label: "Calipers"
      });
      
      await user.click(screen.getByRole("radio", { name: /visual estimate/i }));
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "visual",
        label: "Visual Estimate"
      });
    });
  });


  describe("Accessibility", () => {
    it("has proper ARIA labels for method buttons", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const scaleButton = screen.getByRole("radio", { name: /digital scale/i });
      expect(scaleButton).toHaveAttribute("aria-checked", "true");
    });

    it("announces selected state changes", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const bioimpedanceButton = screen.getByRole("radio", { name: /bio-impedance/i });
      expect(bioimpedanceButton).toHaveAttribute("aria-checked", "false");
      
      await user.click(bioimpedanceButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "bioimpedance",
        label: "Bio-impedance"
      });
    });

    it("provides descriptive labels for accuracy levels", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Each method should have its accuracy description visible
      const dexaButton = screen.getByRole("radio", { name: /dexa scan/i });
      expect(dexaButton).toHaveTextContent("High accuracy");
    });
  });

  describe("Method Icons", () => {
    it("displays appropriate icons for each method", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Icons should be rendered (checking by method container presence)
      expect(screen.getByRole("radio", { name: /digital scale/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /bio-impedance/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /calipers/i })).toBeInTheDocument();
    });
  });

  describe("Analytics Tracking", () => {
    it("tracks method selection", async () => {
      const user = userEvent.setup();
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      await user.click(screen.getByRole("radio", { name: /dexa scan/i }));
      
      expect(weightAnalytics.completeStep).toHaveBeenCalledWith({
        step_number: 3,
        step_name: "method",
        interaction_type: "tap",
        value: "dexa"
      });
    });

    it("tracks step start on mount", async () => {
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      expect(weightAnalytics.startStep).toHaveBeenCalledWith(3);
    });
  });

  describe("Visual Feedback", () => {
    it("shows hover state on method buttons", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const button = screen.getByRole("radio", { name: /bio-impedance/i });
      
      await user.hover(button);
      
      // Button should have hover styles applied
      expect(button).toHaveClass("hover:bg-secondary/30");
    });

    it("animates selection change", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const button = screen.getByRole("radio", { name: /other/i });
      
      // Transition classes should be present
      expect(button).toHaveClass("transition-all");
      
      await user.click(button);
      
      // After click, selection animation should trigger
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});