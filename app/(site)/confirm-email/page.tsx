/**
 * app/(site)/confirm-email/page.tsx — Email confirmation landing page
 *
 * Shown after a successful newsletter signup.
 * Gives a branded, warm experience instead of a bare success flash.
 *
 * WHY A DEDICATED PAGE:
 * - Users can bookmark it / share it
 * - More room to encourage next steps (read a post, explore the ministry)
 * - Consistent with professional ministry communications
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check Your Inbox",
  description: "Thank you for subscribing to Fire Within University.",
  robots: { index: false, follow: false }, // Not a page search engines need to index
};

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      {/* Flame icon with glow */}
      <div className="relative inline-block mb-8" aria-hidden="true">
        <div className="absolute inset-0 blur-2xl bg-gold/35 rounded-full scale-150" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange/90 to-gold flex items-center justify-center shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-cream" aria-hidden="true">
            {/* Envelope with check */}
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown mb-4 leading-tight">
        Check Your Inbox
      </h1>

      <p className="text-brown/70 text-lg max-w-md mx-auto mb-3 leading-relaxed">
        A confirmation link is on its way. Click it to complete your subscription and start receiving sermons and articles.
      </p>

      <p className="text-brown/45 text-sm italic mb-10 max-w-sm mx-auto">
        &ldquo;Blessed are those who hunger and thirst for righteousness,
        for they will be filled.&rdquo; — Matthew 5:6
      </p>

      {/* Gold divider */}
      <div className="flex items-center gap-3 mb-10" aria-hidden="true">
        <div className="w-10 h-px bg-gold/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
        <div className="w-10 h-px bg-gold/40" />
      </div>

      {/* Next steps */}
      <p className="text-xs font-bold uppercase tracking-widest text-brown/40 mb-5">
        While you wait
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/blog"
          className="bg-orange hover:bg-orange-hover text-cream font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(196,94,26,0.3)] hover:-translate-y-0.5 text-sm"
        >
          Read Sermons &amp; Articles
        </Link>
        <Link
          href="/about"
          className="border-2 border-brown/25 hover:border-orange text-brown hover:text-orange font-semibold px-8 py-3.5 rounded-full transition-all duration-200 text-sm"
        >
          About the Ministry
        </Link>
      </div>
    </div>
  );
}
