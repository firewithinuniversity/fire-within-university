/**
 * app/(site)/authors/[slug]/page.tsx — Author profile page
 *
 * Shows author bio, role, and all their published posts.
 * Builds credibility and helps readers follow specific teachers.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getAuthorBySlug, getPostsByAuthor, getAllAuthors } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import PostCard from "@/components/PostCard";

export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors
    .filter((a) => a.slug?.current)
    .map((a) => ({ slug: a.slug!.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Author Not Found" };
  return {
    title: author.name,
    description: author.bio ?? `Posts and sermons by ${author.name} at Fire Within University.`,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const posts = await getPostsByAuthor(author._id);

  const photoUrl = author.photo
    ? imageUrlFor(author.photo).width(160).height(160).fit("crop").auto("format").url()
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      {/* Author card */}
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-14 bg-[#4A2A12]/70 rounded-2xl p-8 border border-white/[0.06]">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={author.name}
            width={80}
            height={80}
            className="rounded-full w-20 h-20 object-cover ring-4 ring-gold/25 flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange/70 to-gold flex items-center justify-center flex-shrink-0 ring-4 ring-gold/25">
            <span className="text-cream text-2xl font-bold">
              {author.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-grow">
          {author.role && (
            <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1">
              {author.role}
            </p>
          )}
          <h1 className="font-serif text-3xl font-bold text-cream mb-3">{author.name}</h1>
          {author.bio && (
            <p className="text-cream/60 leading-relaxed max-w-2xl">{author.bio}</p>
          )}
          <p className="text-xs text-cream/30 mt-3">
            {posts.length} {posts.length === 1 ? "post" : "posts"} published
          </p>
        </div>
      </div>

      {/* Posts by this author */}
      <div className="mb-8">
        <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1">
          Published Work
        </p>
        <h2 className="font-serif text-2xl font-bold text-cream">
          Posts by {author.name}
        </h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-cream/40 text-center py-16">No posts published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
