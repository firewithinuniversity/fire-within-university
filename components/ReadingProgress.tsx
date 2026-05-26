"use client";

import { useState, useEffect } from "react";

/**
 * Thin progress bar fixed to the top of the viewport.
 * Shows how far the reader has scrolled through an article.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const article = document.querySelector("article");
      if (!article) return;

      const { top, height } = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start counting when article top reaches viewport top,
      // finish when article bottom reaches viewport bottom.
      const scrolled = -top;
      const total = height - viewportHeight;

      if (total <= 0) {
        setProgress(100);
        return;
      }

      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      setProgress(pct);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-gradient-to-r from-orange to-gold transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
