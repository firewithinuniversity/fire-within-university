"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#1a0f05] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative inline-block mb-6" aria-hidden="true">
        <div className="absolute inset-0 blur-3xl bg-gold/30 rounded-full scale-150" />
        <span className="relative text-8xl">🔥</span>
      </div>

      <h1 className="font-serif text-5xl font-bold text-cream mb-3">
        Something Went Wrong
      </h1>

      <p className="text-cream/55 text-lg max-w-md mx-auto mb-2">
        An unexpected error occurred — but don&apos;t let that cool the fire.
      </p>

      <p className="text-cream/40 text-sm italic max-w-sm mx-auto mb-2">
        &ldquo;The Lord is my strength and my shield; my heart trusts in him.&rdquo; — Psalm 28:7
      </p>

      <p className="text-cream/30 text-sm max-w-sm mx-auto mb-8">
        Try again or return home and we&apos;ll light the way.
      </p>

      {error.digest && (
        <p className="text-cream/20 text-xs font-mono mb-6">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={reset}
          className="bg-orange hover:bg-orange-hover text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-cream/30 hover:border-cream/60 text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
