/**
 * components/PortableTextRenderer.tsx — Sanity Portable Text renderer
 *
 * Portable Text is Sanity's rich text format. The body of each post is stored
 * as a JSON array of "blocks" — paragraphs, headings, images, etc.
 * This component converts that JSON into React elements.
 *
 * WHY CUSTOM RENDERERS:
 * We override the default rendering for several things:
 * 1. External links — add rel="noopener noreferrer" and target="_blank"
 * 2. Internal links — use next/link for client-side navigation
 * 3. Images — use next/image for optimization
 * 4. Paragraphs — detect and auto-link Bible references (e.g. "John 3:16")
 *
 * SCRIPTURE LINKING:
 * A regex scans each paragraph for patterns like "John 3:16", "Genesis 1:1",
 * "1 Corinthians 13:4-7" and converts them into links to BibleGateway.
 * This runs on the server — zero client-side JavaScript cost.
 *
 * WHY "use client": PortableTextComponents accesses browser-specific
 * rendering. The @portabletext/react library works in both environments
 * but we mark it client to be safe with image rendering and link handling.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { imageUrlFor } from "@/lib/sanity/image";
import ScriptureTooltip from "@/components/ScriptureTooltip";

// ── Scripture reference auto-linking ─────────────────────────────────────────
// This regex matches Bible references like:
//   John 3:16  |  1 Corinthians 13:4-7  |  Psalm 23  |  Romans 8:28
const SCRIPTURE_REGEX =
  /\b((?:\d\s)?(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s\d+(?::\d+(?:-\d+)?)?)\b/g;

function linkScripture(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  SCRIPTURE_REGEX.lastIndex = 0; // reset stateful regex

  while ((match = SCRIPTURE_REGEX.exec(text)) !== null) {
    const [fullMatch] = match;
    const start = match.index;

    // Add text before the match
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    // Build BibleGateway URL: spaces become + signs
    const query = encodeURIComponent(fullMatch);
    const bibleUrl = `https://www.biblegateway.com/passage/?search=${query}&version=NIV`;

    parts.push(
      <a
        key={start}
        href={bibleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold underline hover:text-gold transition-colors"
        title={`Read ${fullMatch} on BibleGateway`}
      >
        {fullMatch}
      </a>
    );

    lastIndex = start + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// ── Custom component overrides ────────────────────────────────────────────────
const components: PortableTextComponents = {
  // Block-level elements
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

  // List types
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

  // Inline marks (bold, italic, links)
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-cream">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    // Scripture reference annotation — shows inline verse tooltip on hover/tap
    scriptureRef: ({ value, children }) => (
      <ScriptureTooltip reference={value?.reference ?? String(children)}>
        {children}
      </ScriptureTooltip>
    ),
    // Link annotation from Sanity editor
    link: ({ value, children }) => {
      let href = value?.href ?? "#";
      // SECURITY: Block dangerous protocols (javascript:, data:, vbscript:)
      // Only allow http(s), mailto, and relative paths
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

      // Internal link — use next/link for prefetching
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

  // Inline images (inside body text, not the main image)
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
