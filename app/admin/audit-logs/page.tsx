"use client";

import { useEffect, useState } from "react";

interface AuditEntry {
  id: string;
  event: string;
  email: string | null;
  userId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [eventFilter, setEventFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (eventFilter) params.set("event", eventFilter);

    setLoading(true);
    setError(null);
    fetch(`/api/admin/audit-logs?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Access denied." : "Failed to load logs.");
        return r.json();
      })
      .then((data) => {
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, eventFilter]);

  const totalPages = Math.ceil(total / 30);

  const eventColors: Record<string, string> = {
    ADMIN_LOGIN_SUCCESS: "bg-green-50 text-green-700",
    ADMIN_LOGIN_FAILURE: "bg-red-50 text-red-700",
    ADMIN_ACCESS_DENIED: "bg-yellow-50 text-yellow-700",
    ADMIN_REGISTER_BLOCKED: "bg-orange-50 text-orange-700",
    LOGIN_RATE_LIMITED: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 pt-16 md:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 className="font-serif text-2xl font-bold text-brown">Audit Logs</h1>
        <span className="text-sm text-brown/40">{total} entries</span>
      </div>

      <div className="mb-5">
        <select
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 rounded-lg border border-brown/10 bg-white text-brown text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
        >
          <option value="">All events</option>
          <option value="ADMIN_LOGIN_SUCCESS">Admin Login Success</option>
          <option value="ADMIN_LOGIN_FAILURE">Admin Login Failure</option>
          <option value="ADMIN_ACCESS_DENIED">Admin Access Denied</option>
          <option value="ADMIN_REGISTER_BLOCKED">Admin Register Blocked</option>
          <option value="LOGIN_RATE_LIMITED">Login Rate Limited</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/[0.06] overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="border-b border-brown/[0.06] bg-brown/[0.02]">
              <th className="text-left px-4 py-3 font-medium text-brown/60">Event</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Email</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">IP</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Details</th>
              <th className="text-left px-4 py-3 font-medium text-brown/60">Time</th>
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
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brown/30">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                let meta: Record<string, string> = {};
                try {
                  if (log.metadata) meta = JSON.parse(log.metadata);
                } catch {}
                return (
                  <tr key={log.id} className="border-b border-brown/[0.04]">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          eventColors[log.event] ?? "bg-brown/5 text-brown/60"
                        }`}
                      >
                        {log.event}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brown/70">{log.email ?? "—"}</td>
                    <td className="px-4 py-3 text-brown/40 font-mono text-xs">{log.ip ?? "—"}</td>
                    <td className="px-4 py-3 text-brown/40 text-xs">
                      {meta.reason ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-brown/40 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2.5 text-sm rounded-lg border border-brown/10 text-brown/60 hover:bg-brown/5 disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-brown/40">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2.5 text-sm rounded-lg border border-brown/10 text-brown/60 hover:bg-brown/5 disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
