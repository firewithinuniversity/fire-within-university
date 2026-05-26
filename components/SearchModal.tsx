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
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
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
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
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
        className="bg-[#2a1a0e] rounded-2xl shadow-2xl w-full max-w-lg border border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cream/[0.06]">
          <svg
            className="w-5 h-5 text-cream/40 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
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
            aria-label="Search"
          />
          <kbd className="hidden sm:inline-block text-[10px] text-cream/25 bg-cream/[0.06] border border-cream/[0.1] rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
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

          {!loading && results.length > 0 && (
            <ul className="py-2" role="listbox">
              {results.map((result, i) => (
                <li key={`${result.type}-${result.slug}`} role="option" aria-selected={i === selectedIndex}>
                  <button
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
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

          {!loading && query.length < 2 && (
            <div className="px-5 py-8 text-center text-cream/30 text-xs">
              Type at least 2 characters to search
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-cream/[0.06] px-5 py-2.5 flex items-center justify-between text-[10px] text-cream/25">
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
