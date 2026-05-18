/**
 * app/(site)/series/[slug]/page.tsx — Individual series page
 *
 * Shows all posts in a series in chronological order (Part 1, 2, 3…).
 * Great for binge-reading a full teaching series.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSeriesBySlug, getPostsBySeries, getAllSeries } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import PostCard from "@/components/PostCard";

export async function generateStaticParams() {
  const allSeries = await getAllSeries();
  return allSeries.map(({ slug }) => ({ slug: slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return { title: "Series Not Found" };
  return {
    title: series.title,
    description: series.description,
    openGraph: {
      title: series.title,
      description: series.description,
      type: "website",
    },
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [series, posts] = await Promise.all([
    getSeriesBySlug(slug),
    (async () => {
      const s = await getSeriesBySlug(slug);
      return s ? getPostsBySeries(s._id) : [];
    })(),
  ]);

  if (!series) notFound();

  const coverImageUrl = series.coverImage
    ? imageUrlFor(series.coverImage).width(1200).height(400).fit("crop").auto("format").url()
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      {/* Breadcrumb */}
      <nav className="text-sm text-brown/45 mb-8 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/series" className="hover:text-orange transition-colors">
          Teaching Series
        </Link>
        <span aria-hidden="true" className="text-brown/25">/</span>
        <span className="text-brown/65 truncate">{series.title}</span>
      </nav>

      {/* Series header */}
      <header className="mb-12">
        {coverImageUrl && (
          <div className="rounded-2xl overflow-hidden shadow-md mb-8">
            <Image
              src={coverImageUrl}
              alt={series.title}
              width={1200}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        <div className="max-w-2xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange bg-orange/10 px-2.5 py-0.5 rounded-full mb-4">
            {series.postCount} {series.postCount === 1 ? "part" : "parts"}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown leading-tight mb-4">
            {series.title}
          </h1>
          {series.description && (
            <p className="text-brown/70 text-lg leading-relaxed">{series.description}</p>
          )}
        </div>
      </header>

      {/* Posts in this series */}
      {posts.length === 0 ? (
        <p className="text-brown/50 text-center py-16">
          No posts published in this series yet. Check back soon.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-8" aria-hidden="true">
            <div className="w-8 h-px bg-gold/40" />
            <span className="text-xs font-bold uppercase tracking-widest text-gold/70">
              Posts in this Series
            </span>
            <div className="flex-grow h-px bg-gold/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div key={post._id} className="relative">
                {/* Part number overlay */}
                <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-brown/90 text-cream text-xs font-bold flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
