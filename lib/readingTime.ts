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

export function readingTimeLabel(body: unknown[]): string {
  const minutes = calculateReadingTime(body);
  return `${minutes} min read`;
}
