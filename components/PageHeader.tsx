import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Brand mark above the title. "flame" (default) ties to the fire identity. */
  mark?: "flame" | "cross" | "none";
  children?: ReactNode;
  className?: string;
};

function FlameMark() {
  return (
    <svg width="26" height="32" viewBox="0 0 24 30" fill="none" aria-hidden="true" className="text-gold">
      <path
        d="M12 1C12 1 5 7 5 14a7 7 0 0 0 14 0c0-3-1.5-5-3-7 0 2-1 3-2.5 3.5C14 8 13 4 12 1Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M12 12c0 0-3 2.5-3 5.5a3 3 0 0 0 6 0C15 15 12 12 12 12Z"
        fill="#1a0f05"
        fillOpacity="0.55"
      />
    </svg>
  );
}

function CrossMark() {
  return (
    <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" aria-hidden="true" className="text-gold/60">
      <rect x="6" y="0" width="4" height="24" rx="2" />
      <rect x="0" y="7" width="16" height="4" rx="2" />
    </svg>
  );
}

/**
 * Shared page header with a warm radial glow, a brand mark, eyebrow, title, and
 * subtitle. Gives inner pages a slice of the homepage's energy instead of a flat
 * dark slab, and standardizes the header treatment site-wide.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  mark = "flame",
  children,
  className = "",
}: Props) {
  return (
    <header className={`relative overflow-hidden pt-28 md:pt-32 pb-10 md:pb-12 px-4 sm:px-6 text-center ${className}`}>
      {/* Warm radial glow behind the title */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-20 -translate-x-1/2 w-[680px] max-w-[120vw] h-[460px] rounded-full bg-gold/[0.06] blur-[130px]"
      />
      {/* Subtle top hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />

      <div className="relative max-w-3xl mx-auto space-y-5">
        {mark !== "none" && (
          <div className="flex justify-center">
            {mark === "flame" ? <FlameMark /> : <CrossMark />}
          </div>
        )}

        {eyebrow && (
          <p className="text-gold/80 font-bold text-[10px] uppercase tracking-[0.3em]">
            {eyebrow}
          </p>
        )}

        <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.25rem] font-bold text-cream leading-[1.02] tracking-[-0.02em]">
          {title}
        </h1>

        {subtitle && (
          <p className="text-cream/65 max-w-xl mx-auto text-lg leading-[1.7]">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </header>
  );
}
