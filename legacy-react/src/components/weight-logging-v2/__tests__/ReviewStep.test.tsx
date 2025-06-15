import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewStep } from "../ReviewStep";
import { StepperProvider } from "@/contexts/StepperContext";

// Mock analytics
vi.mock("@/utils/weight-analytics", () => ({
  weightAnalytics: {
    startStep: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock date for consistent testing
const mockDate = new Date("2025-01-14T10:30:00");
vi.useFakeTimers();
vi.setSystemTime(mockDate);

const renderWithStepper = (component: React.ReactElement) => {
  return render(
    <StepperProvider totalSteps={4} initialStep={3}>
      {component}
    </StepperProvider>
  );
};

describe("ReviewStep", () => {
  const mockOnEditStep = vi.fn();
  const mockOnAddPhoto = vi.fn();
  
  const defaultProps = {
    weight: { value: 150.5, unit: "lbs" as const },
    bodyFat: { value: 18.5 },
    method: { value: "scale", label: "Digital Scale" },
    onEditStep: mockOnEditStep,
    onAddPhoto: mockOnAddPhoto,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("displays all measurement values correctly", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      // Weight with 1 decimal place (appears in multiple places)
      const weightElements = screen.getAllByText("150.5 lbs");
      expect(weightElements.length).toBeGreaterThan(0);
      
      // Body fat with 1 decimal place (appears in multiple places)
      const bodyFatElements = screen.getAllByText("18.5%");
      expect(bodyFatElements.length).toBeGreaterThan(0);
      
      // Method (appears in multiple places)
      const methodElements = screen.getAllByText("Digital Scale");
      expect(methodElements.length).toBeGreaterThan(0);
    });

    it("shows review header with icon", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(screen.getByText("Review measurement")).toBeInTheDocument();
      expect(screen.getByText("Confirm your weight entry details")).toBeInTheDocument();
    });

    it("displays date and time", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      // Date should be formatted
      expect(screen.getByText(/Tuesday, January 14, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/10:30 AM/)).toBeInTheDocument();
    });

    it("shows weight conversion helper", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      // Should show conversion
      expect(screen.getByText(/68/)).toBeInTheDocument(); // ~68 kg
    });

    it("displays summary section", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(screen.getByText("Quick Summary")).toBeInTheDocument();
      
      // Summary should contain all values
      const summary = screen.getByText("Quick Summary").parentElement;
      expect(summary).toHaveTextContent("150.5 lbs");
      expect(summary).toHaveTextContent("18.5%");
      expect(summary).toHaveTextContent("Digital Scale");
    });
  });

  describe("Edit Functionality", () => {
    it("allows editing weight when clicked", async () => {
      vi.useRealTimers(); // Use real timers for async tests
      const user = userEvent.setup({ delay: null });
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const weightSection = screen.getByRole("button", { name: /edit weight/i });
      await user.click(weightSection);
      
      expect(mockOnEditStep).toHaveBeenCalledWith(0);
    });

    it("allows editing body fat when clicked", async () => {
      vi.useRealTimers(); // Use real timers for async tests
      const user = userEvent.setup({ delay: null });
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const bodyFatSection = screen.getByRole("button", { name: /edit body fat/i });
      await user.click(bodyFatSection);
      
      expect(mockOnEditStep).toHaveBeenCalledWith(1);
    });

    it("allows editing method when clicked", async () => {
      vi.useRealTimers(); // Use real timers for async tests
      const user = userEvent.setup({ delay: null });
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const methodSection = screen.getByRole("button", { name: /edit method/i });
      await user.click(methodSection);
      
      expect(mockOnEditStep).toHaveBeenCalledWith(2);
    });

    it("does not allow editing date/time", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      // Date section should not be a button
      const dateText = screen.getByText("Date & Time");
      const dateSection = dateText.closest("div[role='button']");
      expect(dateSection).toBeNull();
    });

    it("shows edit icon on hover for editable items", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const weightSection = screen.getByRole("button", { name: /edit weight/i });
      
      // Edit icon should be visible on hover (checking for opacity class)
      expect(weightSection).toHaveClass("group");
      const editIcon = weightSection.querySelector(".group-hover\\:opacity-100");
      expect(editIcon).toBeInTheDocument();
    });
  });

  describe("Health Warnings", () => {
    it("shows warning for dangerously low body fat", () => {
      const lowBodyFatProps = {
        ...defaultProps,
        bodyFat: { value: 4.5 },
      };
      
      renderWithStepper(<ReviewStep {...lowBodyFatProps} />);
      
      expect(screen.getByText("Health Warning")).toBeInTheDocument();
      expect(screen.getByText(/essential levels only/i)).toBeInTheDocument();
      
      // Body fat display should show warning
      expect(screen.getByText("⚠️ Dangerously low")).toBeInTheDocument();
    });

    it("does not show warning for normal body fat", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(screen.queryByText("Health Warning")).not.toBeInTheDocument();
    });

    it("highlights low body fat value in red", () => {
      const lowBodyFatProps = {
        ...defaultProps,
        bodyFat: { value: 5 },
      };
      
      renderWithStepper(<ReviewStep {...lowBodyFatProps} />);
      
      // Find the body fat value in the review items section
      const bodyFatSection = screen.getByRole("button", { name: /edit body fat/i });
      const bodyFatValue = bodyFatSection.querySelector(".text-destructive");
      expect(bodyFatValue).toBeInTheDocument();
      expect(bodyFatValue).toHaveTextContent("5.0%");
    });
  });

  describe("Photo Addition", () => {
    it("shows add photo button when onAddPhoto is provided", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(screen.getByText("Add photo")).toBeInTheDocument();
      expect(screen.getByText("Optional")).toBeInTheDocument();
    });

    it("hides add photo button when onAddPhoto is not provided", () => {
      const propsWithoutPhoto = {
        ...defaultProps,
        onAddPhoto: undefined,
      };
      
      renderWithStepper(<ReviewStep {...propsWithoutPhoto} />);
      
      expect(screen.queryByText("Add photo")).not.toBeInTheDocument();
    });

    it("calls onAddPhoto when photo button is clicked", async () => {
      vi.useRealTimers(); // Use real timers for async tests
      const user = userEvent.setup({ delay: null });
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const photoButton = screen.getByText("Add photo").closest("button")!;
      await user.click(photoButton);
      
      expect(mockOnAddPhoto).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for editable sections", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(screen.getByRole("button", { name: /edit weight/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edit body fat/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edit method/i })).toBeInTheDocument();
    });

    it("announces health warnings", () => {
      const lowBodyFatProps = {
        ...defaultProps,
        bodyFat: { value: 4 },
      };
      
      renderWithStepper(<ReviewStep {...lowBodyFatProps} />);
      
      const warning = screen.getByText("Health Warning").parentElement?.parentElement;
      expect(warning).toHaveClass("bg-destructive/10");
    });

    it("provides helper text for navigation", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(screen.getByText("Tap any field above to edit")).toBeInTheDocument();
      expect(screen.getByText(/saved with the current date and time/i)).toBeInTheDocument();
    });
  });

  describe("Value Formatting", () => {
    it("formats weight to 1 decimal place", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const weightElements = screen.getAllByText("150.5 lbs");
      expect(weightElements.length).toBeGreaterThan(0);
    });

    it("formats body fat to 1 decimal place", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const bodyFatElements = screen.getAllByText("18.5%");
      expect(bodyFatElements.length).toBeGreaterThan(0);
    });

    it("handles whole number values correctly", () => {
      const wholeNumberProps = {
        ...defaultProps,
        weight: { value: 150, unit: "lbs" as const },
        bodyFat: { value: 20 },
      };
      
      renderWithStepper(<ReviewStep {...wholeNumberProps} />);
      
      const weightElements = screen.getAllByText("150.0 lbs");
      expect(weightElements.length).toBeGreaterThan(0);
      const bodyFatElements = screen.getAllByText("20.0%");
      expect(bodyFatElements.length).toBeGreaterThan(0);
    });

    it("displays metric units correctly", () => {
      const metricProps = {
        ...defaultProps,
        weight: { value: 68.2, unit: "kg" as const },
      };
      
      renderWithStepper(<ReviewStep {...metricProps} />);
      
      const weightElements = screen.getAllByText("68.2 kg");
      expect(weightElements.length).toBeGreaterThan(0);
    });
  });

  describe("Visual Indicators", () => {
    it("shows appropriate icons for each field", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      // Check that icon containers exist
      const iconContainers = screen.getAllByRole("button").filter(button => 
        button.querySelector(".bg-primary\\/10")
      );
      
      expect(iconContainers.length).toBeGreaterThanOrEqual(3); // Weight, Body Fat, Method
    });

    it("displays check icon in header", () => {
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      const headerIcon = screen.getByText("Review measurement").parentElement?.parentElement;
      expect(headerIcon?.querySelector(".bg-primary\\/10")).toBeInTheDocument();
    });
  });

  describe("Analytics", () => {
    it("tracks step start on mount", async () => {
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      renderWithStepper(<ReviewStep {...defaultProps} />);
      
      expect(weightAnalytics.startStep).toHaveBeenCalledWith(4);
    });
  });
});