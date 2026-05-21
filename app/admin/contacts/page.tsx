"use client";

import { useEffect, useState } from "react";

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (unreadOnly) params.set("unread", "true");

    setLoading(true);
    setError(null);
    fetch(`/api/admin/contacts?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Access denied." : "Failed to load messages.");
        return r.json();
      })
      .then((data) => {
        setSubmissions(data.submissions ?? []);
        setTotal(data.total ?? 0);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, unreadOnly]);

  async function toggleRead(id: string, read: boolean) {
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    if (!res.ok) return;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, read } : s))
    );
    setUnreadCount((c) => c + (read ? -1 : 1));
  }

  const subjectLabels: Record<string, string> = {
    general: "General",
    prayer: "Prayer Request",
    other: "Other",
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brown">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-orange mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-brown/60 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-brown/20 text-orange focus:ring-orange/30"
          />
          Unread only
        </label>
      </div>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : loading ? (
        <p className="text-brown/30">Loading...</p>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-brown/[0.06] text-center">
          <p className="text-brown/30">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl shadow-sm border transition-colors ${
                s.read ? "border-brown/[0.06]" : "border-orange/20 bg-orange/[0.02]"
              }`}
            >
              <button
                onClick={() => {
                  setExpanded(expanded === s.id ? null : s.id);
                  if (!s.read) toggleRead(s.id, true);
                }}
                className="w-full text-left px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {!s.read && (
                    <span className="w-2 h-2 rounded-full bg-orange shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-brown">{s.name}</span>
                      <span className="text-xs text-brown/30">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-brown/5 text-brown/40">
                        {subjectLabels[s.subject] ?? s.subject}
                      </span>
                      {expanded !== s.id && (
                        <span className="text-xs text-brown/30 truncate max-w-xs">
                          {s.message.slice(0, 80)}
                          {s.message.length > 80 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-brown/30 shrink-0 ml-4">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </button>
              {expanded === s.id && (
                <div className="px-5 pb-4 border-t border-brown/[0.04]">
                  <p className="text-sm text-brown/70 whitespace-pre-wrap mt-3">{s.message}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={`mailto:${s.email}`}
                      className="text-xs font-medium text-orange hover:text-orange-hover transition-colors"
                    >
                      Reply via Email →
                    </a>
                    <button
                      onClick={() => toggleRead(s.id, !s.read)}
                      className="text-xs text-brown/40 hover:text-brown/60 transition-colors"
                    >
                      Mark as {s.read ? "unread" : "read"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-brown/10 text-brown/60 hover:bg-brown/5 disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-brown/40">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-brown/10 text-brown/60 hover:bg-brown/5 disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
