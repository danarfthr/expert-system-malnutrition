"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [isReducedMotion, setIsReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateReducedMotion() {
      setIsReducedMotion(mediaQuery.matches);
    }

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  if (isReducedMotion) {
    return children;
  }

  return (
    <ReactLenis
      root
      options={{
        anchors: true,
        autoRaf: true,
        duration: 1.05,
        lerp: 0.09,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
