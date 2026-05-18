/**
 * lib/readingTime.ts — Reading time calculator
 *
 * Estimates how many minutes a post takes to read.
 * Shown on post pages and cards so readers know what they're committing to.
 *
 * HOW IT WORKS:
 * Sanity stores post body as Portable Text — a JSON array of blocks.
 * Each block has a `children` array of text spans.
 * We extract all text, count the words, and divide by average reading speed.
 *
 * READING SPEED: 200 words/minute
 * Average adult silent reading speed. Lower than some estimates (250–300)
 * because sermon content tends to be denser and more reflective.
 *
 * MINIMUM: 1 minute — even a short devotional deserves its own moment.
 */

type PortableTextChild = {
  _type: string;
  text?: string;
};

type PortableTextBlock = {
  _type: string;
  children?: PortableTextChild[];
};

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(body: unknown[]): number {
  if (!Array.isArray(body) || body.length === 0) return 1;

  let wordCount = 0;

  for (const block of body as PortableTextBlock[]) {
    if (block._type !== "block" || !Array.isArray(block.children)) continue;

    for (const child of block.children) {
      if (typeof child.text === "string" && child.text.trim()) {
        wordCount += child.text.trim().split(/\s+/).filter(Boolean).length;
      }
    }
  }

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/** Returns a human-readable string like "5 min read" */
export function readingTimeLabel(body: unknown[]): string {
  const minutes = calculateReadingTime(body);
  return `${minutes} min read`;
}
