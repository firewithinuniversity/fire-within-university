/**
 * components/ScriptureTooltip.tsx — Inline Bible verse pop-up
 *
 * When a content editor marks a scripture reference in Sanity (e.g. "John 3:16"),
 * this component fetches and shows the verse text inline without leaving the page.
 *
 * HOW IT WORKS:
 * 1. Content editor highlights text in Sanity Studio and applies the "Scripture
 *    Reference" annotation, entering the reference (e.g. "John 3:16").
 * 2. On hover (desktop) or tap (mobile), this component fetches the verse
 *    from bible-api.com — a free, no-key API.
 * 3. A styled tooltip shows above/below with the verse text.
 * 4. Fetched verses are cached in module memory so each ref is only
 *    fetched once per page load.
 *
 * GRACEFUL DEGRADATION:
 * If the fetch fails (offline, API down), the reference still looks like a
 * styled span. Nothing breaks — the tooltip just won't appear.
 *
 * WHY "use client": useState, useEffect, and event handlers are browser-only.
 */
"use client";

import { useState, useRef, useCallback } from "react";

// Module-level cache — persists across renders, fetched once per session
const verseCache = new Map<string, string>();

type Props = {
  reference: string;  // e.g. "John 3:16"
  children: React.ReactNode;
};

export default function ScriptureTooltip({ reference, children }: Props) {
  const [verse, setVerse] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVerse = useCallback(async () => {
    if (verseCache.has(reference)) {
      setVerse(verseCache.get(reference)!);
      return;
    }
    setIsLoading(true);
    try {
      // bible-api.com: free, no auth, CORS-open
      // Format: spaces → +, e.g. "john+3:16"
      const encoded = reference.toLowerCase().replace(/\s+/g, "+");
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(encoded)}`);
      if (res.ok) {
        const data = await res.json();
        // The API returns the full passage; join multi-verse results
        const text = Array.isArray(data.verses)
          ? data.verses.map((v: { text: string }) => v.text.trim()).join(" ")
          : (data.text ?? "").trim().replace(/\n+/g, " ");
        verseCache.set(reference, text);
        setVerse(text);
      }
    } catch {
      // Silently fail — tooltip just won't show verse text
    } finally {
      setIsLoading(false);
    }
  }, [reference]);

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 120);
  }

  function cancelClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }

  function handleOpen() {
    cancelClose();
    setIsOpen(true);
    if (!verse && !isLoading) fetchVerse();
  }

  function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
    } else {
      handleOpen();
    }
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleOpen}
      onMouseLeave={scheduleClose}
      onFocus={handleOpen}
      onBlur={scheduleClose}
    >
      {/* The reference text — styled distinctly from regular links */}
      <span
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`Show verse: ${reference}`}
        onClick={handleToggle}
        onKeyDown={(e) => e.key === "Enter" && handleToggle()}
        className="text-gold font-medium underline decoration-dotted underline-offset-2 cursor-pointer hover:text-gold transition-colors duration-150"
      >
        {children}
      </span>

      {/* Tooltip */}
      {isOpen && (
        <span
          role="tooltip"
          aria-live="polite"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-72 max-w-[90vw] bg-brown text-cream rounded-2xl px-4 py-3.5 shadow-xl border border-gold/25 text-xs"
        >
          {/* Reference label */}
          <span className="block font-bold text-gold uppercase tracking-wider text-[10px] mb-2">
            {reference}
          </span>

          {/* Verse content */}
          {isLoading ? (
            <span className="text-cream/60 italic">Loading verse…</span>
          ) : verse ? (
            <span className="leading-relaxed text-cream/90 italic">&ldquo;{verse}&rdquo;</span>
          ) : (
            <span className="text-cream/55 italic">Verse not available.</span>
          )}

          {/* Tooltip arrow */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0"
            style={{
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "7px solid #3d1f0a",
            }}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
