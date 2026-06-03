/**
 * app/(site)/thank-you/page.tsx — Post-donation thank you page
 *
 * Users land here after completing a Stripe Checkout.
 * Stripe appends ?session_id=... to the URL — we could use this to
 * look up the session and display the exact amount, but for Phase 1
 * a warm generic thank-you is sufficient and simpler.
 *
 * Server Component — no interactivity needed.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import DonationTracker from "@/components/DonationTracker";
import EmailSignup from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for your generous gift to Fire Within University.",
  // Prevent search engines from indexing the thank-you page
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <Suspense fallback={null}>
        <DonationTracker />
      </Suspense>
      {/* Warm icon with gold glow */}
      <div className="relative inline-block mb-4" aria-hidden="true" role="img">
        <div className="absolute inset-0 blur-2xl bg-gold/30 rounded-full scale-150" />
        <span className="relative text-6xl">🔥</span>
      </div>

      <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream tracking-tight">
        Thank You!
      </h1>

      <p className="text-cream/60 text-lg leading-relaxed max-w-md mx-auto">
        Your generous gift goes directly toward creating content that reaches
        people for Christ and builds up the body of believers.
      </p>

      <p className="text-cream/50 leading-relaxed max-w-md mx-auto">
        We are praying for you and deeply grateful for your partnership in
        this ministry. Together, we&apos;re keeping the fire burning.
      </p>

      {/* Scripture */}
      <div className="bg-brown-card/60 border border-white/[0.06] rounded-2xl p-7 my-6">
        <p className="font-serif text-lg italic text-cream/70 leading-relaxed">
          &ldquo;And do not forget to do good and to share with others, for with
          such sacrifices God is pleased.&rdquo;
        </p>
        <p className="text-sm text-gold mt-2 font-medium">
          <a
            href="https://www.biblegateway.com/passage/?search=Hebrews+13%3A16&version=NIV"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Hebrews 13:16
          </a>
        </p>
      </div>

      {/* Next steps */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link
          href="/blog"
          className="bg-orange hover:bg-orange-hover text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Read Sermons &amp; Articles
        </Link>
        <Link
          href="/"
          className="border border-cream/30 hover:border-cream/60 text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Return Home
        </Link>
      </div>

      {/* Stay connected — capture the warmest possible newsletter lead */}
      <div className="bg-brown-card/40 border border-white/[0.06] rounded-2xl p-6 my-6 text-left">
        <p className="font-serif text-lg font-bold text-cream text-center mb-1">Stay connected</p>
        <p className="text-cream/55 text-sm text-center mb-4">
          Get updates on what your gift makes possible.
        </p>
        <EmailSignup variant="inline" location="thank-you" />
      </div>

      {/* Donation disclaimer — reiterate after the transaction */}
      <p className="text-xs text-cream/50 max-w-sm mx-auto mt-8">
        As a reminder, Fire Within University (operated by The Fire Within LLC)
        is not a 501(c)(3) nonprofit. Your donation is not tax-deductible. A
        receipt from Stripe has been sent to your email.
      </p>
    </div>
  );
}
