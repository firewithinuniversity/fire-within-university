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
import PageHeader from "@/components/PageHeader";
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
    <div className="pb-12">
      <PageHeader
        eyebrow="Partner With the Ministry"
        title="Sow Into the Kingdom"
        subtitle="Your generosity directly funds sermons, articles, and resources that reach people for Christ. Every seed sown bears fruit."
      >
        {/* Scripture — links to BibleGateway */}
        <div className="bg-brown-card/60 rounded-2xl px-6 py-5 max-w-lg mx-auto border border-gold/15 mt-2">
          <p className="text-cream/55 text-sm italic leading-relaxed">
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
      </PageHeader>

      <div className="max-w-2xl mx-auto px-4">
      {/* What your gift funds — concrete impact near the form */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Sermons & teaching", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
          { label: "Free courses", icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" },
          { label: "Reaching the lost", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
        ].map((item) => (
          <div key={item.label} className="bg-brown-card/40 border border-white/[0.06] rounded-xl px-3 py-4 text-center">
            <svg className="w-5 h-5 text-gold/70 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <p className="text-[11px] text-cream/60 leading-tight">{item.label}</p>
          </div>
        ))}
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
    </div>
  );
}
