import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeightLoggingFlowV2 } from "../WeightLoggingFlowV2";

// Mock analytics
vi.mock("@/utils/weight-analytics", () => ({
  weightAnalytics: {
    startStep: vi.fn(),
    trackWeightInput: vi.fn(),
    trackBodyFatInput: vi.fn(),
    trackMethodSelection: vi.fn(),
    trackPhotoAdded: vi.fn(),
    completeStep: vi.fn(),
    completeFlow: vi.fn(),
    startTime: Date.now(),
  },
}));

// Mock photo capture component
vi.mock("@/components/PhotoCapture", () => ({
  PhotoCapture: ({ isOpen, onClose, onPhotoUploaded }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="photo-capture">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onPhotoUploaded("test-photo-url")}>Upload Photo</button>
      </div>
    );
  },
}));

// Mock individual step components
vi.mock("../WeightStep", () => ({
  WeightStep: ({ value, onChange }: any) => (
    <div data-testid="weight-step">
      <input
        type="number"
        value={value.value || 0}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value) || 0;
          onChange({ value: newValue, unit: value.unit });
        }}
        aria-label="Weight"
      />
      <button onClick={() => onChange({ value: 150, unit: "lbs" })}>Set 150 lbs</button>
    </div>
  ),
}));

vi.mock("../BodyFatStep", () => ({
  BodyFatStep: ({ value, onChange }: any) => (
    <div data-testid="bodyfat-step">
      <input
        type="number"
        value={value.value}
        onChange={(e) => onChange({ value: parseFloat(e.target.value) })}
        aria-label="Body Fat"
      />
      <button onClick={() => onChange({ value: 20 })}>Set 20%</button>
    </div>
  ),
}));

vi.mock("../MethodStep", () => ({
  MethodStep: ({ value, onChange }: any) => (
    <div data-testid="method-step">
      <button onClick={() => onChange({ value: "scale", label: "Digital Scale" })}>
        Digital Scale
      </button>
      <button onClick={() => onChange({ value: "navy", label: "Navy Method" })}>
        Navy Method
      </button>
    </div>
  ),
}));

vi.mock("../ReviewStep", () => ({
  ReviewStep: ({ weight, bodyFat, method, onEditStep, onAddPhoto }: any) => (
    <div data-testid="review-step">
      <div>Weight: {weight.value} {weight.unit}</div>
      <div>Body Fat: {bodyFat.value}%</div>
      <div>Method: {method.label}</div>
      <button onClick={() => onEditStep(0)}>Edit Weight</button>
      <button onClick={() => onEditStep(1)}>Edit Body Fat</button>
      <button onClick={() => onEditStep(2)}>Edit Method</button>
      {onAddPhoto && <button onClick={onAddPhoto}>Add Photo</button>}
    </div>
  ),
}));

describe("WeightLoggingFlowV2", () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Flow Navigation", () => {
    it("starts at the weight step", async () => {
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      expect(screen.getByTestId("weight-step")).toBeInTheDocument();
      expect(screen.queryByTestId("bodyfat-step")).not.toBeInTheDocument();
    });

    it("navigates through all steps in order", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Step 1: Weight
      expect(screen.getByTestId("weight-step")).toBeInTheDocument();
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Step 2: Body Fat
      await waitFor(() => {
        expect(screen.getByTestId("bodyfat-step")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Step 3: Method
      await waitFor(() => {
        expect(screen.getByTestId("method-step")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Step 4: Review
      await waitFor(() => {
        expect(screen.getByTestId("review-step")).toBeInTheDocument();
      });
    });

    it("allows going back to previous steps", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Go to body fat step
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId("bodyfat-step")).toBeInTheDocument();
      });
      
      // Go back
      await user.click(screen.getByRole("button", { name: /back/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId("weight-step")).toBeInTheDocument();
      });
    });

    it("calls onCancel when cancel is clicked", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("Progress Indicator", () => {
    it("shows progress through steps", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Check initial progress
      expect(screen.getByText("Weight")).toBeInTheDocument();
      expect(screen.getByText("1 of 4")).toBeInTheDocument();
      
      // Move to next step
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText("Body Fat")).toBeInTheDocument();
        expect(screen.getByText("2 of 4")).toBeInTheDocument();
      });
    });

    it("shows progress bar", async () => {
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "25"); // 1/4 = 25%
    });
  });

  describe("Data Persistence", () => {
    it("preserves data when navigating between steps", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Enter weight
      const weightInput = screen.getByLabelText("Weight");
      await user.clear(weightInput);
      await user.type(weightInput, "175");
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Enter body fat
      await waitFor(() => {
        expect(screen.getByTestId("bodyfat-step")).toBeInTheDocument();
      });
      const bodyFatInput = screen.getByLabelText("Body Fat");
      await user.clear(bodyFatInput);
      await user.type(bodyFatInput, "22");
      
      // Go back to weight
      await user.click(screen.getByRole("button", { name: /back/i }));
      
      // Check weight is preserved
      await waitFor(() => {
        const weightInputAgain = screen.getByLabelText("Weight");
        expect(weightInputAgain).toHaveValue(175);
      });
      
      // Go forward again
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Check body fat is preserved
      await waitFor(() => {
        const bodyFatInputAgain = screen.getByLabelText("Body Fat");
        expect(bodyFatInputAgain).toHaveValue(22);
      });
    });

    it("uses initial data when provided", async () => {
      const initialData = {
        weight: { value: 180, unit: "lbs" as const },
        bodyFat: { value: 25 },
        method: { value: "navy", label: "Navy Method" },
      };
      
      await act(async () => {
        render(
          <WeightLoggingFlowV2
            onComplete={mockOnComplete}
            onCancel={mockOnCancel}
            initialData={initialData}
          />
        );
      });
      
      const weightInput = screen.getByLabelText("Weight");
      expect(weightInput).toHaveValue(180);
    });
  });

  describe("Review Step Editing", () => {
    it("allows editing from review step", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Navigate to review
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("bodyfat-step"));
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("method-step"));
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // On review step, click edit weight
      await waitFor(() => screen.getByTestId("review-step"));
      await user.click(screen.getByText("Edit Weight"));
      
      // Should go back to weight step
      await waitFor(() => {
        expect(screen.getByTestId("weight-step")).toBeInTheDocument();
      });
    });
  });

  describe("Photo Addition", () => {
    it("opens photo capture when add photo is clicked", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Navigate to review
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("bodyfat-step"));
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("method-step"));
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Click add photo
      await waitFor(() => screen.getByTestId("review-step"));
      await user.click(screen.getByText("Add Photo"));
      
      // Photo capture should open
      expect(screen.getByTestId("photo-capture")).toBeInTheDocument();
    });

    it("tracks photo addition", async () => {
      const user = userEvent.setup();
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Navigate to review and add photo
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("bodyfat-step"));
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("method-step"));
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("review-step"));
      await user.click(screen.getByText("Add Photo"));
      
      // Upload photo
      await user.click(screen.getByText("Upload Photo"));
      
      expect(weightAnalytics.trackPhotoAdded).toHaveBeenCalledWith({
        photo_url: "test-photo-url",
      });
    });
  });

  describe("Completion", () => {
    it("calls onComplete with all data when finished", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Fill all steps
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("bodyfat-step"));
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("method-step"));
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // Complete from review
      await waitFor(() => screen.getByTestId("review-step"));
      await user.click(screen.getByRole("button", { name: /save|complete|done/i }));
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        weight: { value: 150, unit: "lbs" },
        bodyFat: { value: 20 },
        method: { value: "scale", label: "Digital Scale" },
        photoUrl: undefined,
      });
    });

    it("tracks flow completion analytics", async () => {
      const user = userEvent.setup();
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Complete flow
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("bodyfat-step"));
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("method-step"));
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("review-step"));
      await user.click(screen.getByRole("button", { name: /save|complete|done/i }));
      
      expect(weightAnalytics.completeFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          total_steps: 4,
          final_weight: "150 lbs",
          final_body_fat: "20%",
          final_method: "Digital Scale",
          had_photo: false,
        })
      );
    });
  });

  describe("Button States", () => {
    it("disables next button when step is invalid", async () => {
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Initially, with no weight entered, next should be disabled
      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it("enables next button when step is valid", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Enter valid weight
      await user.click(screen.getByText("Set 150 lbs"));
      
      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeEnabled();
    });

    it("shows 'Save' on last step instead of 'Next'", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
        );
      });
      
      // Navigate to last step
      await user.click(screen.getByText("Set 150 lbs"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("bodyfat-step"));
      await user.click(screen.getByText("Set 20%"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      await waitFor(() => screen.getByTestId("method-step"));
      await user.click(screen.getByText("Digital Scale"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      
      // On review step, button should say Save/Complete/Done
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save|complete|done/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /^next$/i })).not.toBeInTheDocument();
      });
    });
  });
});