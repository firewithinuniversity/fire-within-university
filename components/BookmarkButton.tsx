"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type Props = {
  slug: string;
  type: "course" | "lesson";
  courseSlug?: string; // required when type is "lesson"
  className?: string;
};

export default function BookmarkButton({ slug, type, courseSlug, className = "" }: Props) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!session) return;

    fetch(`/api/bookmarks?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        const slugs: string[] = (data.bookmarks ?? []).map(
          (b: { slug: string }) => b.slug
        );
        setBookmarked(slugs.includes(slug));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, [session, slug, type]);

  if (!session || !hydrated) return null;

  async function toggle() {
    setLoading(true);
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    try {
      if (wasBookmarked) {
        const res = await fetch(
          `/api/bookmarks?slug=${encodeURIComponent(slug)}&type=${type}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error();
        toast.success("Removed from saved");
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, type, courseSlug }),
        });
        if (!res.ok) throw new Error();
        toast.success("Saved!");
      }
    } catch {
      setBookmarked(wasBookmarked);
      toast.error("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`group inline-flex items-center gap-1.5 transition-all disabled:opacity-50 ${className}`}
      aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
      title={bookmarked ? "Remove from saved" : "Save for later"}
    >
      {bookmarked ? (
        <svg
          className="w-5 h-5 text-gold fill-gold transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-cream/40 hover:text-gold transition-all group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}
