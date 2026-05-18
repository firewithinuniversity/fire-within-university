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
import { getAllSeries } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "Teaching Series",
  description:
    "Explore multi-part sermon and article series. Deep dives into scripture designed to transform your walk with Jesus.",
};

export default async function SeriesPage() {
  const allSeries = await getAllSeries();

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-12 space-y-3">
        <p className="text-orange font-bold text-xs uppercase tracking-widest">
          Structured Teaching
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown leading-tight">
          Teaching Series
        </h1>
        <p className="text-brown/65 text-lg max-w-xl">
          Multi-part studies to go deep into scripture. Start at part one and
          let the Spirit lead you through.
        </p>
      </div>

      {allSeries.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-14 space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-orange/60" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="font-serif text-3xl font-bold text-brown">Series Coming Soon</p>
            <p className="text-brown/60 leading-relaxed">
              Be the first to know when we publish. Drop your email below and we will
              notify you the moment the first series launches.
            </p>
          </div>

          <div className="pt-2">
            <EmailSignup variant="inline" />
          </div>

          <p className="text-brown/45 text-sm italic pt-4 border-t border-brown/10">
            &ldquo;The unfolding of your words gives light; it gives understanding to the simple.&rdquo;
            {" "}
            <a
              href="https://www.biblegateway.com/passage/?search=Psalm+119%3A130&version=NIV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:text-orange-hover not-italic font-semibold text-xs transition-colors"
            >
              — Psalm 119:130
            </a>
          </p>

          <Link href="/blog" className="inline-flex items-center gap-2 text-orange hover:text-orange-hover font-semibold text-sm transition-colors">
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
                className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-brown/[0.08] flex flex-col"
              >
                {/* Cover image */}
                {imageUrl ? (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={series.title}
                      width={600}
                      height={340}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-orange/15 to-gold/25 flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-orange/40" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  {/* Episode count badge */}
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange bg-orange/10 px-2.5 py-0.5 rounded-full mb-3 self-start">
                    {series.postCount} {series.postCount === 1 ? "part" : "parts"}
                  </span>

                  <h2 className="font-serif text-xl font-bold text-brown mb-2 leading-tight group-hover:text-orange transition-colors duration-150">
                    {series.title}
                  </h2>

                  {series.description && (
                    <p className="text-sm text-brown/65 leading-relaxed line-clamp-2 flex-grow">
                      {series.description}
                    </p>
                  )}

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange group-hover:gap-2.5 transition-all duration-150">
                    Begin Series <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
