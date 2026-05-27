"use client";

import { useState, useRef, useCallback } from "react";

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
      const encoded = reference.toLowerCase().replace(/\s+/g, "+");
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(encoded)}`);
      if (res.ok) {
        const data = await res.json();
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
      <span
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`Show verse: ${reference}`}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className="text-gold font-medium underline decoration-dotted underline-offset-2 cursor-pointer hover:text-gold transition-colors duration-150"
      >
        {children}
      </span>

      {isOpen && (
        <span
          role="tooltip"
          aria-live="polite"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-72 max-w-[90vw] bg-brown text-cream rounded-2xl px-4 py-3.5 shadow-xl border border-gold/25 text-xs"
        >
          <span className="block font-bold text-gold uppercase tracking-wider text-[10px] mb-2">
            {reference}
          </span>

          {isLoading ? (
            <span className="text-cream/60 italic">Loading verse…</span>
          ) : verse ? (
            <span className="leading-relaxed text-cream/90 italic">&ldquo;{verse}&rdquo;</span>
          ) : (
            <span className="text-cream/55 italic">Verse not available.</span>
          )}

          <span
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-brown"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
