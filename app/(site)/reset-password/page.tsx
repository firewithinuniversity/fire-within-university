"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { validatePassword, isPasswordValid } from "@/lib/passwordValidation";

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-cream/[0.1] bg-brown-deep text-cream focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-0 focus:border-gold placeholder:text-cream/35";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const missingParams = !token || !email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isPasswordValid(password)) {
      setError("Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brown-deep min-h-screen flex items-center justify-center px-4 py-16">
      <div className="bg-[#2a1a0e] rounded-2xl shadow-2xl w-full max-w-md border border-white/[0.06] p-8">
        <h1 className="font-serif text-2xl font-bold text-cream text-center mb-2">
          Reset Your Password
        </h1>

        {missingParams ? (
          <div className="text-center space-y-4 mt-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-900/30 border border-red-700/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-cream/60 text-sm">
              This reset link appears to be invalid or incomplete. Please request a new one.
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-gold hover:text-gold/80 transition-colors"
            >
              Go to homepage
            </Link>
          </div>
        ) : success ? (
          <div className="text-center space-y-4 mt-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-900/30 border border-green-700/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-cream/70 text-sm">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link
              href="/"
              className="inline-block bg-orange hover:bg-orange-hover text-cream font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Go to homepage
            </Link>
          </div>
        ) : (
          <>
            <p className="text-cream/50 text-sm text-center mb-6">
              Enter your new password below.
            </p>

            {error && (
              <div className="bg-red-900/30 text-red-300 text-sm px-4 py-2.5 rounded-lg mb-4 border border-red-700/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-cream/60 mb-1">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
                {password.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validatePassword(password).map((c) => (
                      <li key={c.key} className={`flex items-center gap-1.5 text-xs ${c.met ? "text-green-400" : "text-cream/50"}`}>
                        {c.met ? (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-cream/60 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange hover:bg-orange-hover text-cream font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
