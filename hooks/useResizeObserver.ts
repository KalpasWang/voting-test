import React, { useEffect, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

/**
 * Hook, that returns the current dimensions of an HTML element.
 * Doesn't play well with SVG.
 */

const useResizeObserver = (ref: React.RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });

    resizeObserver.observe(observeTarget as unknown as HTMLElement);
    return () => {
      resizeObserver.unobserve(observeTarget as unknown as HTMLElement);
    };
  }, [ref]);
  return dimensions;
};

export default useResizeObserver;
