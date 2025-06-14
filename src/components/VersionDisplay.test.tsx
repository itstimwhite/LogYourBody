import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VersionDisplay } from "./VersionDisplay";


describe("VersionDisplay", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { getRegistration: vi.fn().mockResolvedValue({ update: vi.fn() }) },
      configurable: true,
    });
  });

  it("shows version badge", () => {
    render(<VersionDisplay />);
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
  });

  it("checks for updates when button clicked", async () => {
    const update = vi.fn();
    const getReg = vi.fn().mockResolvedValue({ update });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { getRegistration: getReg },
      configurable: true,
    });
    const user = userEvent.setup();
    render(<VersionDisplay showBuildInfo={true} />);
    await user.click(screen.getByRole("button", { name: /check updates/i }));
    expect(getReg).toHaveBeenCalled();
    await waitFor(() => {
      expect(update).toHaveBeenCalled();
      expect(screen.getByText(/last checked/i)).toBeInTheDocument();
    });
  });

  it("updates online status on offline event", () => {
    render(<VersionDisplay showBuildInfo={true} />);
    expect(screen.getByText(/online/i)).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});
