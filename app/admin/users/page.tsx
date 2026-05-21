"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { lessonProgress: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    setLoading(true);
    setError(null);
    fetch(`/api/admin/users?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Access denied." : "Failed to load users.");
        return r.json();
      })
      .then((data) => {
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-brown">Users</h1>
        <span className="text-sm text-brown/40">{total} total</span>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-brown/10 bg-white text-brown text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 placeholder:text-brown/30"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brown/[0.06] bg-brown/[0.02]">
              <th className="text-left px-4 py-3 font-medium text-brown/60">Name</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Email</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Role</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Lessons</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Joined</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brown/30">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brown/30">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-brown/[0.04] hover:bg-brown/[0.01]">
                  <td className="px-4 py-3 text-brown font-medium">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-brown/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-orange/10 text-orange"
                          : "bg-brown/5 text-brown/50"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brown/60">{u._count.lessonProgress}</td>
                  <td className="px-4 py-3 text-brown/40">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
