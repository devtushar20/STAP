"use client";

import React, { useEffect, useState } from "react";

export const ScrollProgressAndBackToTop: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;

          if (!prefersReducedMotion) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight =
              document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(Math.min(100, Math.max(0, progress)));
          }

          setShowBackToTop(window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    const topTarget = document.getElementById("product") || document.body;
    topTarget.setAttribute("tabindex", "-1");
    topTarget.focus({ preventScroll: true });
  };

  return (
    <>
      <div
        className="scroll-progress-bar"
        id="scroll-progress-bar"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${scrollProgress}%` }}
      />
      <button
        className="back-to-top"
        id="back-to-top"
        type="button"
        aria-label="Back to top"
        hidden={!showBackToTop}
        onClick={scrollToTop}
      >
        ↑
      </button>
    </>
  );
};

