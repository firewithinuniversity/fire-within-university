"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Hero background media. Renders the Next/Image (optimized → WebP/AVIF,
 * small, prioritized) as the LCP element on EVERY device. On desktops where
 * the user hasn't asked for reduced motion, the looping video lazy-mounts
 * after first paint and fades in over the image — pure decorative
 * enhancement, never blocking LCP.
 *
 * Why this shape:
 *  - LCP used to be the 1.7MB autoplaying mp4 → 4s+ on desktop. Now LCP is
 *    the ~150KB WebP version of the poster served by next/image, and the
 *    video downloads off the critical path.
 *  - Reduced-motion users (WCAG 2.2.2) never get the video mounted at all.
 *  - SSR renders only the image, so the first paint is identical to what
 *    crawlers/no-JS clients see — no hydration flash.
 */
export default function HeroBackground() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    // Defer to idle so the video never competes with critical work.
    const schedule =
      "requestIdleCallback" in window
        ? (cb: () => void) =>
            (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(cb)
        : (cb: () => void) => window.setTimeout(cb, 500);

    schedule(() => setShowVideo(true));
  }, []);

  return (
    <>
      <Image
        src="/hero-door.png"
        alt=""
        role="presentation"
        fill
        className="object-cover"
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={70}
      />
      {showVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 data-[loaded=true]:opacity-100"
          onLoadedData={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
          aria-hidden="true"
        >
          <source src="/hero-door.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}
