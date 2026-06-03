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
    <article className="bg-brown-card/70 rounded-2xl overflow-hidden border border-white/[0.06] hover:border-gold/15 hover:shadow-card-hover hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 flex flex-col group">
      {imageUrl ? (
        <Link href={`/blog/${slug.current}`} className="block overflow-hidden aspect-video">
          <Image
            src={imageUrl}
            alt={mainImage?.alt ?? title}
            width={600}
            height={340}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
          />
        </Link>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-gold/[0.08] to-brown flex items-center justify-center">
          <svg width="32" height="48" viewBox="0 0 32 48" className="text-gold/20" fill="currentColor" aria-hidden="true">
            <rect x="13" y="0" width="6" height="48" rx="3" />
            <rect x="0" y="14" width="32" height="6" rx="3" />
          </svg>
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        {category && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/[0.1] px-2.5 py-0.5 rounded-full mb-3 self-start">
            {category.title}
          </span>
        )}

        <h3 className="font-serif text-xl font-bold text-cream mb-2 leading-tight tracking-tight">
          <Link href={`/blog/${slug.current}`} className="hover:text-gold transition-colors duration-300">
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="text-[13px] text-cream/70 leading-relaxed mb-4 flex-grow line-clamp-3">{excerpt}</p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-cream/[0.06]">
          {author.photo && (
            <Image
              src={imageUrlFor(author.photo).width(36).height(36).fit("crop").auto("format").url()}
              alt={author.name}
              width={36}
              height={36}
              className="rounded-full w-9 h-9 object-cover ring-2 ring-cream/10"
              loading="lazy"
              sizes="36px"
            />
          )}
          <div className="text-xs text-cream/60 leading-snug">
            <span className="block font-semibold text-cream/80">{author.name}</span>
            <span className="text-cream/60">
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
