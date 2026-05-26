/**
 * Extract heading blocks from a Portable Text body array.
 * Returns an ordered list of { text, level, id } for TOC generation.
 */

export type TocHeading = {
  text: string;
  level: 2 | 3 | 4;
  id: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract plain text from a Portable Text block's `children` spans.
 * Each span has a `text` field.
 */
function spanText(block: Record<string, unknown>): string {
  const children = block.children as Array<{ text?: string }> | undefined;
  if (!Array.isArray(children)) return "";
  return children.map((c) => c.text ?? "").join("");
}

const HEADING_STYLES = new Set(["h2", "h3", "h4"]);
const LEVEL_MAP: Record<string, 2 | 3 | 4> = { h2: 2, h3: 3, h4: 4 };

export function extractHeadings(body: unknown[]): TocHeading[] {
  if (!Array.isArray(body)) return [];

  const headings: TocHeading[] = [];

  for (const block of body) {
    if (typeof block !== "object" || block === null) continue;
    const b = block as Record<string, unknown>;
    if (b._type !== "block") continue;

    const style = b.style as string | undefined;
    if (!style || !HEADING_STYLES.has(style)) continue;

    const text = spanText(b);
    if (!text.trim()) continue;

    headings.push({
      text: text.trim(),
      level: LEVEL_MAP[style],
      id: slugify(text.trim()),
    });
  }

  return headings;
}
