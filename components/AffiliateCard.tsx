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
      className="flex gap-4 p-6 bg-brown-card/70 rounded-2xl border border-white/[0.06] hover:shadow-kindle hover:-translate-y-1 transition-all duration-300 group"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={product.name}
          width={80}
          height={80}
          sizes="80px"
          loading="lazy"
          className="rounded-xl w-20 h-20 object-cover flex-shrink-0"
        />
      )}

      <div className="flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-serif font-bold text-cream text-sm leading-snug group-hover:text-gold transition-colors duration-150">
              {product.name}
            </h4>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-cream/50 border border-cream/10 rounded px-1.5 py-0.5 leading-none">
              Affiliate
            </span>
          </div>
          <p className="text-xs text-cream/50 leading-relaxed mt-1">
            {product.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold group-hover:text-gold transition-colors">
          View Resource
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </a>
  );
}
