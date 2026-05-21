"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { variant?: "hero" | "inline" };

export default function EmailSignup({ variant = "hero" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail("");
        router.push("/confirm-email");
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 px-6 bg-gold/[0.1] rounded-2xl border border-gold/20" role="alert" aria-live="polite">
        <p className="text-cream font-semibold">
          <span className="text-gold mr-2" aria-hidden="true">✦</span>
          {message}
        </p>
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className={isHero ? "max-w-md mx-auto" : "w-full"} aria-label="Newsletter signup" noValidate>
      {isHero && (
        <p className={`text-sm mb-3 text-center ${isHero ? "text-cream/70" : "text-cream/50"}`}>
          Get new sermons and articles delivered to your inbox.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          autoComplete="email"
          disabled={status === "loading"}
          className={`flex-grow px-4 py-3 rounded-full border-2 text-sm focus:outline-none focus:ring-0 disabled:opacity-60 transition-colors duration-150 ${
            isHero
              ? "border-[#D4B896]/40 bg-cream text-brown focus:border-orange placeholder:text-[#B07040]"
              : "border-cream/[0.1] bg-[#4A2A12]/60 text-cream focus:border-gold placeholder:text-cream/30"
          }`}
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-orange hover:bg-orange-hover text-cream font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 disabled:opacity-60 whitespace-nowrap hover:shadow-md hover:-translate-y-0.5 min-w-[110px] flex items-center justify-center gap-2"
        >
          {status === "loading" && (
            <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
          )}
          {status === "loading" ? "Signing up…" : "Subscribe"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-red-600 text-xs mt-2 text-center" role="alert" aria-live="polite">{message}</p>
      )}

      {/* Caption colour follows background: cream on dark hero, muted brown on light sections */}
      <p className={`text-xs mt-2.5 text-center ${isHero ? "text-cream/50" : "text-cream/35"}`}>
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}
