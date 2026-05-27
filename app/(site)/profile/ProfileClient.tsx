"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CourseProgress = {
  title: string;
  slug: string;
  totalLessons: number;
  completedLessons: number;
  description?: string;
};

type RecentCompletion = {
  lessonSlug: string;
  courseSlug: string;
  courseTitle: string;
  completedAt: string;
};

type SavedItem = {
  slug: string;
  type: "course" | "lesson";
  courseSlug: string | null;
  title: string;
  courseTitle: string;
  savedAt: string;
};

type Props = {
  initialName: string;
  email: string;
  emailVerified: boolean;
  memberSince: string;
  image: string | null;
  courseProgress: CourseProgress[];
  recentCompletions: RecentCompletion[];
  totalCompleted: number;
  savedItems: SavedItem[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export default function ProfileClient({
  initialName,
  email,
  emailVerified,
  memberSince,
  image,
  courseProgress,
  recentCompletions,
  totalCompleted,
  savedItems,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [items, setItems] = useState(savedItems);

  async function handleResendVerification() {
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification email sent!");
      } else {
        toast.error(data.message || "Failed to send.");
      }
      setResendMsg(data.message);
    } catch {
      toast.error("Something went wrong.");
      setResendMsg("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === name) {
      setEditingName(false);
      setNameInput(name);
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.message || "Failed to update.");
        toast.error(data.message || "Failed to update name.");
        return;
      }

      setName(trimmed);
      setEditingName(false);
      toast.success("Name updated!");
      router.refresh();
    } catch {
      setSaveError("Something went wrong.");
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveBookmark(slug: string, type: string) {
    const prev = items;
    setItems((cur) => cur.filter((b) => !(b.slug === slug && b.type === type)));

    try {
      const res = await fetch(
        `/api/bookmarks?slug=${encodeURIComponent(slug)}&type=${encodeURIComponent(type)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        setItems(prev);
        toast.error("Failed to remove bookmark.");
        return;
      }

      toast.success("Bookmark removed");
    } catch {
      setItems(prev);
      toast.error("Something went wrong.");
    }
  }

  const initials = (name || email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  const coursesStarted = courseProgress.length;
  const coursesCompleted = courseProgress.filter(
    (c) => c.completedLessons >= c.totalLessons && c.totalLessons > 0
  ).length;

  return (
    <div className="space-y-10">
      {/* Email verification banner */}
      {!emailVerified && (
        <section className="bg-amber-900/30 border border-amber-600/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-800/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-amber-200 text-sm font-medium">
                Verify your email
              </p>
              <p className="text-amber-300/60 text-xs mt-0.5">
                Check your inbox for a verification link, or request a new one.
              </p>
              {resendMsg && (
                <p className="text-amber-200/80 text-xs mt-1">{resendMsg}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="bg-amber-700/50 hover:bg-amber-700/70 text-amber-100 text-sm font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {resending ? "Sending..." : "Resend Email"}
          </button>
        </section>
      )}

      {/* Profile card */}
      <section className="bg-brown-card border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          {image ? (
            <Image
              src={image}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-gold/30 flex-shrink-0"
              sizes="64px"
              priority
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange/80 to-gold/70 flex items-center justify-center flex-shrink-0 ring-2 ring-gold/30">
              <span className="text-cream text-lg font-bold">{initials}</span>
            </div>
          )}

          <div className="flex-grow min-w-0">
            {/* Name */}
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={100}
                  className="px-3 py-1.5 rounded-lg border border-cream/[0.1] bg-brown-deep text-cream text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gold/40 w-full max-w-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameInput(name);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                  aria-label="Save name"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNameInput(name);
                    setSaveError("");
                  }}
                  className="text-cream/40 hover:text-cream/70 transition-colors"
                  aria-label="Cancel editing"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-cream truncate">
                  {name || "No name set"}
                </h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-cream/30 hover:text-gold transition-colors flex-shrink-0"
                  aria-label="Edit name"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              </div>
            )}

            {saveError && (
              <p className="text-red-400 text-xs mb-1">{saveError}</p>
            )}

            <p className="text-cream/50 text-sm flex items-center gap-1.5">
              {email}
              {emailVerified && (
                <span className="inline-flex items-center gap-0.5 text-green-400 text-xs" title="Email verified">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Verified
                </span>
              )}
            </p>
            <p className="text-cream/30 text-xs mt-1">
              Member since {formatDate(memberSince)}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: "Lessons Completed", value: totalCompleted },
          { label: "Courses Started", value: coursesStarted },
          { label: "Courses Completed", value: coursesCompleted },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-brown-card border border-white/[0.08] rounded-xl p-5 text-center"
          >
            <p className="text-2xl sm:text-3xl font-bold text-gold">{stat.value}</p>
            <p className="text-cream/40 text-xs sm:text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Course Progress */}
      <section>
        <h2 className="font-serif text-xl font-bold text-cream mb-5">
          My Courses
        </h2>

        {courseProgress.length === 0 ? (
          <div className="bg-brown-card border border-white/[0.08] rounded-2xl p-8 text-center">
            <p className="text-cream/50 mb-4">
              You haven&apos;t started any courses yet.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-orange hover:bg-orange-hover text-cream font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courseProgress.map((c) => {
              const pct =
                c.totalLessons > 0
                  ? Math.round((c.completedLessons / c.totalLessons) * 100)
                  : 0;
              const isComplete = pct >= 100;

              return (
                <Link
                  key={c.slug}
                  href={`/courses/${c.slug}`}
                  className="group block bg-brown-card border border-white/[0.08] rounded-xl p-5 transition-all hover:border-gold/30 hover:bg-[#553318]"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-cream font-semibold group-hover:text-gold transition-colors truncate">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="text-cream/40 text-sm mt-1 line-clamp-1">
                          {c.description}
                        </p>
                      )}
                    </div>
                    {isComplete ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold flex-shrink-0 bg-green-900/30 px-2.5 py-1 rounded-full border border-green-700/30">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Complete
                      </span>
                    ) : (
                      <span className="text-cream/40 text-sm flex-shrink-0">
                        {c.completedLessons}/{c.totalLessons}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-cream/[0.08] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-orange to-gold"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-cream/30 text-xs mt-1.5">{pct}% complete</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Saved Items */}
      <section>
        <h2 className="font-serif text-xl font-bold text-cream mb-5">
          Saved Items
        </h2>
        {items.length === 0 ? (
          <div className="bg-brown-card border border-white/[0.08] rounded-2xl p-8 text-center">
            <p className="text-cream/50 mb-4">No saved items yet.</p>
            <Link
              href="/courses"
              className="inline-block bg-orange hover:bg-orange-hover text-cream font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="bg-brown-card border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06]">
            {items.map((item, i) => (
              <Link
                key={`${item.slug}-${item.type}-${i}`}
                href={
                  item.type === "course"
                    ? `/courses/${item.slug}`
                    : `/courses/${item.courseSlug}/lessons/${item.slug}`
                }
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream/[0.03] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <svg
                  className="w-4 h-4 text-gold fill-gold flex-shrink-0"
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
                <div className="flex-grow min-w-0">
                  <p className="text-cream/80 text-sm truncate capitalize">
                    {item.title}
                  </p>
                  <p className="text-cream/30 text-xs">
                    {item.type === "course" ? "Course" : item.courseTitle}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveBookmark(item.slug, item.type);
                  }}
                  aria-label="Remove bookmark"
                  className="text-cream/30 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="text-cream/25 text-xs flex-shrink-0">
                  {formatRelative(item.savedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {recentCompletions.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-5">
            Recent Activity
          </h2>
          <div className="bg-brown-card border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06]">
            {recentCompletions.map((rc, i) => (
              <Link
                key={`${rc.lessonSlug}-${i}`}
                href={`/courses/${rc.courseSlug}/lessons/${rc.lessonSlug}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream/[0.03] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <div className="flex-grow min-w-0">
                  <p className="text-cream/80 text-sm truncate">
                    Completed{" "}
                    <span className="text-cream font-medium">
                      {rc.lessonSlug.replace(/-/g, " ")}
                    </span>
                  </p>
                  <p className="text-cream/30 text-xs">{rc.courseTitle}</p>
                </div>
                <span className="text-cream/25 text-xs flex-shrink-0">
                  {formatRelative(rc.completedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
