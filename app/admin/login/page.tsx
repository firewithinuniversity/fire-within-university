"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    setError("");
    setLoading(true);

    const res = await signIn("admin-credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-brown flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-cream">Admin Portal</h1>
          <p className="text-cream/50 text-sm mt-2">Fire Within University</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-cream rounded-2xl p-6 shadow-xl space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg">{error}</div>
          )}

          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute opacity-0 h-0 w-0 pointer-events-none"
            aria-hidden="true"
          />

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-brown/70 mb-1">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brown/15 bg-white text-brown focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-brown/70 mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brown/15 bg-white text-brown focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange hover:bg-orange-hover text-cream font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
