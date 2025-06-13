import { renderHook } from '@testing-library/react';
import { useSwipeNavigation } from '../use-swipe-navigation';

// Mock DOM methods
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375,
});

describe('useSwipeNavigation', () => {
  let mockOnSwipeLeft: jest.Mock;
  let mockOnSwipeRight: jest.Mock;

  beforeEach(() => {
    mockOnSwipeLeft = jest.fn();
    mockOnSwipeRight = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('touchstart', jest.fn());
    document.removeEventListener('touchmove', jest.fn());
    document.removeEventListener('touchend', jest.fn());
  });

  it('should trigger onSwipeLeft for left swipe gesture', () => {
    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      })
    );

    // Simulate left swipe (start right, move left)
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 300,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent('touchend', {
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

  it('should trigger onSwipeRight for right swipe gesture', () => {
    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      })
    );

    // Simulate right swipe (start left, move right)
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 50,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent('touchend', {
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

  it('should not trigger swipe if movement is below threshold', () => {
    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      })
    );

    // Simulate small movement (below threshold)
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 200,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [
        {
          screenX: 150, // Only 50px movement (below 100px threshold)
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe if vertical movement is dominant', () => {
    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
      })
    );

    // Simulate move event with dominant vertical movement
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 200,
          screenY: 100,
        } as Touch,
      ],
    });

    const touchMoveEvent = new TouchEvent('touchmove', {
      changedTouches: [
        {
          screenX: 150, // 50px horizontal
          screenY: 250, // 150px vertical (dominant)
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent('touchend', {
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

  it('should not trigger swipe when disabled', () => {
    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
        disabled: true,
      })
    );

    // Simulate valid left swipe
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 300,
          screenY: 200,
        } as Touch,
      ],
    });

    const touchEndEvent = new TouchEvent('touchend', {
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

  it('should allow edge swipes even on conflicting elements', () => {
    // Mock a conflicting element
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-slider', 'true');
    document.body.appendChild(mockElement);

    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
        edgeThreshold: 50,
      })
    );

    // Simulate edge swipe (within 50px of edge)
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 20, // Within edge threshold
          screenY: 200,
        } as Touch,
      ],
      target: mockElement,
    });

    const touchEndEvent = new TouchEvent('touchend', {
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

  it('should respect minimum velocity for fast swipes', () => {
    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 200, // High threshold
        minVelocity: 0.5, // 0.5 px/ms
      })
    );

    // Simulate fast swipe with small distance but high velocity
    const startTime = Date.now();
    
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 200,
          screenY: 200,
        } as Touch,
      ],
    });

    // Mock fast swipe (100px in 100ms = 1 px/ms velocity)
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(startTime + 100);

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [
        {
          screenX: 100, // 100px movement (below threshold but fast)
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should handle conflicting element selectors correctly', () => {
    // Create conflicting elements
    const sliderElement = document.createElement('input');
    sliderElement.type = 'range';
    sliderElement.className = 'range-slider';
    document.body.appendChild(sliderElement);

    renderHook(() =>
      useSwipeNavigation({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 100,
        conflictSelectors: ['input[type="range"]', '.range-slider'],
      })
    );

    // Simulate swipe on conflicting element (not from edge)
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [
        {
          screenX: 200, // Not from edge
          screenY: 200,
        } as Touch,
      ],
      target: sliderElement,
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [
        {
          screenX: 50,
          screenY: 200,
        } as Touch,
      ],
    });

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();

    // Clean up
    document.body.removeChild(sliderElement);
  });
});