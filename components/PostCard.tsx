import Link from "next/link";
import Image from "next/image";
import type { PostSummary } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

type Props = { post: PostSummary; readingTimeMinutes?: number };

export default function PostCard({ post, readingTimeMinutes }: Props) {
  const { title, slug, excerpt, publishedAt, author, category, mainImage } = post;

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const imageUrl = mainImage
    ? imageUrlFor(mainImage).width(600).height(340).fit("crop").auto("format").url()
    : null;

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-out border border-brown/[0.08] flex flex-col group">
      {imageUrl ? (
        <Link href={`/blog/${slug.current}`} className="block overflow-hidden aspect-video">
          <Image
            src={imageUrl}
            alt={mainImage?.alt ?? title}
            width={600}
            height={340}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-orange/15 to-gold/25 flex items-center justify-center">
          <svg width="32" height="48" viewBox="0 0 32 48" className="text-orange/40" fill="currentColor" aria-hidden="true">
            <rect x="13" y="0" width="6" height="48" rx="3" />
            <rect x="0" y="14" width="32" height="6" rx="3" />
          </svg>
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        {category && (
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange bg-orange/10 px-2.5 py-0.5 rounded-full mb-3 self-start">
            {category.title}
          </span>
        )}

        <h3 className="font-serif text-xl font-bold text-brown mb-2 leading-tight tracking-tight">
          <Link href={`/blog/${slug.current}`} className="hover:text-orange transition-colors duration-150">
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="text-sm text-brown/65 leading-relaxed mb-4 flex-grow line-clamp-3">{excerpt}</p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-brown/[0.08]">
          {author.photo && (
            <Image
              src={imageUrlFor(author.photo).width(36).height(36).fit("crop").auto("format").url()}
              alt={author.name}
              width={36}
              height={36}
              className="rounded-full w-9 h-9 object-cover ring-2 ring-brown/10"
            />
          )}
          <div className="text-xs text-brown/55 leading-snug">
            <span className="block font-semibold text-brown/75">{author.name}</span>
            <span className="text-brown/40">
              <time dateTime={publishedAt}>{formattedDate}</time>
              {readingTimeMinutes && (
                <> &middot; {readingTimeMinutes} min read</>
              )}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
