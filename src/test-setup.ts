import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock import.meta.env
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        VITE_REVENUECAT_PUBLIC_KEY: "appl_test_key_123",
        VITE_SUPABASE_URL: "https://test.supabase.co",
        VITE_SUPABASE_ANON_KEY: "test-anon-key",
      },
    },
  },
  writable: true,
  configurable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
