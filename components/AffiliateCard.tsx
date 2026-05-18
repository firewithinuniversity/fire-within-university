/**
 * components/AffiliateCard.tsx — Recommended product card
 *
 * Shown in the "Resources we recommend" section at the bottom of post pages.
 * Only renders if the post has affiliate products attached in Sanity.
 *
 * LEGAL/FTC REQUIREMENTS:
 * - The FTC requires clear disclosure that affiliate links exist
 * - The disclosure is shown above the card grid (in the post page),
 *   but each card also links visibly to an external URL
 *
 * SECURITY:
 * - rel="noopener noreferrer" prevents the new tab from accessing window.opener
 *   (an attack vector where the opened page could redirect the opener)
 * - target="_blank" opens in new tab (standard for external links)
 *
 * Server Component — no interactivity needed.
 */
import Image from "next/image";
import type { AffiliateProduct } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

type Props = {
  product: AffiliateProduct;
};

export default function AffiliateCard({ product }: Props) {
  const imageUrl = product.image
    ? imageUrlFor(product.image).width(200).height(200).fit("crop").auto("format").url()
    : null;

  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 p-4 bg-white rounded-2xl border border-brown/[0.08] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
    >
      {/* Product image */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={product.name}
          width={80}
          height={80}
          className="rounded-xl w-20 h-20 object-cover flex-shrink-0"
        />
      )}

      {/* Product info */}
      <div className="flex flex-col justify-between space-y-2">
        <div>
          <h4 className="font-serif font-bold text-brown text-sm leading-snug group-hover:text-orange transition-colors duration-150">
            {product.name}
          </h4>
          <p className="text-xs text-brown/60 leading-relaxed mt-1">
            {product.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange group-hover:text-orange-hover transition-colors">
          View Resource
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </a>
  );
}
