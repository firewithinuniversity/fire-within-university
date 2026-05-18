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

export const metadata: Metadata = {
  title: "Recommended Resources",
  description:
    "Books, tools, and resources hand-picked by the Fire Within University team to fuel your faith and deepen your study of scripture.",
};

export default async function ResourcesPage() {
  const products = await getAllAffiliateProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-10 space-y-3">
        <p className="text-orange font-bold text-xs uppercase tracking-widest">
          Curated Tools
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown leading-tight">
          Recommended Resources
        </h1>
        <p className="text-brown/65 text-lg max-w-xl">
          Books, Bibles, and tools our team uses and trusts. Every resource is
          chosen to help you go deeper with God.
        </p>
      </div>

      {/* FTC Disclosure — legally required */}
      <div className="bg-gold/10 border border-gold/25 rounded-xl px-5 py-4 mb-10">
        <p className="text-xs text-brown/65 leading-relaxed">
          <strong className="text-brown/80">Affiliate Disclosure:</strong>{" "}
          Some links on this page are affiliate links. If you purchase through them,
          we may earn a small commission at no extra cost to you. We only recommend
          resources we genuinely believe will benefit your faith journey.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-28 space-y-4">
          <p className="font-serif text-2xl font-bold text-brown">Resources Coming Soon</p>
          <p className="text-brown/55 max-w-md mx-auto">
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
