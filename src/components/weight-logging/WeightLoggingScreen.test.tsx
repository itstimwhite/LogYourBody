import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeightLoggingScreen } from "./WeightLoggingScreen";

// Mock Capacitor modules
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
  },
  ImpactStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

// Mock HealthKit hook
vi.mock("@/hooks/use-healthkit", () => ({
  useHealthKit: vi.fn(() => ({
    isAvailable: false,
    isAuthorized: false,
    requestPermissions: vi.fn(),
    getHealthData: vi.fn(),
  })),
}));

// Mock platform detection
vi.mock("@/lib/platform", () => ({
  isNativeiOS: vi.fn(() => false),
}));

describe("WeightLoggingScreen", () => {
  const mockOnSave = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders weight input step correctly", () => {
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
      />,
    );

    expect(screen.getByText("What's your weight?")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your current weight measurement"),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

    const weightInput = screen.getByPlaceholderText("150");
    expect(weightInput).toBeInTheDocument();
    expect(weightInput).toHaveAttribute("type", "number");
  });

  it("shows metric units when units prop is metric", () => {
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="metric"
      />,
    );

    expect(screen.getByPlaceholderText("68")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
  });

  it("navigates through all steps correctly", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
      />,
    );

    // Step 1: Weight
    const weightInput = screen.getByPlaceholderText("150");
    await user.type(weightInput, "175");

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
    await user.click(continueButton);

    // Step 2: Body Fat
    await waitFor(() => {
      expect(screen.getByText("Body fat percentage?")).toBeInTheDocument();
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Step 3: Method
    await waitFor(() => {
      expect(screen.getByText("How did you measure?")).toBeInTheDocument();
      expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Step 4: Confirm
    await waitFor(() => {
      expect(screen.getByText("Review measurement")).toBeInTheDocument();
      expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
    });
  });

  it("validates weight input", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
      />,
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });

    // Should be disabled without input
    expect(continueButton).toBeDisabled();

    // Should be disabled with invalid input
    const weightInput = screen.getByPlaceholderText("150");
    await user.type(weightInput, "0");
    expect(continueButton).toBeDisabled();

    // Should be enabled with valid input
    await user.clear(weightInput);
    await user.type(weightInput, "150");
    expect(continueButton).not.toBeDisabled();
  });

  it("adjusts body fat percentage with slider", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
        initialWeight={150}
      />,
    );

    // Navigate to body fat step
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("15.0%")).toBeInTheDocument();
    });

    // Adjust slider
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "20" } });

    await waitFor(() => {
      expect(screen.getByText("20.0%")).toBeInTheDocument();
    });
  });

  it("selects measurement method", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
        initialWeight={150}
      />,
    );

    // Navigate to method step
    await user.click(screen.getByRole("button", { name: /continue/i })); // Weight
    await user.click(screen.getByRole("button", { name: /continue/i })); // Body fat

    await waitFor(() => {
      expect(screen.getByText("Digital Scale")).toBeInTheDocument();
      expect(screen.getByText("DEXA Scan")).toBeInTheDocument();
    });

    // Select DEXA method
    await user.click(screen.getByText("DEXA Scan"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Should show confirmation with selected method
    await waitFor(() => {
      expect(screen.getByText("DEXA Scan")).toBeInTheDocument();
    });
  });

  it("saves measurement data correctly", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
      />,
    );

    // Fill out weight
    const weightInput = screen.getByPlaceholderText("150");
    await user.type(weightInput, "175");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Adjust body fat
    await waitFor(() => {
      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "18" } });
    });
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Select method
    await waitFor(() => {
      expect(screen.getByText("Digital Scale")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Save measurement
    await waitFor(() => {
      expect(screen.getByText("Save Measurement")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /save measurement/i }));

    // Should call onSave with correct data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        weight: expect.closeTo(79.38, 0.1), // 175 lbs converted to kg
        bodyFatPercentage: 18,
        method: "scale",
        date: expect.any(Date),
      });
    });
  });

  it("handles back navigation correctly", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
        initialWeight={150}
      />,
    );

    // Navigate forward
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    });

    // Navigate back
    const backButton = screen.getByRole("button", { name: "" }); // Back button with ArrowLeft icon
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      expect(screen.getByText("What's your weight?")).toBeInTheDocument();
    });
  });

  it("calls onBack when back button clicked on first step", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
      />,
    );

    const backButton = screen.getByRole("button", { name: "" }); // Back button with ArrowLeft icon
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it("uses initial values when provided", () => {
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
        initialWeight={165}
        initialBodyFat={20}
      />,
    );

    const weightInput = screen.getByDisplayValue("165");
    expect(weightInput).toBeInTheDocument();
  });

  it("shows progress bar correctly", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
        initialWeight={150}
      />,
    );

    // Check initial progress
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

    // Navigate to next step and check progress
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    });
  });

  it("provides quick weight presets", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
      />,
    );

    // Check imperial presets
    expect(screen.getByText("140")).toBeInTheDocument();
    expect(screen.getByText("160")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();

    // Click a preset
    await user.click(screen.getByText("160"));

    const weightInput = screen.getByDisplayValue("160");
    expect(weightInput).toBeInTheDocument();
  });

  it("provides body fat presets", async () => {
    const user = userEvent.setup();
    render(
      <WeightLoggingScreen
        onSave={mockOnSave}
        onBack={mockOnBack}
        units="imperial"
        initialWeight={150}
      />,
    );

    // Navigate to body fat step
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("Athlete")).toBeInTheDocument();
      expect(screen.getByText("Fit")).toBeInTheDocument();
      expect(screen.getByText("Average")).toBeInTheDocument();
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    // Click athlete preset
    await user.click(screen.getByText("Athlete"));

    await waitFor(() => {
      expect(screen.getByText("8.0%")).toBeInTheDocument();
    });
  });
});
