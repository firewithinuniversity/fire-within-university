"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Floating "back to top" button that appears after scrolling down 400px.
 * Smooth-scrolls to the top of the page on click.
 * Scroll listener is throttled via requestAnimationFrame.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      setVisible(window.scrollY > 400);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-brown-card/90 border border-cream/[0.08] text-cream/60 hover:text-gold hover:border-gold/30 shadow-lg transition-colors duration-200 hover:-translate-y-0.5 flex items-center justify-center"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
    </button>
  );
}
