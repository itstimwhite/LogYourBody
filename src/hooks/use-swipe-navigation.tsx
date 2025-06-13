import { useEffect, useRef, useCallback } from "react";

interface UseSwipeNavigationOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  threshold?: number;
  minVelocity?: number;
  edgeThreshold?: number;
  conflictSelectors?: string[];
  disabled?: boolean;
}

export function useSwipeNavigation({
  onSwipeRight,
  onSwipeLeft,
  threshold = 100,
  minVelocity = 0.3,
  edgeThreshold = 50,
  conflictSelectors = [
    "[data-slider]",
    "[data-carousel]",
    ".swiper-container",
    '[role="slider"]',
    'input[type="range"]',
    ".range-slider",
    ".timeline-slider",
  ],
  disabled = false,
}: UseSwipeNavigationOptions) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isSwipeActive = useRef<boolean>(false);

  const isConflictingElement = useCallback(
    (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;

      // Check if target or any parent matches conflict selectors
      let element: Element | null = target;
      while (element) {
        for (const selector of conflictSelectors) {
          if (element.matches?.(selector)) {
            return true;
          }
        }
        element = element.parentElement;
      }

      return false;
    },
    [conflictSelectors],
  );

  const isEdgeSwipe = useCallback(
    (startX: number): boolean => {
      const windowWidth = window.innerWidth;
      return startX <= edgeThreshold || startX >= windowWidth - edgeThreshold;
    },
    [edgeThreshold],
  );

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent swipe on conflicting elements unless it's an edge swipe
      if (
        isConflictingElement(e.target) &&
        !isEdgeSwipe(e.changedTouches[0].screenX)
      ) {
        isSwipeActive.current = false;
        return;
      }

      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
      touchStartTime.current = Date.now();
      isSwipeActive.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeActive.current) return;

      const currentX = e.changedTouches[0].screenX;
      const currentY = e.changedTouches[0].screenY;

      const deltaX = Math.abs(currentX - touchStartX.current);
      const deltaY = Math.abs(currentY - touchStartY.current);

      // If vertical movement is dominant, cancel swipe
      if (deltaY > deltaX && deltaY > 20) {
        isSwipeActive.current = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwipeActive.current) return;

      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;

      const touchEndTime = Date.now();
      const swipeDuration = touchEndTime - touchStartTime.current;

      handleSwipe(swipeDuration);
      isSwipeActive.current = false;
    };

    const handleSwipe = (duration: number) => {
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Calculate velocity (pixels per millisecond)
      const velocity = absDeltaX / duration;

      // Only trigger swipe if:
      // 1. Horizontal movement is greater than vertical
      // 2. Distance exceeds threshold OR velocity exceeds minimum
      // 3. Not a conflicting element (unless edge swipe)
      const isValidSwipe =
        absDeltaX > absDeltaY &&
        (absDeltaX > threshold || velocity > minVelocity);

      if (isValidSwipe) {
        if (deltaX > 0 && onSwipeRight) {
          // Swipe right (from left edge or with sufficient velocity)
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          // Swipe left (with sufficient velocity)
          onSwipeLeft();
        }
      }
    };

    const options = { passive: true };
    document.addEventListener("touchstart", handleTouchStart, options);
    document.addEventListener("touchmove", handleTouchMove, options);
    document.addEventListener("touchend", handleTouchEnd, options);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    onSwipeRight,
    onSwipeLeft,
    threshold,
    minVelocity,
    edgeThreshold,
    isConflictingElement,
    isEdgeSwipe,
    disabled,
  ]);

  return {
    isSwipeActive: isSwipeActive.current,
  };
}
