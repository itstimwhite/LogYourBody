import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WeightStep } from "../WeightStep";
import { StepperProvider } from "@/contexts/StepperContext";

// Mock dependencies
vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
  },
  ImpactStyle: {
    Light: "light",
  },
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

vi.mock("@/hooks/use-healthkit", () => ({
  useHealthKit: () => ({
    loading: false,
    isAvailable: false,
    isAuthorized: false,
    requestPermissions: vi.fn(),
    getHealthData: vi.fn(),
  }),
}));

vi.mock("@/lib/platform", () => ({
  isNativeiOS: () => false,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("WeightStep", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { value: 0, unit: "lbs" as const },
    onChange: mockOnChange,
  };

  const renderWithStepper = (ui: React.ReactElement) => {
    return render(
      <StepperProvider totalSteps={4} initialStep={0}>
        {ui}
      </StepperProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Weight Input Rounding", () => {
    it("limits input to 1 decimal place", async () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      // Try to enter multiple decimal places
      fireEvent.change(input, { target: { value: "150.567" } });
      
      // Should be truncated to 1 decimal place
      expect(input).toHaveValue("150.5");
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          value: 150.5,
          unit: "lbs",
        });
      });
    });

    it("allows whole numbers without decimals", async () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "175" } });
      
      expect(input).toHaveValue("175");
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          value: 175,
          unit: "lbs",
        });
      });
    });

    it("handles decimal point at the end", () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "150." } });
      
      expect(input).toHaveValue("150.");
    });

    it("removes non-numeric characters", () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "150.5abc" } });
      
      expect(input).toHaveValue("150.5");
    });

    it("handles multiple decimal points correctly", () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "150.5.6" } });
      
      expect(input).toHaveValue("150.56");
    });
  });

  describe("Unit Conversion", () => {
    it("converts weight when toggling units", async () => {
      renderWithStepper(
        <WeightStep {...defaultProps} value={{ value: 150, unit: "lbs" }} />
      );
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      fireEvent.change(input, { target: { value: "150" } });
      
      // Click kg button
      const kgButton = screen.getByText("kg");
      fireEvent.click(kgButton);
      
      // Should convert 150 lbs to ~68.0 kg (rounded to 1 decimal)
      await waitFor(() => {
        expect(input).toHaveValue("68.0");
      });
    });

    it("maintains precision when converting back", async () => {
      renderWithStepper(
        <WeightStep {...defaultProps} value={{ value: 68.0, unit: "kg" }} />
      );
      
      const input = screen.getByRole("textbox", { name: /weight in kg/i });
      fireEvent.change(input, { target: { value: "68.0" } });
      
      // Click lbs button
      const lbsButton = screen.getByText("lbs");
      fireEvent.click(lbsButton);
      
      // Should convert 68.0 kg to ~149.9 lbs (rounded to 1 decimal)
      await waitFor(() => {
        expect(input).toHaveValue("149.9");
      });
    });
  });

  describe("Validation", () => {
    it("shows error for weight below minimum", async () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "25" } });
      
      await waitFor(() => {
        expect(screen.getByText(/weight must be at least 30 lbs/i)).toBeInTheDocument();
      });
    });

    it("shows error for weight above maximum", async () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "750" } });
      
      await waitFor(() => {
        expect(screen.getByText(/weight must be less than 700 lbs/i)).toBeInTheDocument();
      });
    });

    it("validates correctly for valid weight", async () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "150.5" } });
      
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(mockOnChange).toHaveBeenCalledWith({
          value: 150.5,
          unit: "lbs",
        });
      });
    });
  });

  describe("Preset Selection", () => {
    it("selects preset value with correct precision", () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      // Click on a preset
      const preset160 = screen.getByText("160 lbs");
      fireEvent.click(preset160);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      expect(input).toHaveValue("160");
    });

    it("highlights selected preset", () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const preset160 = screen.getByText("160 lbs");
      fireEvent.click(preset160);
      
      expect(preset160.closest("button")).toHaveClass("border-linear-purple", "bg-linear-purple");
    });
  });

  describe("Helper Text", () => {
    it("shows conversion helper for valid weight", async () => {
      renderWithStepper(<WeightStep {...defaultProps} />);
      
      const input = screen.getByRole("textbox", { name: /weight in lbs/i });
      
      fireEvent.change(input, { target: { value: "150" } });
      
      await waitFor(() => {
        expect(screen.getByText(/≈ 68.0 kg/)).toBeInTheDocument();
      });
    });

    it("shows conversion helper in opposite unit", async () => {
      renderWithStepper(
        <WeightStep {...defaultProps} value={{ value: 0, unit: "kg" }} />
      );
      
      const input = screen.getByRole("textbox", { name: /weight in kg/i });
      
      fireEvent.change(input, { target: { value: "68" } });
      
      await waitFor(() => {
        expect(screen.getByText(/≈ 149.9 lbs/)).toBeInTheDocument();
      });
    });
  });
});