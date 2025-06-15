import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSwipeNavigation } from "../use-swipe-navigation";

// Mock DOM methods
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 375,
});

describe("useSwipeNavigation", () => {
  let mockOnSwipeLeft: vi.Mock;
  let mockOnSwipeRight: vi.Mock;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    mockOnSwipeLeft = vi.fn();
    mockOnSwipeRight = vi.fn();
    vi.clearAllMocks();
    cleanup = undefined;
  });

  afterEach(() => {
    cleanup?.();
  });

  it("should trigger onSwipeLeft for left swipe gesture", () => {
    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      }),
    );
    cleanup = unmount;

    // Simulate left swipe (start right, move left)
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 300,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 100, // 200px left movement
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it("should trigger onSwipeRight for right swipe gesture", () => {
    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      }),
    );
    cleanup = unmount;

    // Simulate right swipe (start left, move right)
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 50,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 200, // 150px right movement
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
  });

  it("should not trigger swipe if movement is below threshold", () => {
    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 150, // Higher threshold
        minVelocity: 0.01, // Very low min velocity for this test
      }),
    );
    cleanup = unmount;

    // Simulate small movement (below threshold) with dominant vertical movement
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 200,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchMoveEvent = new TouchEvent("touchmove", {
      changedTouches: [
        {
          screenX: 175, // Small horizontal movement
          screenY: 300, // Large vertical movement (dominant)
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 150, // Only 50px horizontal movement (below 150px threshold)
          screenY: 350, // 150px vertical movement (dominant)
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchMoveEvent); // This should cancel the swipe
    document.dispatchEvent(touchEndEvent);

    // Should not trigger because movement is below threshold AND vertical is dominant
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it("should not trigger swipe if vertical movement is dominant", () => {
    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      }),
    );
    cleanup = unmount;

    // Simulate move event with dominant vertical movement
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 200,
          screenY: 100,
        } as Touch,
      ],
    });

    const touchMoveEvent = new TouchEvent("touchmove", {
      changedTouches: [
        {
          screenX: 150, // 50px horizontal
          screenY: 250, // 150px vertical (dominant)
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 100, // Total 100px horizontal
          screenY: 300, // Total 200px vertical
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchMoveEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it("should not trigger swipe when disabled", () => {
    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
        disabled: true,
      }),
    );
    cleanup = unmount;

    // Simulate valid left swipe
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 300,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 100,
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it("should allow edge swipes even on conflicting elements", () => {
    // Mock a conflicting element
    const mockElement = document.createElement("div");
    mockElement.setAttribute("data-slider", "true");
    document.body.appendChild(mockElement);

    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
        edgeThreshold: 50,
      }),
    );
    cleanup = unmount;

    // Simulate edge swipe (within 50px of edge)
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 20, // Within edge threshold
          screenY: 200,
        } as Touch,
      ],
      target: mockElement,
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 200,
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();

    // Clean up
    document.body.removeChild(mockElement);
  });

  it("should respect minimum velocity for fast swipes", () => {
    // First mock for touchstart, second for touchend
    const startTime = Date.now();
    vi.spyOn(Date, "now")
      .mockReturnValueOnce(startTime) // touchstart
      .mockReturnValueOnce(startTime + 100); // touchend (100ms duration)

    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 200, // High threshold
        minVelocity: 0.5, // 0.5 px/ms
      }),
    );
    cleanup = unmount;

    // Simulate fast swipe with small distance but high velocity
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 200,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 100, // 100px movement (below threshold but fast)
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    // 100px in 100ms = 1 px/ms velocity (above 0.5 px/ms minimum)
    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("should handle conflicting element selectors correctly", () => {
    // Create conflicting elements
    const sliderElement = document.createElement("input");
    sliderElement.type = "range";
    sliderElement.className = "range-slider";
    document.body.appendChild(sliderElement);

    const { unmount } = renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
        conflictSelectors: ['input[type="range"]', ".range-slider"],
        edgeThreshold: 30, // Smaller edge threshold
      }),
    );
    cleanup = unmount;

    // Create a custom touch event that properly targets the slider
    Object.defineProperty(sliderElement, 'matches', {
      value: (selector: string) => {
        return selector === 'input[type="range"]' || selector === '.range-slider';
      }
    });

    // Simulate swipe on conflicting element (not from edge)
    const touchStartEvent = new TouchEvent("touchstart", {
      changedTouches: [
        {
          screenX: 200, // Not from edge (edge threshold is 30px)
          screenY: 200,
        } as Touch,
      ],
      bubbles: true,
    });

    // Override the target property for this event
    Object.defineProperty(touchStartEvent, 'target', {
      value: sliderElement,
      writable: false
    });

    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          screenX: 50, // 150px swipe left
          screenY: 200,
        } as Touch,
      ],
      bubbles: true,
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();

    // Clean up
    document.body.removeChild(sliderElement);
  });
});
