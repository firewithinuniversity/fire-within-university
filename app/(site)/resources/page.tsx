/**
 * app/(site)/resources/page.tsx — Recommended Resources
 *
 * Showcases affiliate products curated by the ministry.
 * Full FTC disclosure at the top per legal requirement.
 *
 * Server Component — fetches all affiliate products from Sanity.
 */
import type { Metadata } from "next";
import { getAllAffiliateProducts } from "@/lib/sanity/queries";
import AffiliateCard from "@/components/AffiliateCard";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Recommended Resources",
  description:
    "Books, tools, and resources hand-picked by the Fire Within University team to fuel your faith and deepen your study of scripture.",
  alternates: { canonical: canonicalUrl("/resources") },
  openGraph: {
    title: "Recommended Resources — Fire Within University",
    description: "Books, tools, and resources hand-picked by the Fire Within University team to fuel your faith and deepen your study of scripture.",
    url: canonicalUrl("/resources"),
  },
};

export default async function ResourcesPage() {
  const products = await getAllAffiliateProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="flex justify-center" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" className="text-gold/40">
            <rect x="6" y="0" width="4" height="24" rx="2" />
            <rect x="0" y="7" width="16" height="4" rx="2" />
          </svg>
        </div>
        <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em]">
          Curated Tools
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream leading-tight">
          Recommended Resources
        </h1>
        <p className="text-cream/50 max-w-xl mx-auto text-lg">
          Books, Bibles, and tools our team uses and trusts. Every resource is
          chosen to help you go deeper with God.
        </p>
      </div>

      {/* FTC Disclosure — legally required */}
      <div className="bg-gold/[0.06] border border-gold/[0.15] rounded-xl px-5 py-4 mb-10">
        <p className="text-xs text-cream/55 leading-relaxed">
          <strong className="text-cream/70">Affiliate Disclosure:</strong>{" "}
          Some links on this page are affiliate links. If you purchase through them,
          we may earn a small commission at no extra cost to you. We only recommend
          resources we genuinely believe will benefit your faith journey.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-28 space-y-4">
          <p className="font-serif text-2xl font-bold text-cream">Resources Coming Soon</p>
          <p className="text-cream/50 max-w-md mx-auto">
            Our team is carefully selecting the best tools and books to recommend.
            Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <AffiliateCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
