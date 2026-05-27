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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value.trim()), 250);
  }

  function navigate(result: SearchResult) {
    router.push(getResultHref(result));
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
  }

  const listboxId = "search-results-listbox";
  const activeOptionId =
    results.length > 0
      ? `search-option-${results[selectedIndex]?.type}-${results[selectedIndex]?.slug}`
      : undefined;

  // Build status text for screen readers
  let statusText = "";
  if (loading) {
    statusText = "Searching...";
  } else if (query.length >= 2 && results.length === 0) {
    statusText = `No results found for "${query}".`;
  } else if (results.length > 0) {
    statusText = `${results.length} result${results.length === 1 ? "" : "s"} found. Use arrow keys to navigate.`;
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[12vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search sermons, courses, and lessons"
        className="w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input — large rounded bar like Bible Project */}
        <div className="relative">
          <div className="flex items-center bg-cream rounded-full shadow-2xl shadow-black/40 px-5 py-3.5">
            <svg
              className="w-5 h-5 text-brown-deep/40 flex-shrink-0 mr-3"
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
              placeholder="Search"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent text-brown-deep placeholder:text-brown-deep/35 text-base focus:outline-none"
              role="combobox"
              aria-label="Search"
              aria-expanded={results.length > 0}
              aria-controls={listboxId}
              aria-activedescendant={activeOptionId}
              aria-autocomplete="list"
            />
            {query.length > 0 && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="text-brown-deep/30 hover:text-brown-deep/60 transition-colors p-1"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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

        {/* Results dropdown */}
        {(query.length >= 2 || loading) && (
          <div className="mt-2 bg-cream rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="max-h-[50vh] overflow-y-auto">
              {loading && (
                <div className="px-6 py-5 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-brown-deep/20 border-t-brown-deep/60 rounded-full animate-spin" />
                  <span className="text-brown-deep/70 text-sm">Searching...</span>
                </div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-brown-deep/70 text-sm">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <ul id={listboxId} className="py-2" role="listbox">
                  {results.map((result, i) => (
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
                        className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
                          i === selectedIndex
                            ? "bg-brown-deep/[0.06]"
                            : "hover:bg-brown-deep/[0.04]"
                        }`}
                      >
                        <div className="flex-grow min-w-0">
                          <p className="text-brown-deep text-[15px] font-medium truncate">
                            {result.title}
                          </p>
                        </div>
                        <span className="text-brown-deep/60 text-xs flex-shrink-0">
                          {TYPE_LABELS[result.type]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
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
