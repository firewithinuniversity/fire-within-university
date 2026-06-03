"use client";

import { useRef, useEffect, useState, useMemo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
};

/**
 * Shared IntersectionObserver — all SectionReveal instances on the page
 * reuse a single observer instead of each creating their own.
 * This dramatically reduces main-thread work during scrolling.
 */
const callbacks = new Map<Element, (isIntersecting: boolean) => void>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const cb = callbacks.get(entry.target);
        if (cb && entry.isIntersecting) {
          cb(true);
          sharedObserver!.unobserve(entry.target);
          callbacks.delete(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  return sharedObserver;
}

export default function SectionReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 700,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver();
    callbacks.set(el, () => setVisible(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, [prefersReducedMotion]);

  const translateMap: Record<string, string> = {
    up: `translateY(${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    none: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateZ(0)" : translateMap[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
        contain: "content",
      }}
    >
      {children}
    </div>
  );
}
