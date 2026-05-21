/**
 * app/not-found.tsx — Custom 404 page
 *
 * In Next.js App Router, this file is automatically rendered whenever:
 * - A URL doesn't match any route
 * - A Server Component calls notFound() (like our post page does for missing slugs)
 *
 * PATTERN: This is at app/ level so it applies site-wide.
 * It renders OUTSIDE the (site) layout (no Navbar/Footer) because it's in
 * the root app/ directory. We add a minimal nav link manually.
 *
 * Note: This uses the root layout (fonts, body styles) but not the site layout.
 * If you want Navbar/Footer on 404, move this to app/(site)/not-found.tsx.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a0f05] flex flex-col items-center justify-center px-4 text-center">
      {/* Warm visual with gold glow */}
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

      <p className="text-cream/40 text-sm italic max-w-sm mx-auto mb-2">
        &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo; — Psalm 119:105
      </p>

      <p className="text-cream/30 text-sm max-w-sm mx-auto mb-8">
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
