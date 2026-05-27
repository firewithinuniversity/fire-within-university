"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { trackSearch } from "@/lib/analytics";

type SearchResult = {
  type: "post" | "course" | "lesson";
  title: string;
  slug: string;
  description?: string;
  courseSlug?: string;
};

const TYPE_LABELS: Record<string, string> = {
  post: "Sermon",
  course: "Course",
  lesson: "Lesson",
};

const TYPE_COLORS: Record<string, string> = {
  post: "bg-gold/20 text-gold",
  course: "bg-orange/20 text-orange",
  lesson: "bg-green-800/30 text-green-400",
};

function getResultHref(result: SearchResult): string {
  switch (result.type) {
    case "post":
      return `/blog/${result.slug}`;
    case "course":
      return `/courses/${result.slug}`;
    case "lesson":
      return `/courses/${result.courseSlug}/lessons/${result.slug}`;
    default:
      return "/";
  }
}

function SearchModalContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "post" | "course" | "lesson">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggerRef = useRef<Element | null>(null);

  // Capture the element that opened the modal so we can restore focus on close
  useEffect(() => {
    triggerRef.current = document.activeElement;
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus trap + Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Trap focus inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'input, button, a, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      // Restore focus to the trigger element
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [onClose]);

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      const items = data.results ?? [];
      setResults(items);
      setSelectedIndex(0);
      if (items.length > 0) trackSearch(term, items.length);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setFilter("all");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value.trim()), 250);
  }

  function navigate(result: SearchResult) {
    router.push(getResultHref(result));
    onClose();
  }

  const filteredResults = filter === "all" ? results : results.filter(r => r.type === filter);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filteredResults.length > 0) {
      e.preventDefault();
      navigate(filteredResults[selectedIndex]);
    }
  }

  const listboxId = "search-results-listbox";
  const activeOptionId =
    filteredResults.length > 0
      ? `search-option-${filteredResults[selectedIndex]?.type}-${filteredResults[selectedIndex]?.slug}`
      : undefined;

  // Build status text for screen readers
  let statusText = "";
  if (loading) {
    statusText = "Searching...";
  } else if (query.length >= 2 && results.length === 0) {
    statusText = `No results found for "${query}".`;
  } else if (filteredResults.length > 0) {
    statusText = `${filteredResults.length} result${filteredResults.length === 1 ? "" : "s"} found. Use arrow keys to navigate.`;
  } else if (results.length > 0 && filteredResults.length === 0) {
    statusText = `No results match the selected filter.`;
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search sermons, courses, and lessons"
        className="bg-[#2a1a0e] rounded-2xl shadow-2xl w-full max-w-lg border border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input — combobox pattern */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cream/[0.06]">
          <svg
            className="w-5 h-5 text-cream/40 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sermons, courses, lessons..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent text-cream placeholder:text-cream/30 text-sm focus:outline-none"
            role="combobox"
            aria-label="Search"
            aria-expanded={filteredResults.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            aria-describedby="search-hint"
          />
          <kbd className="hidden sm:inline-block text-[10px] text-cream/25 bg-cream/[0.06] border border-cream/[0.1] rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Screen reader status announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {statusText}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {/* Filter tabs */}
          {query.length >= 2 && !loading && results.length > 0 && (
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-cream/[0.06]">
              {(["all", "post", "course", "lesson"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setSelectedIndex(0);
                  }}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    filter === type
                      ? "bg-gold/20 text-gold font-semibold"
                      : "text-cream/40 hover:text-cream/60 hover:bg-cream/[0.06]"
                  }`}
                >
                  {type === "all" ? "All" : type === "post" ? "Sermons" : type === "course" ? "Courses" : "Lessons"}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="px-5 py-8 text-center text-cream/40 text-sm">
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-5 py-8 text-center text-cream/40 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <ul id={listboxId} className="py-2" role="listbox">
              {filteredResults.map((result, i) => (
                <li
                  key={`${result.type}-${result.slug}`}
                  id={`search-option-${result.type}-${result.slug}`}
                  role="option"
                  aria-selected={i === selectedIndex}
                >
                  <button
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    tabIndex={-1}
                    className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${
                      i === selectedIndex
                        ? "bg-cream/[0.06]"
                        : "hover:bg-cream/[0.03]"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 ${
                        TYPE_COLORS[result.type]
                      }`}
                    >
                      {TYPE_LABELS[result.type]}
                    </span>
                    <div className="flex-grow min-w-0">
                      <p className="text-cream text-sm font-medium truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-cream/35 text-xs truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-cream/20 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.length >= 2 && results.length > 0 && filteredResults.length === 0 && (
            <div className="px-5 py-8 text-center text-cream/40 text-sm">
              No results match this filter
            </div>
          )}

          {!loading && query.length < 2 && (
            <div id="search-hint" className="px-5 py-8 text-center text-cream/30 text-xs">
              Type at least 2 characters to search
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-cream/[0.06] px-5 py-2.5 flex items-center justify-between text-[10px] text-cream/25" aria-hidden="true">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-cream/[0.06] border border-cream/[0.1] rounded px-1 py-0.5 font-mono">↑</kbd>
              <kbd className="bg-cream/[0.06] border border-cream/[0.1] rounded px-1 py-0.5 font-mono">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-cream/[0.06] border border-cream/[0.1] rounded px-1 py-0.5 font-mono">↵</kbd>
              open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(<SearchModalContent onClose={onClose} />, document.body);
}
