import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseSafeQueryOptions<T> extends Omit<UseQueryOptions<T>, "queryFn"> {
  queryFn: () => Promise<T>;
  timeout?: number;
  retryOnTimeout?: boolean;
  onTimeout?: () => void;
  showTimeoutToast?: boolean;
}

interface SafeQueryState {
  isTimedOut: boolean;
  retryCount: number;
}

export function useSafeQuery<T>({
  queryFn,
  timeout = 3000,
  retryOnTimeout = true,
  onTimeout,
  showTimeoutToast = true,
  ...queryOptions
}: UseSafeQueryOptions<T>) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<SafeQueryState>({
    isTimedOut: false,
    retryCount: 0,
  });

  const wrappedQueryFn = async (): Promise<T> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        setState((prev) => ({ ...prev, isTimedOut: true }));
        if (onTimeout) onTimeout();
        if (showTimeoutToast) {
          toast.error("Still loading…", {
            description:
              "The request is taking longer than expected. Please check your connection.",
            action: {
              label: "Retry",
              onClick: () => {
                setState((prev) => ({
                  ...prev,
                  isTimedOut: false,
                  retryCount: prev.retryCount + 1,
                }));
                queryClient.invalidateQueries({
                  queryKey: queryOptions.queryKey,
                });
              },
            },
          });
        }
        reject(new Error("Query timeout"));
      }, timeout);

      // Clear timeout if request completes or is aborted
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new Error("Query aborted"));
      });
    });

    const dataPromise = queryFn();

    try {
      // Race between data fetch and timeout
      const result = await Promise.race([dataPromise, timeoutPromise]);
      setState((prev) => ({ ...prev, isTimedOut: false }));
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "Query timeout") {
        if (retryOnTimeout) {
          // Don't throw on timeout if retry is enabled - let React Query handle retries
          throw error;
        }
      }
      throw error;
    }
  };

  const query = useQuery({
    ...queryOptions,
    queryFn: wrappedQueryFn,
    staleTime: queryOptions.staleTime ?? Infinity,
    gcTime: queryOptions.gcTime ?? 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry on abort
      if (error instanceof Error && error.message === "Query aborted") {
        return false;
      }

      // Custom retry logic for timeouts
      if (error instanceof Error && error.message === "Query timeout") {
        return retryOnTimeout && failureCount < 3;
      }

      // Default retry behavior for other errors
      return queryOptions.retry !== false && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...query,
    isTimedOut: state.isTimedOut,
    retryCount: state.retryCount,
    retryQuery: () => {
      setState((prev) => ({
        ...prev,
        isTimedOut: false,
        retryCount: prev.retryCount + 1,
      }));
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
    },
  };
}
