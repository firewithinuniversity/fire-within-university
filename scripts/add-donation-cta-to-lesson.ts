/**
 * scripts/add-donation-cta-to-lesson.ts
 *
 * Appends a closing donation CTA paragraph to the existing Song of
 * Solomon lesson body in Sanity. Idempotent: if the CTA marker text
 * is already present, the script exits without re-appending.
 *
 * Usage:  npx tsx scripts/add-donation-cta-to-lesson.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const LESSON_SLUG = "your-maker-is-also-your-husband";
const MARKER = "If this teaching blessed you";

async function main() {
  const lesson: { _id: string; body?: unknown[] } | null = await client.fetch(
    `*[_type == "lesson" && slug.current == $slug][0] { _id, body }`,
    { slug: LESSON_SLUG }
  );

  if (!lesson) {
    console.error(`Lesson not found: ${LESSON_SLUG}`);
    process.exit(1);
  }

  const existingBody = Array.isArray(lesson.body) ? lesson.body : [];
  const alreadyHasCta = JSON.stringify(existingBody).includes(MARKER);
  if (alreadyHasCta) {
    console.log("Donation CTA already present — nothing to do.");
    return;
  }

  const donateUrl =
    "https://www.firewithinuniversity.com/donate?utm_source=lesson&utm_medium=body&utm_campaign=song-of-solomon";

  const ctaHeading = {
    _type: "block",
    _key: "cta-heading",
    style: "h3",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "cta-heading-span",
        text: "Support the ministry",
        marks: [],
      },
    ],
  };

  const ctaParagraph = {
    _type: "block",
    _key: "cta-paragraph",
    style: "normal",
    markDefs: [
      {
        _type: "link",
        _key: "cta-link-mark",
        href: donateUrl,
        blank: true,
      },
    ],
    children: [
      {
        _type: "span",
        _key: "cta-text-1",
        text: "If this teaching blessed you, consider partnering with us so we can keep creating free sermons, articles, and courses. ",
        marks: [],
      },
      {
        _type: "span",
        _key: "cta-text-2",
        text: "Give now →",
        marks: ["cta-link-mark"],
      },
    ],
  };

  const ctaDisclaimer = {
    _type: "block",
    _key: "cta-disclaimer",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "cta-disclaimer-span",
        text: "(Donations are not tax-deductible. The Fire Within LLC is not a registered 501(c)(3) nonprofit.)",
        marks: [],
      },
    ],
  };

  const newBody = [...existingBody, ctaHeading, ctaParagraph, ctaDisclaimer];

  await client.patch(lesson._id).set({ body: newBody }).commit();
  console.log("✅ Donation CTA appended to lesson body.");
  console.log("   Allow ~5 minutes for the live site cache to refresh.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
