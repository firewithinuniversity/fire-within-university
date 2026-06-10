import Image from "next/image";

/**
 * Hero background media. On desktop the looping video autoplays; on mobile we
 * fall back to the still image. For users with `prefers-reduced-motion: reduce`,
 * the video is hidden via `motion-reduce:hidden` and the image is unhidden via
 * `motion-reduce:block` — fully CSS, so SSR matches the first paint and there
 * is no hydration flash of autoplaying video for the very users who opted out
 * (WCAG 2.2.2 Pause, Stop, Hide).
 */
export default function HeroBackground() {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="hidden md:block motion-reduce:hidden absolute inset-0 w-full h-full object-cover"
        poster="/hero-door.png"
      >
        <source src="/hero-door.mp4" type="video/mp4" />
      </video>
      <Image
        src="/hero-door.png"
        alt=""
        role="presentation"
        fill
        className="md:hidden motion-reduce:block object-cover"
        priority
        sizes="100vw"
        quality={60}
      />
    </>
  );
}
