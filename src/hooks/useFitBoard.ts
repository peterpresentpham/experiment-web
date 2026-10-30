import { RefObject, useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures the container and returns the size of one board cell.
 * `compute` must be stable (wrap it in useCallback) and may return 0 to hide the board.
 */
export default function useFitBoard(
  compute: (width: number, height: number) => number,
  initialSize = 0
): { ref: RefObject<HTMLDivElement | null>; size: number } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(initialSize);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frameId: number | null = null;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const next = compute(width, height);
      setSize((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [compute]);

  return { ref, size };
}
