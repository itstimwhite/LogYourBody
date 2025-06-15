import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeightLoggingWrapper } from "../WeightLoggingWrapper";
import { useResponsive } from "@/hooks/use-responsive";
import { Dialog } from "@/components/ui/dialog";

// Mock dependencies
vi.mock("@/hooks/use-responsive", () => ({
  useResponsive: vi.fn(() => ({ isMobile: false, isTablet: false })),
}));

vi.mock("@/hooks/use-body-metrics", () => ({
  useBodyMetrics: vi.fn(() => ({
    saveEntry: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
  })),
}));

vi.mock("@/components/ui/responsive-flow-wrapper", () => ({
  ResponsiveFlowWrapper: ({ children, isOpen, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="responsive-flow-wrapper">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  },
}));

vi.mock("../WeightLoggingFlowV2", () => ({
  WeightLoggingFlowV2: ({ onComplete, onCancel }: any) => (
    <div data-testid="weight-logging-flow">
      <button onClick={onCancel}>Cancel</button>
      <button 
        onClick={() => onComplete({
          weight: { value: 150, unit: "lbs" },
          bodyFat: { value: 20 },
          method: { value: "scale", label: "Digital Scale" },
          photoUrl: "test-photo.jpg",
        })}
      >
        Complete
      </button>
    </div>
  ),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toast: (props: any) => mockToast(props),
}));

describe("WeightLoggingWrapper", () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockReset();
    vi.mocked(useResponsive).mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLoading: false,
    });
  });

  describe("Rendering", () => {
    it("renders trigger button", () => {
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      expect(screen.getByRole("button", { name: /log weight/i })).toBeInTheDocument();
    });

    it("renders custom trigger when provided", () => {
      const customTrigger = <button>Custom Trigger</button>;
      render(<WeightLoggingWrapper onSave={mockOnSave} trigger={customTrigger} />);
      
      expect(screen.getByText("Custom Trigger")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /log weight/i })).not.toBeInTheDocument();
    });

    it("uses responsive wrapper on all devices", () => {
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      const trigger = screen.getByRole("button", { name: /log weight/i });
      userEvent.click(trigger);
      
      waitFor(() => {
        expect(screen.getByTestId("responsive-flow-wrapper")).toBeInTheDocument();
      });
    });

    it("passes isOpen state to responsive wrapper", async () => {
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Initially closed
      expect(screen.queryByTestId("responsive-flow-wrapper")).not.toBeInTheDocument();
      
      // Open
      const trigger = screen.getByRole("button", { name: /log weight/i });
      await user.click(trigger);
      
      expect(screen.getByTestId("responsive-flow-wrapper")).toBeInTheDocument();
      
      // Close
      await user.click(screen.getByText("Close"));
      
      expect(screen.queryByTestId("responsive-flow-wrapper")).not.toBeInTheDocument();
    });
  });

  describe("Flow Integration", () => {
    it("opens weight logging flow when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      const trigger = screen.getByRole("button", { name: /log weight/i });
      await user.click(trigger);
      
      expect(screen.getByTestId("weight-logging-flow")).toBeInTheDocument();
    });

    it("closes flow when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      expect(screen.getByTestId("weight-logging-flow")).toBeInTheDocument();
      
      // Cancel
      await user.click(screen.getByText("Cancel"));
      
      await waitFor(() => {
        expect(screen.queryByTestId("weight-logging-flow")).not.toBeInTheDocument();
      });
    });

    it("closes flow when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      expect(screen.getByTestId("weight-logging-flow")).toBeInTheDocument();
      
      // Close via wrapper close button
      await user.click(screen.getByText("Close"));
      
      await waitFor(() => {
        expect(screen.queryByTestId("weight-logging-flow")).not.toBeInTheDocument();
      });
    });
  });

  describe("Data Saving", () => {
    it("saves data when flow is completed", async () => {
      const user = userEvent.setup();
      const { useBodyMetrics } = await import("@/hooks/use-body-metrics");
      const mockSaveEntry = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useBodyMetrics).mockReturnValue({
        saveEntry: mockSaveEntry,
        isLoading: false,
        error: null,
        entries: [],
        fetchEntries: vi.fn(),
        getLatestEntry: vi.fn(),
        deleteEntry: vi.fn(),
        updateEntry: vi.fn(),
      });
      
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open and complete flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      await user.click(screen.getByText("Complete"));
      
      await waitFor(() => {
        expect(mockSaveEntry).toHaveBeenCalledWith({
          weight: 150,
          weight_unit: "lbs",
          body_fat_percentage: 20,
          measurement_method: "scale",
          photo_url: "test-photo.jpg",
        });
      });
    });

    it("calls onSave callback after successful save", async () => {
      const user = userEvent.setup();
      const { useBodyMetrics } = await import("@/hooks/use-body-metrics");
      const mockSaveEntry = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useBodyMetrics).mockReturnValue({
        saveEntry: mockSaveEntry,
        isLoading: false,
        error: null,
        entries: [],
        fetchEntries: vi.fn(),
        getLatestEntry: vi.fn(),
        deleteEntry: vi.fn(),
        updateEntry: vi.fn(),
      });
      
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open and complete flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      await user.click(screen.getByText("Complete"));
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          weight: { value: 150, unit: "lbs" },
          bodyFat: { value: 20 },
          method: { value: "scale", label: "Digital Scale" },
          photoUrl: "test-photo.jpg",
        });
      });
    });

    it("shows success toast after saving", async () => {
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open and complete flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      await user.click(screen.getByText("Complete"));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Entry saved",
          description: "Your weight has been logged successfully",
        });
      });
    });

    it("shows error toast when save fails", async () => {
      const user = userEvent.setup();
      const { useBodyMetrics } = await import("@/hooks/use-body-metrics");
      const mockSaveEntry = vi.fn().mockRejectedValue(new Error("Save failed"));
      vi.mocked(useBodyMetrics).mockReturnValue({
        saveEntry: mockSaveEntry,
        isLoading: false,
        error: null,
        entries: [],
        fetchEntries: vi.fn(),
        getLatestEntry: vi.fn(),
        deleteEntry: vi.fn(),
        updateEntry: vi.fn(),
      });
      
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open and complete flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      await user.click(screen.getByText("Complete"));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error saving entry",
          description: "Save failed",
          variant: "destructive",
        });
      });
    });

    it("closes dialog after successful save", async () => {
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open and complete flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      expect(screen.getByTestId("weight-logging-flow")).toBeInTheDocument();
      
      await user.click(screen.getByText("Complete"));
      
      await waitFor(() => {
        expect(screen.queryByTestId("weight-logging-flow")).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading state while saving", async () => {
      const user = userEvent.setup();
      const { useBodyMetrics } = await import("@/hooks/use-body-metrics");
      
      // Create a promise we can control
      let resolvePromise: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      const mockSaveEntry = vi.fn().mockReturnValue(savePromise);
      vi.mocked(useBodyMetrics).mockReturnValue({
        saveEntry: mockSaveEntry,
        isLoading: false,
        error: null,
        entries: [],
        fetchEntries: vi.fn(),
        getLatestEntry: vi.fn(),
        deleteEntry: vi.fn(),
        updateEntry: vi.fn(),
      });
      
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      // Open and complete flow
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      await user.click(screen.getByText("Complete"));
      
      // Dialog should still be open during save
      expect(screen.getByTestId("weight-logging-flow")).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise!();
      
      // Dialog should close after save completes
      await waitFor(() => {
        expect(screen.queryByTestId("weight-logging-flow")).not.toBeInTheDocument();
      });
    });
  });

  describe("Responsive Behavior", () => {
    it("uses responsive wrapper on mobile", async () => {
      vi.mocked(useResponsive).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLoading: false,
      });
      
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      
      expect(screen.getByTestId("responsive-flow-wrapper")).toBeInTheDocument();
    });

    it("uses responsive wrapper on tablet", async () => {
      vi.mocked(useResponsive).mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLoading: false,
      });
      
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      
      expect(screen.getByTestId("responsive-flow-wrapper")).toBeInTheDocument();
    });

    it("uses responsive wrapper on desktop", async () => {
      vi.mocked(useResponsive).mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLoading: false,
      });
      
      const user = userEvent.setup();
      render(<WeightLoggingWrapper onSave={mockOnSave} />);
      
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      
      expect(screen.getByTestId("responsive-flow-wrapper")).toBeInTheDocument();
    });
  });

  describe("Initial Data", () => {
    it("passes initial data to flow when provided", async () => {
      const user = userEvent.setup();
      const initialData = {
        weight: { value: 175, unit: "kg" as const },
        bodyFat: { value: 22 },
        method: { value: "navy", label: "Navy Method" },
      };
      
      // Create a custom mock component for this specific test
      const MockWeightLoggingFlowV2 = ({ initialData: receivedData, onComplete }: any) => (
        <div data-testid="weight-logging-flow">
          <div data-testid="initial-data">{JSON.stringify(receivedData)}</div>
          <button onClick={() => onComplete({
            weight: receivedData?.weight || { value: 150, unit: "lbs" },
            bodyFat: receivedData?.bodyFat || { value: 20 },
            method: receivedData?.method || { value: "scale", label: "Digital Scale" },
          })}>
            Complete
          </button>
        </div>
      );
      
      // Re-mock the module with the new component
      vi.doMock("../WeightLoggingFlowV2", () => ({
        WeightLoggingFlowV2: MockWeightLoggingFlowV2,
      }));
      
      render(<WeightLoggingWrapper onSave={mockOnSave} initialData={initialData} />);
      
      await user.click(screen.getByRole("button", { name: /log weight/i }));
      
      const dataElement = screen.getByTestId("initial-data");
      expect(dataElement).toHaveTextContent(JSON.stringify(initialData));
    });
  });
});