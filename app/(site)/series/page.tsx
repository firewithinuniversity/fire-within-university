/**
 * app/(site)/series/page.tsx — Teaching Series index
 *
 * Shows all sermon/article series with cover image, description, and
 * episode count. Helps new visitors discover multi-part teachings.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import EmailSignup from "@/components/EmailSignup";
import PageHeader from "@/components/PageHeader";
import { getAllSeries } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import { canonicalUrl } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Teaching Series",
  description:
    "Explore multi-part sermon and article series. Deep dives into scripture designed to transform your walk with Jesus.",
  alternates: {
    canonical: canonicalUrl("/series"),
  },
  openGraph: {
    title: "Teaching Series",
    description: "Explore multi-part sermon and article series. Deep dives into scripture designed to transform your walk with Jesus.",
    url: canonicalUrl("/series"),
  },
};

export default async function SeriesPage() {
  const allSeries = await getAllSeries();

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Structured Teaching"
        title="Teaching Series"
        subtitle="Multi-part studies to go deep into scripture. Start at part one and let the Spirit lead you through."
      />
      <div className="max-w-6xl mx-auto px-4">

      {allSeries.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-14 space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold/[0.08] flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-gold/50" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="font-serif text-3xl font-bold text-cream">Series Coming Soon</p>
            <p className="text-cream/50 leading-relaxed">
              Be the first to know when we publish. Drop your email below and we will
              notify you the moment the first series launches.
            </p>
          </div>

          <div className="pt-2">
            <EmailSignup variant="inline" />
          </div>

          <p className="text-cream/50 text-sm italic pt-4 border-t border-cream/[0.06]">
            &ldquo;The unfolding of your words gives light; it gives understanding to the simple.&rdquo;
            {" "}
            <a
              href="https://www.biblegateway.com/passage/?search=Psalm+119%3A130&version=NIV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light not-italic font-semibold text-xs transition-colors"
            >
              — Psalm 119:130
            </a>
          </p>

          <Link href="/blog" className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold text-sm transition-colors">
            Browse individual posts <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {allSeries.map((series) => {
            const imageUrl = series.coverImage
              ? imageUrlFor(series.coverImage).width(600).height(340).fit("crop").auto("format").url()
              : null;

            return (
              <Link
                key={series._id}
                href={`/series/${series.slug.current}`}
                className="group bg-brown-card/70 rounded-2xl overflow-hidden hover:shadow-kindle hover:-translate-y-1 transition-all duration-300 border border-white/[0.06] flex flex-col"
              >
                {/* Cover image */}
                {imageUrl ? (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={series.title}
                      width={600}
                      height={340}
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gold/[0.08] to-brown-card flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-gold/30" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  {/* Episode count badge */}
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-gold bg-gold/[0.1] px-2.5 py-0.5 rounded-full mb-3 self-start">
                    {series.postCount} {series.postCount === 1 ? "part" : "parts"}
                  </span>

                  <h2 className="font-serif text-xl font-bold text-cream mb-2 leading-tight group-hover:text-gold transition-colors duration-150">
                    {series.title}
                  </h2>

                  {series.description && (
                    <p className="text-sm text-cream/55 leading-relaxed line-clamp-2 flex-grow">
                      {series.description}
                    </p>
                  )}

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold group-hover:gap-2.5 transition-all duration-150">
                    Begin Series <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
