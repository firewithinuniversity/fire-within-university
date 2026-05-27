"use client";

import { useState, useEffect, useRef } from "react";
import type { TocHeading } from "@/lib/extractHeadings";

type Props = {
  headings: TocHeading[];
};

/**
 * Collapsible table of contents that highlights the currently visible section.
 * Shows on posts with 3+ headings. Uses IntersectionObserver for active tracking.
 */
export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track which heading is currently in view
  useEffect(() => {
    if (headings.length < 3) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [headings]);

  // Don't render if fewer than 3 headings
  if (headings.length < 3) return null;

  const indentClass: Record<number, string> = {
    2: "",
    3: "pl-4",
    4: "pl-8",
  };

  return (
    <nav
      aria-label="Table of contents"
      className="bg-brown-card/50 border border-cream/[0.06] rounded-xl mb-8 overflow-hidden"
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-cream/[0.03] transition-colors"
      >
        <span className="text-sm font-semibold text-cream/70 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gold/60"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z"
            />
          </svg>
          Table of Contents
        </span>
        <svg
          className={`w-4 h-4 text-cream/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Links list */}
      {isOpen && (
        <ul className="px-5 pb-4 space-y-0.5" role="list">
          {headings.map((heading) => (
            <li key={heading.id} className={indentClass[heading.level]}>
              <a
                href={`#${heading.id}`}
                onClick={() => setIsOpen(false)}
                className={`block py-1.5 text-sm transition-colors duration-150 rounded-md px-2 -mx-2 ${
                  activeId === heading.id
                    ? "text-gold bg-gold/[0.06] font-medium"
                    : "text-cream/50 hover:text-cream/80 hover:bg-cream/[0.03]"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
