import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
  const supabaseMock = {
    from: vi.fn(() => supabaseMock),
    upsert: vi.fn(() => Promise.resolve({ error: null })),
  };
  return { supabase: supabaseMock };
});

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => "web"),
    isNativePlatform: vi.fn(() => false),
  },
  registerPlugin: vi.fn(() => ({})),
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: { impact: vi.fn(), notification: vi.fn() },
  ImpactStyle: { Light: "light" },
}));

import { useAuth } from "@/contexts/AuthContext";
import { OnboardingFlow } from "./OnboardingFlow";

describe("OnboardingFlow", () => {
  const mockUser = {
    id: "1",
    email: "test@example.com",
    user_metadata: {},
  } as any;
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  it("shows gender step after completing name", async () => {
    render(<OnboardingFlow onComplete={onComplete} />);

    expect(screen.getByText("What's your name?"));
    const input = screen.getByPlaceholderText("Enter your full name");
    const user = userEvent.setup();
    await user.type(input, "John Doe");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText("What's your gender?");
  });

  it("skips name step when provided and continues correctly", async () => {
    (useAuth as any).mockReturnValue({
      user: {
        ...mockUser,
        user_metadata: { name: "Jane" },
      },
    });

    render(<OnboardingFlow onComplete={onComplete} />);

    expect(screen.getByText("What's your gender?"));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Male" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText("When were you born?");
  });
});
