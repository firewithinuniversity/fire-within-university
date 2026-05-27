import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brown-deep flex flex-col items-center justify-center px-4 text-center">
      <div className="relative inline-block mb-6" aria-hidden="true">
        <div className="absolute inset-0 blur-3xl bg-gold/30 rounded-full scale-150" />
        <span className="relative text-8xl">🔥</span>
      </div>

      <h1 className="font-serif text-5xl font-bold text-cream mb-3">
        Page Not Found
      </h1>

      <p className="text-cream/55 text-lg max-w-md mx-auto mb-2">
        We couldn&apos;t find what you were looking for — but don&apos;t let
        that cool the fire.
      </p>

      <p className="text-cream/50 text-sm italic max-w-sm mx-auto mb-2">
        &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo; — Psalm 119:105
      </p>

      <p className="text-cream/50 text-sm max-w-sm mx-auto mb-8">
        Let us light the way back.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="bg-orange hover:bg-orange-hover text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/blog"
          className="border border-cream/30 hover:border-cream/60 text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Browse Sermons
        </Link>
      </div>
    </div>
  );
}
