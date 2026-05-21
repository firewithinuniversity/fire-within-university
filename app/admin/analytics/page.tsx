"use client";

import { useEffect, useState } from "react";

interface CourseStats {
  courseSlug: string;
  completions: number;
}

interface RecentCompletion {
  courseSlug: string;
  lessonSlug: string;
  completedAt: string;
  user: { name: string | null; email: string };
}

interface AnalyticsData {
  totalUsers: number;
  activeStudents: number;
  totalCompletions: number;
  courseStats: CourseStats[];
  recentCompletions: RecentCompletion[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Access denied." : "Failed to load analytics.");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-8 py-8">
        <h1 className="font-serif text-2xl font-bold text-brown mb-6">Analytics</h1>
        <p className="text-brown/30">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-8">
        <h1 className="font-serif text-2xl font-bold text-brown mb-6">Analytics</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Users", value: data.totalUsers },
    { label: "Active Students", value: data.activeStudents },
    { label: "Total Completions", value: data.totalCompletions },
    { label: "Courses Tracked", value: data.courseStats.length },
  ];

  return (
    <div className="px-8 py-8">
      <h1 className="font-serif text-2xl font-bold text-brown mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-brown/[0.06]">
            <p className="text-xs text-brown/40 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-brown mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/[0.06]">
          <h2 className="font-semibold text-brown mb-4">Completions by Course</h2>
          {data.courseStats.length === 0 ? (
            <p className="text-sm text-brown/30">No completions yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.courseStats.map((c) => {
                const maxVal = Math.max(...data.courseStats.map((s) => s.completions), 1);
                const pct = Math.round((c.completions / maxVal) * 100);
                return (
                  <li key={c.courseSlug}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-brown font-medium">{c.courseSlug}</span>
                      <span className="text-brown/40">{c.completions}</span>
                    </div>
                    <div className="h-2 bg-brown/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/[0.06]">
          <h2 className="font-semibold text-brown mb-4">Recent Activity</h2>
          {data.recentCompletions.length === 0 ? (
            <p className="text-sm text-brown/30">No activity yet.</p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {data.recentCompletions.slice(0, 20).map((c, i) => (
                <li key={i} className="flex items-start justify-between text-sm">
                  <div>
                    <span className="text-brown font-medium">
                      {c.user.name ?? c.user.email}
                    </span>
                    <span className="text-brown/40 ml-1">completed</span>
                    <span className="text-brown/70 ml-1">{c.lessonSlug}</span>
                    <p className="text-xs text-brown/30">{c.courseSlug}</p>
                  </div>
                  <span className="text-xs text-brown/30 shrink-0 ml-3">
                    {new Date(c.completedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
