"use client";

import { useEffect, useRef } from "react";
import { trackScrollDepth } from "../lib/telemetry";

export function useScrollTracking(context: string) {
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement,
            b = document.body,
            st = 'scrollTop',
            sh = 'scrollHeight';
      
      const percent = Math.floor((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100);
      
      // Track at 25%, 50%, 75%, 90%
      [25, 50, 75, 90].forEach(depth => {
        if (percent >= depth && !trackedDepths.current.has(depth)) {
          trackScrollDepth(depth, context);
          trackedDepths.current.add(depth);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [context]);
}
