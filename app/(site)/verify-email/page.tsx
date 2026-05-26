"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const missingParams = !token || !email;

  useEffect(() => {
    if (missingParams) {
      setStatus("error");
      setMessage("This verification link is invalid or incomplete.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        );
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }

    verify();
  }, [token, email, missingParams]);

  return (
    <div className="bg-brown-deep min-h-screen flex items-center justify-center px-4 py-16">
      <div className="bg-[#2a1a0e] rounded-2xl shadow-2xl w-full max-w-md border border-white/[0.06] p-8">
        <h1 className="font-serif text-2xl font-bold text-cream text-center mb-2">
          Email Verification
        </h1>

        {status === "loading" && (
          <div className="text-center space-y-4 mt-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center animate-pulse">
              <svg
                className="w-6 h-6 text-gold animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <p className="text-cream/60 text-sm">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4 mt-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-900/30 border border-green-700/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <p className="text-cream/70 text-sm">{message}</p>
            <Link
              href="/profile"
              className="inline-block bg-orange hover:bg-orange-hover text-cream font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Go to Profile
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4 mt-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-900/30 border border-red-700/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-cream/60 text-sm">{message}</p>
            <Link
              href="/"
              className="inline-block text-sm text-gold hover:text-gold/80 transition-colors"
            >
              Go to homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
