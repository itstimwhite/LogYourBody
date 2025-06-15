import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { WeightLoggingFlowV2 } from "../WeightLoggingFlowV2";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    session: { access_token: "test-token" },
    signOut: vi.fn(),
    loading: false,
  }),
}));

// Mock healthkit hook
vi.mock("@/hooks/use-healthkit", () => ({
  useHealthKit: () => ({
    isAvailable: false,
    isAuthorized: false,
    requestAuthorization: vi.fn(),
    getLatestWeight: vi.fn(),
  }),
}));

// Mock Stepper Context
vi.mock("@/contexts/StepperContext", () => ({
  useStepper: () => ({
    currentStep: 0,
    totalSteps: 4,
    canGoNext: true,
    canGoBack: false,
    progress: 25, // Progress for step 1 of 4
    setCanGoNext: vi.fn(),
    goToStep: vi.fn(),
    goNext: vi.fn(),
    goBack: vi.fn(),
  }),
  StepperProvider: ({ children }: any) => children,
}));

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

// Since the components use React.lazy, we need to wait for them to load
// For simplicity, we'll just test the basic rendering and structure

describe("WeightLoggingFlowV2", () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the flow wrapper", async () => {
      render(
        <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );
      
      // Should render the flow container
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      });
      
      // Should show weight as the first step
      expect(screen.getByText("Weight")).toBeInTheDocument();
      
      // Should have navigation elements
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("shows navigation controls", async () => {
      render(
        <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      });
      
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });

    it("calls onCancel when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("Initial Data", () => {
    it("accepts initial data", async () => {
      const initialData = {
        weight: { value: 180, unit: "lbs" as const },
        bodyFat: { value: 25 },
        method: { value: "navy", label: "Navy Method" },
      };
      
      render(
        <WeightLoggingFlowV2
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
          initialData={initialData}
        />
      );
      
      // Just verify it renders without error
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      });
    });
  });

  describe("Analytics", () => {
    it("tracks step start", async () => {
      const { weightAnalytics } = await import("@/utils/weight-analytics");
      
      render(
        <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );
      
      await waitFor(() => {
        expect(weightAnalytics.startStep).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("Progress Display", () => {
    it("shows step count", async () => {
      render(
        <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );
      
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("handles loading state for lazy-loaded components", async () => {
      render(
        <WeightLoggingFlowV2 onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );
      
      // Component should eventually render
      await waitFor(
        () => {
          expect(screen.getByText("Weight")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("isLoading prop", () => {
    it("accepts isLoading prop", () => {
      render(
        <WeightLoggingFlowV2
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );
      
      // Just verify it renders without error
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    });
  });
});