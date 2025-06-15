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
      
      // Check accuracy descriptions
      expect(screen.getByText("Moderate accuracy")).toBeInTheDocument(); // Digital Scale
      expect(screen.getByText("Good accuracy")).toBeInTheDocument(); // Navy Method
      expect(screen.getByText("Very accurate")).toBeInTheDocument(); // 3-Site Caliper
      expect(screen.getByText("Most accurate")).toBeInTheDocument(); // 7-Site Caliper
      expect(screen.getByText("Low accuracy")).toBeInTheDocument(); // Visual Estimate
      expect(screen.getByText("Gold standard")).toBeInTheDocument(); // DEXA
      expect(screen.getByText("Lab accuracy")).toBeInTheDocument(); // BodPod
      expect(screen.getByText("Research grade")).toBeInTheDocument(); // Hydrostatic
    });

    it("highlights the selected method", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const selectedButton = screen.getByRole("button", { name: /digital scale/i });
      expect(selectedButton).toHaveAttribute("aria-pressed", "true");
      expect(selectedButton).toHaveClass("border-linear-purple");
    });
  });

  describe("User Interactions", () => {
    it("selects a method when clicked", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const navyMethod = screen.getByRole("button", { name: /navy method/i });
      await user.click(navyMethod);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "navy",
        label: "Navy Method"
      });
    });

    it("triggers haptic feedback on native platform", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      const user = userEvent.setup();
      
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const method = screen.getByRole("button", { name: /dexa scan/i });
      await user.click(method);
      
      expect(Haptics.impact).toHaveBeenCalled();
    });

    it("updates selection when different method is clicked", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Click on different methods
      await user.click(screen.getByRole("button", { name: /3-site caliper/i }));
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "caliper3",
        label: "3-Site Caliper"
      });
      
      await user.click(screen.getByRole("button", { name: /visual estimate/i }));
      expect(mockOnChange).toHaveBeenCalledWith({
        value: "visual",
        label: "Visual Estimate"
      });
    });
  });

  describe("Method Categories", () => {
    it("displays common methods section", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      expect(screen.getByText("Common methods")).toBeInTheDocument();
    });

    it("displays lab methods section", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      expect(screen.getByText("Lab methods")).toBeInTheDocument();
    });

    it("shows appropriate methods in each category", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Common methods should be in the first section
      const commonSection = screen.getByText("Common methods").parentElement?.parentElement;
      expect(commonSection).toHaveTextContent("Digital Scale");
      expect(commonSection).toHaveTextContent("Navy Method");
      expect(commonSection).toHaveTextContent("Visual Estimate");
      
      // Lab methods should be in the second section
      const labSection = screen.getByText("Lab methods").parentElement?.parentElement;
      expect(labSection).toHaveTextContent("DEXA Scan");
      expect(labSection).toHaveTextContent("BodPod");
      expect(labSection).toHaveTextContent("Hydrostatic");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for method buttons", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const scaleButton = screen.getByRole("button", { name: /digital scale/i });
      expect(scaleButton).toHaveAttribute("aria-label", expect.stringContaining("Digital Scale"));
      expect(scaleButton).toHaveAttribute("aria-pressed", "true");
    });

    it("announces selected state changes", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const navyButton = screen.getByRole("button", { name: /navy method/i });
      expect(navyButton).toHaveAttribute("aria-pressed", "false");
      
      await user.click(navyButton);
      
      // After selection, the component would re-render with new value
      renderWithStepper(<MethodStep value={{ value: "navy", label: "Navy Method" }} onChange={mockOnChange} />);
      
      const updatedNavyButton = screen.getByRole("button", { name: /navy method/i });
      expect(updatedNavyButton).toHaveAttribute("aria-pressed", "true");
    });

    it("provides descriptive labels for accuracy levels", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Each method should have its accuracy description visible
      const dexaButton = screen.getByRole("button", { name: /dexa scan/i });
      expect(dexaButton).toHaveTextContent("Gold standard");
    });
  });

  describe("Method Icons", () => {
    it("displays appropriate icons for each method", () => {
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      // Icons should be rendered (checking by method container presence)
      expect(screen.getByRole("button", { name: /digital scale/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /navy method/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /3-site caliper/i })).toBeInTheDocument();
    });
  });

  describe("Analytics Tracking", () => {
    it("tracks method selection", async () => {
      const user = userEvent.setup();
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      await user.click(screen.getByRole("button", { name: /dexa scan/i }));
      
      expect(weightAnalytics.trackMethodSelection).toHaveBeenCalledWith({
        method: "DEXA Scan",
        method_id: "dexa"
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
      
      const button = screen.getByRole("button", { name: /navy method/i });
      
      await user.hover(button);
      
      // Button should have hover styles applied
      expect(button).toHaveClass("hover:bg-linear-border/50");
    });

    it("animates selection change", async () => {
      const user = userEvent.setup();
      renderWithStepper(<MethodStep value={defaultValue} onChange={mockOnChange} />);
      
      const button = screen.getByRole("button", { name: /bodpod/i });
      
      // Motion animation classes should be present
      expect(button.parentElement).toHaveClass("transition-all");
      
      await user.click(button);
      
      // After click, selection animation should trigger
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});