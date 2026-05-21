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
      className="flex gap-4 p-4 bg-[#4A2A12]/70 rounded-2xl border border-white/[0.06] hover:shadow-[0_20px_40px_-12px_rgba(61,31,10,0.4)] hover:-translate-y-0.5 transition-all duration-300 group"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={product.name}
          width={80}
          height={80}
          className="rounded-xl w-20 h-20 object-cover flex-shrink-0"
        />
      )}

      <div className="flex flex-col justify-between space-y-2">
        <div>
          <h4 className="font-serif font-bold text-cream text-sm leading-snug group-hover:text-gold transition-colors duration-150">
            {product.name}
          </h4>
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
