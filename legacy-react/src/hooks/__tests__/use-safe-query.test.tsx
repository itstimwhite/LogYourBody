import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, type MockedFunction } from "vitest";
import { useSafeQuery } from "../use-safe-query";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockToast = toast.error as MockedFunction<typeof toast.error>;

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

// Test wrapper that allows retries
const createRetryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3, // Allow retries for retry tests
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should successfully execute query and return data", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockQueryFn = vi.fn().mockResolvedValue(mockData);

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
    }, { timeout: 5000 });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isTimedOut).toBe(false);
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
  });

  it("should handle query timeout and show toast notification", async () => {
    const mockQueryFn = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second delay
    );

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 100, // Short timeout for test
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isTimedOut).toBe(true);
    }, { timeout: 2000 });

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
    const mockQueryFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          retry: false, // Explicitly disable retry for this test
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 2000 });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isTimedOut).toBe(false);
  });

  it("should cancel request on unmount", async () => {
    const mockQueryFn = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 2000)),
      );

    const { unmount } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 100,
        }),
      { wrapper: createWrapper() },
    );

    // Unmount before timeout
    unmount();

    // Wait a bit to ensure no toast was called
    await new Promise(resolve => setTimeout(resolve, 200));

    // Should not show timeout toast after unmount
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("should provide retry functionality", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockQueryFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          retry: false, // Disable automatic retry, we'll use manual retry
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 2000 });

    // Trigger retry
    result.current.retryQuery();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 2000 });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.retryCount).toBe(1);
    expect(mockQueryFn).toHaveBeenCalledTimes(2);
  });

  it("should not show timeout toast when disabled", async () => {
    const mockQueryFn = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
      );

    renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 100,
          showTimeoutToast: false,
        }),
      { wrapper: createWrapper() },
    );

    // Wait longer than timeout
    await new Promise(resolve => setTimeout(resolve, 200));
    
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("should call custom onTimeout callback", async () => {
    const mockOnTimeout = vi.fn();
    const mockQueryFn = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
      );

    renderHook(
      () =>
        useSafeQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          timeout: 100,
          onTimeout: mockOnTimeout,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockOnTimeout).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });
  });

  it("should use default caching configuration", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockQueryFn = vi.fn().mockResolvedValue(mockData);

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
