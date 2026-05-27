import Image from "next/image";
import type { Author } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

type Props = {
  author: Author;
};

export default function AuthorCard({ author }: Props) {
  const photoUrl = author.photo
    ? imageUrlFor(author.photo).width(80).height(80).fit("crop").auto("format").url()
    : null;

  return (
    <div className="flex gap-5 items-start p-6 bg-brown-card/60 rounded-2xl border border-white/[0.06]">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={author.name}
          width={80}
          height={80}
          className="rounded-full w-16 h-16 object-cover flex-shrink-0 ring-2 ring-gold/30 ring-offset-2 ring-offset-brown-deep"
          loading="lazy"
          sizes="64px"
        />
      ) : (
        <div
          className="rounded-full w-16 h-16 bg-orange text-cream flex items-center justify-center flex-shrink-0 ring-2 ring-gold/30 ring-offset-2 ring-offset-brown-deep"
          aria-hidden="true"
        >
          <span className="text-2xl font-serif font-bold">
            {author.name[0]}
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="font-serif font-bold text-cream text-lg">{author.name}</p>
        {author.role && (
          <p className="text-xs text-gold font-semibold uppercase tracking-widest">
            {author.role}
          </p>
        )}
        {author.bio && (
          <p className="text-sm text-cream/55 leading-relaxed">{author.bio}</p>
        )}
      </div>
    </div>
  );
}
