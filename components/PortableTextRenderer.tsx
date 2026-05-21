"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { imageUrlFor } from "@/lib/sanity/image";
import ScriptureTooltip from "@/components/ScriptureTooltip";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed text-cream/80">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif text-2xl font-bold text-cream mt-8 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-xl font-bold text-cream mt-6 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-serif text-lg font-semibold text-cream mt-4 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gold pl-5 italic text-cream/70 my-6 text-lg leading-relaxed">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1 text-cream/80">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 text-cream/80">
        {children}
      </ol>
    ),
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-cream">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    scriptureRef: ({ value, children }) => (
      <ScriptureTooltip reference={value?.reference ?? String(children)}>
        {children}
      </ScriptureTooltip>
    ),
    link: ({ value, children }) => {
      let href = value?.href ?? "#";
      // Block dangerous protocols — only allow http(s), mailto, and relative paths
      const isAllowedProtocol = /^(https?:\/\/|mailto:|\/[^/])/.test(href);
      if (!isAllowedProtocol && href !== "#") href = "#";
      const isExternal = href.startsWith("http") || href.startsWith("mailto");

      if (isExternal) {
        return (
          <a
            href={href}
            target={value?.blank ? "_blank" : undefined}
            rel={value?.blank ? "noopener noreferrer" : undefined}
            className="text-gold underline hover:text-gold transition-colors"
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          href={href}
          className="text-gold underline hover:text-gold transition-colors"
        >
          {children}
        </Link>
      );
    },
  },

  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const imageUrl = imageUrlFor(value).width(800).auto("format").url();
      return (
        <figure className="my-6">
          <Image
            src={imageUrl}
            alt={value.alt ?? "Article image"}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
          />
          {value.caption && (
            <figcaption className="text-xs text-cream/40 text-center mt-2 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

type Props = {
  value: unknown[];
};

export default function PortableTextRenderer({ value }: Props) {
  return (
    <div className="prose-ministry">
      <PortableText
        value={value as Parameters<typeof PortableText>[0]["value"]}
        components={components}
      />
    </div>
  );
}
