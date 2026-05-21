import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts, getSeriesNavigation } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import { readingTimeLabel } from "@/lib/readingTime";
import { articleJsonLd, breadcrumbJsonLd, canonicalUrl } from "@/lib/metadata";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import AuthorCard from "@/components/AuthorCard";
import AffiliateCard from "@/components/AffiliateCard";
import EmailSignup from "@/components/EmailSignup";
import ShareButtons from "@/components/ShareButtons";
import RelatedPosts from "@/components/RelatedPosts";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  const imageUrl = post.mainImage
    ? imageUrlFor(post.mainImage).width(1200).height(630).fit("crop").url()
    : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl(`/blog/${slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url: canonicalUrl(`/blog/${slug}`),
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(slug, post.category?._id);
  const seriesNav = post.series?._id
    ? await getSeriesNavigation(post.series._id, post._id)
    : null;

  const { title, publishedAt, author, category, series, mainImage, youtubeUrl, body, affiliateProducts } = post;
  const readTime = body ? readingTimeLabel(body as unknown[]) : null;

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const heroImageUrl = mainImage
    ? imageUrlFor(mainImage).width(1200).height(500).fit("crop").auto("format").url()
    : null;

  const hasAffiliateProducts = affiliateProducts && affiliateProducts.length > 0;

  const postUrl = canonicalUrl(`/blog/${slug}`);
  const ogImageUrl = mainImage
    ? imageUrlFor(mainImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return (
    <article className="max-w-3xl mx-auto px-4 py-14">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              title,
              description: post.excerpt,
              url: postUrl,
              publishedAt,
              authorName: author.name,
              imageUrl: ogImageUrl,
            })
          ).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: canonicalUrl() },
              { name: "Sermons & Articles", url: canonicalUrl("/blog") },
              { name: title, url: postUrl },
            ])
          ).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="text-sm text-cream/35 mb-8 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/blog" className="hover:text-gold transition-colors">
          Sermons &amp; Articles
        </Link>
        <span aria-hidden="true" className="text-cream/20">/</span>
        <span className="text-cream/55 truncate">{title}</span>
      </nav>

      {/* ── Post header ─────────────────────────────────────────────── */}
      <header className="mb-8 space-y-4">
        {/* Category tag */}
        {category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold">
            {category.title}
          </span>
        )}

        {/* Series badge */}
        {series && (
          <p className="text-xs text-cream/40">
            Part of the{" "}
            <span className="font-medium text-cream/60">{series.title}</span>{" "}
            series
          </p>
        )}

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-cream leading-tight">
          {title}
        </h1>

        {/* Author + date + reading time */}
        <div className="flex items-center gap-3">
          {author.photo && (
            <Image
              src={imageUrlFor(author.photo).width(48).height(48).fit("crop").auto("format").url()}
              alt={author.name}
              width={48}
              height={48}
              className="rounded-full w-10 h-10 object-cover"
            />
          )}
          <div className="text-sm text-cream/50">
            <span className="font-medium text-cream/80">{author.name}</span>
            {author.role && (
              <span className="text-cream/40"> · {author.role}</span>
            )}
            <br />
            <time dateTime={publishedAt}>{formattedDate}</time>
            {readTime && <span className="text-cream/40"> · {readTime}</span>}
          </div>
        </div>
      </header>

      {/* ── Hero image ──────────────────────────────────────────────── */}
      {heroImageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-md">
          <Image
            src={heroImageUrl}
            alt={mainImage?.alt ?? title}
            width={1200}
            height={500}
            className="w-full h-auto"
            priority
          />
        </div>
      )}

      {/* ── YouTube embed (before body, if URL present) ─────────────── */}
      {youtubeUrl && (
        <YouTubeEmbed url={youtubeUrl} title={`${title} — sermon video`} />
      )}

      {/* ── Post body ───────────────────────────────────────────────── */}
      {body && body.length > 0 && (
        <div className="mb-10">
          <PortableTextRenderer value={body} />
        </div>
      )}

      {/* ── Series navigation ───────────────────────────────────────── */}
      {seriesNav && (
        <nav
          className="border-t border-b border-cream/[0.06] py-4 mb-10"
          aria-label="Series navigation"
        >
          <p className="text-xs text-cream/40 text-center mb-3 font-medium uppercase tracking-wider">
            {seriesNav.seriesTitle} &mdash; Part {seriesNav.currentIndex} of {seriesNav.totalPosts}
          </p>
          <div className="flex items-center justify-between gap-4">
            {/* Previous */}
            {seriesNav.prev ? (
              <Link
                href={`/blog/${seriesNav.prev.slug}`}
                className="group flex items-center gap-2 text-sm text-cream/40 hover:text-gold transition-colors duration-150 max-w-[45%]"
              >
                <span className="text-lg leading-none group-hover:-translate-x-0.5 transition-transform duration-150" aria-hidden="true">←</span>
                <span className="truncate">{seriesNav.prev.title}</span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}

            {/* Next */}
            {seriesNav.next ? (
              <Link
                href={`/blog/${seriesNav.next.slug}`}
                className="group flex items-center gap-2 text-sm text-cream/40 hover:text-gold transition-colors duration-150 max-w-[45%] ml-auto"
              >
                <span className="truncate text-right">{seriesNav.next.title}</span>
                <span className="text-lg leading-none group-hover:translate-x-0.5 transition-transform duration-150" aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </div>
        </nav>
      )}

      {/* ── Affiliate products ──────────────────────────────────────── */}
      {hasAffiliateProducts && (
        <section
          className="border-t border-cream/[0.06] pt-8 mb-10"
          aria-label="Recommended resources"
        >
          {/* FTC disclosure — legally required */}
          <p className="text-xs text-cream/40 italic mb-4">
            This page contains affiliate links. We may earn a small commission
            at no cost to you if you purchase through these links.
          </p>
          <h2 className="font-serif text-xl font-bold text-cream mb-4">
            Resources We Recommend
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {affiliateProducts!.map((product) => (
              <AffiliateCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Author bio ──────────────────────────────────────────────── */}
      <div className="border-t border-cream/[0.06] pt-8 mb-10">
        <AuthorCard author={author} />
      </div>

      {/* ── Share buttons ─────────────────────────────────────────────── */}
      <div className="border-t border-cream/[0.06] pt-8 mb-8">
        <ShareButtons title={title} />
      </div>

      {/* ── Email signup ─────────────────────────────────────────────── */}
      <section className="bg-brown-card/60 border border-white/[0.06] rounded-2xl p-8 mb-8">
        <h2 className="font-serif text-xl font-bold text-cream mb-1 text-center">
          Hungry for More?
        </h2>
        <p className="text-cream/50 text-sm text-center mb-5">
          Get new sermons and articles delivered to your inbox.
        </p>
        <EmailSignup variant="inline" />
      </section>

      {/* ── Related posts ─────────────────────────────────────────────── */}
      <RelatedPosts posts={relatedPosts} />

      {/* ── Back to blog ─────────────────────────────────────────────── */}
      <div className="text-center mt-10">
        <Link
          href="/blog"
          className="text-gold hover:text-gold text-sm font-medium transition-colors"
        >
          ← Back to Sermons &amp; Articles
        </Link>
      </div>
    </article>
  );
}
