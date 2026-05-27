"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

export default function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape to close dropdown
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

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
    setDropdownOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value.trim()), 250);
  }

  function navigate(result: SearchResult) {
    router.push(getResultHref(result));
    setDropdownOpen(false);
    setQuery("");
    setResults([]);
    onNavigate?.();
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

  const showDropdown = dropdownOpen && query.length >= 2;
  const listboxId = "search-results-listbox";
  const activeOptionId =
    results.length > 0
      ? `search-option-${results[selectedIndex]?.type}-${results[selectedIndex]?.slug}`
      : undefined;

  // Screen reader status text
  let statusText = "";
  if (loading) {
    statusText = "Searching...";
  } else if (query.length >= 2 && results.length === 0) {
    statusText = `No results found for "${query}".`;
  } else if (results.length > 0) {
    statusText = `${results.length} result${results.length === 1 ? "" : "s"} found. Use arrow keys to navigate.`;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="flex items-center bg-cream/[0.08] hover:bg-cream/[0.12] focus-within:bg-cream/[0.14] border border-cream/[0.08] focus-within:border-cream/[0.15] rounded-full px-3.5 py-2 transition-all">
        <svg
          className="w-4 h-4 text-cream/50 flex-shrink-0 mr-2"
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
          onFocus={() => {
            if (query.length >= 2) setDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-cream placeholder:text-cream/50 text-[13px] focus:outline-none w-36 lg:w-52"
          role="combobox"
          aria-label="Search"
          aria-expanded={showDropdown && results.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
        />
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setDropdownOpen(false);
              inputRef.current?.focus();
            }}
            className="text-cream/70 hover:text-cream transition-colors p-0.5 ml-1"
            aria-label="Clear search"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Screen reader status */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusText}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-cream rounded-xl shadow-2xl shadow-black/30 border border-black/[0.04] overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-brown/20 border-t-brown/60 rounded-full animate-spin flex-shrink-0" />
                <span className="text-brown/70 text-sm">Searching...</span>
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="px-5 py-6 text-center">
                <p className="text-brown/70 text-sm">
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul id={listboxId} className="py-1.5" role="listbox">
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
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${
                        i === selectedIndex
                          ? "bg-brown/[0.06]"
                          : "hover:bg-brown/[0.04]"
                      }`}
                    >
                      <span className="text-brown text-[15px] font-medium truncate flex-grow">
                        {result.title}
                      </span>
                      <span className="text-brown/60 text-xs flex-shrink-0">
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
  );
}
