/**
 * app/(site)/donate/page.tsx — Donation page
 *
 * Static metadata is exported from this server component.
 * The actual interactive form is a Client Component (DonateForm)
 * to keep the page shell as a Server Component.
 *
 * PATTERN — splitting server/client:
 * Page-level metadata and static content can be in the Server Component.
 * Only the interactive parts need "use client".
 * This minimizes client-side JavaScript bundle size.
 */
import type { Metadata } from "next";
import DonateForm from "./DonateForm";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Give",
  description:
    "Support the ministry of Fire Within University. Your generosity makes this work possible.",
  alternates: { canonical: canonicalUrl("/donate") },
  openGraph: {
    title: "Give — Fire Within University",
    description: "Support the ministry of Fire Within University. Your generosity makes this work possible.",
    url: canonicalUrl("/donate"),
  },
};

export default function DonatePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
      {/* Page header — spiritual invitation, not transactional */}
      <div className="text-center mb-12 space-y-5">
        {/* Small cross accent */}
        <div className="flex justify-center" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" className="text-gold/40">
            <rect x="6" y="0" width="4" height="24" rx="2" />
            <rect x="0" y="7" width="16" height="4" rx="2" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream">
          Sow Into the Kingdom
        </h1>
        <p className="text-cream/60 max-w-lg mx-auto leading-relaxed text-lg">
          Your generosity directly funds sermons, articles, and resources
          that reach people for Christ. Every seed sown bears fruit.
        </p>

        {/* Scripture — links to BibleGateway */}
        <div className="bg-brown-card/60 rounded-2xl px-6 py-5 max-w-lg mx-auto border border-gold/15">
          <p className="text-cream/50 text-sm italic leading-relaxed">
            &ldquo;Each of you should give what you have decided in your heart to
            give, not reluctantly or under compulsion, for God loves a cheerful
            giver.&rdquo;
          </p>
          <a
            href="https://www.biblegateway.com/passage/?search=2+Corinthians+9%3A7&version=NIV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light text-xs font-semibold mt-2 inline-block transition-colors"
          >
            — 2 Corinthians 9:7
          </a>
        </div>
      </div>

      {/* Interactive donation form */}
      <DonateForm />

      {/* Trust signals */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 mb-6 text-cream/50">
        <div className="flex items-center gap-2 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure via Stripe
        </div>
        <div className="flex items-center gap-2 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          We never see your card
        </div>
      </div>

      {/* Disclaimer — legally required, clearly visible */}
      <div className="p-5 bg-brown-card/40 rounded-2xl border border-white/[0.06]">
        <p className="text-xs text-cream/50 leading-relaxed text-center">
          <strong className="text-cream/55">Important:</strong> Fire Within
          University is operated by The Fire Within LLC, which is not a registered
          501(c)(3) nonprofit organization. Donations are not tax-deductible under
          U.S. federal or state law. By donating, you acknowledge this
          understanding. You will be redirected to Stripe&apos;s secure checkout
          to complete your gift.
        </p>
      </div>
    </div>
  );
}
