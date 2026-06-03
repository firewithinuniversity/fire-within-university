"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Hero background media. On desktop it autoplays a looping video; on mobile it
 * shows a static poster image. If the user prefers reduced motion, the video is
 * never rendered (the still image is shown at all sizes) — satisfying WCAG
 * 2.2.2 (Pause, Stop, Hide), which the global CSS reduced-motion rule cannot
 * enforce on an HTML5 <video> (audit a11y).
 */
export default function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {!reducedMotion && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          poster="/hero-door.png"
        >
          <source src="/hero-door.mp4" type="video/mp4" />
        </video>
      )}
      <Image
        src="/hero-door.png"
        alt=""
        role="presentation"
        fill
        className={`${reducedMotion ? "" : "md:hidden"} object-cover`}
        priority
        sizes="100vw"
        quality={60}
      />
    </>
  );
}
