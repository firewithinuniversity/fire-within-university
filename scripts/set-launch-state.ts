/**
 * scripts/set-launch-state.ts
 *
 * One-shot for launch day:
 *   - Song of Solomon: leave alone (the featured launch course)
 *   - Old Testament Theology, The Trinity, The Holy Spirit:
 *       unfeature + clear the lessons reference list so each card renders
 *       "Coming soon" instead of "8 lessons"
 *
 * The underlying lesson documents are NOT deleted — only the references on the
 * course are cleared. You can re-link or rebuild them later from the Studio.
 *
 * Usage:  npx tsx scripts/set-launch-state.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

// Slugs of the courses to mark "Coming soon".
const COMING_SOON_SLUGS = [
  "old-testament-theology",
  "the-trinity",
  "the-holy-spirit",
];

async function main() {
  console.log(`Project: ${projectId}, dataset: ${dataset}`);

  const courses: { _id: string; title: string; slug?: { current: string } }[] =
    await client.fetch(
      `*[_type == "course" && slug.current in $slugs] { _id, title, slug }`,
      { slugs: COMING_SOON_SLUGS }
    );

  if (courses.length === 0) {
    console.log("No matching courses found — nothing to do.");
    return;
  }

  for (const c of courses) {
    const result = await client
      .patch(c._id)
      .set({ featured: false, lessons: [] })
      .commit();
    console.log(`✅ ${result.title}: featured=false, lessons cleared`);
  }

  console.log(`\nDone. Cleared ${courses.length} course(s).`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
