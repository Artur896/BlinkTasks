import { useState, useEffect } from "react";

export function useBreakpoint() {
  const getBreakpoint = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 640)  return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  };

  const [bp, setBp] = useState(getBreakpoint);

  useEffect(() => {
    const obs = new ResizeObserver(() => setBp(getBreakpoint()));
    obs.observe(document.body);
    return () => obs.disconnect();
  }, []);

  return {
    bp,
    isMobile:  bp === "mobile",
    isTablet:  bp === "tablet",
    isDesktop: bp === "desktop",
    isTouch:   bp === "mobile" || bp === "tablet",
  };
}