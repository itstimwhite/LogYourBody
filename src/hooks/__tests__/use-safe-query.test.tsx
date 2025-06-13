import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSafeQuery } from "../use-safe-query";
import { toast } from "sonner";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockToast = toast.error as jest.MockedFunction<typeof toast.error>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retry for tests
        gcTime: 0, // Disable cache for tests
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSafeQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should successfully execute query and return data", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockQueryFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isTimedOut).toBe(false);
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
  });

  it("should handle query timeout and show toast notification", async () => {
    const mockQueryFn = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second delay
    );

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 1000, // 1 second timeout
        }),
      { wrapper: createWrapper() },
    );

    // Fast-forward past timeout
    jest.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(result.current.isTimedOut).toBe(true);
    });

    expect(mockToast).toHaveBeenCalledWith("Still loading…", {
      description:
        "The request is taking longer than expected. Please check your connection.",
      action: expect.objectContaining({
        label: "Retry",
        onClick: expect.any(Function),
      }),
    });
  });

  it("should handle query errors gracefully", async () => {
    const mockError = new Error("Network error");
    const mockQueryFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isTimedOut).toBe(false);
  });

  it("should cancel request on unmount", async () => {
    const mockQueryFn = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 2000)),
      );

    const { unmount } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        }),
      { wrapper: createWrapper() },
    );

    // Unmount before query completes
    unmount();

    // Advance timers to simulate async operation
    jest.advanceTimersByTime(2100);

    // Should not show timeout toast after unmount
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("should provide retry functionality", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockQueryFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Trigger retry
    result.current.retryQuery();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.retryCount).toBe(1);
    expect(mockQueryFn).toHaveBeenCalledTimes(2);
  });

  it("should not show timeout toast when disabled", async () => {
    const mockQueryFn = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
      );

    renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 1000,
          showTimeoutToast: false,
        }),
      { wrapper: createWrapper() },
    );

    jest.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  it("should call custom onTimeout callback", async () => {
    const mockOnTimeout = jest.fn();
    const mockQueryFn = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
      );

    renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 1000,
          onTimeout: mockOnTimeout,
        }),
      { wrapper: createWrapper() },
    );

    jest.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(mockOnTimeout).toHaveBeenCalledTimes(1);
    });
  });

  it("should use default caching configuration", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockQueryFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check that staleTime is set to Infinity (data won't refetch automatically)
    expect(result.current.dataUpdatedAt).toBeTruthy();
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
  });
});
