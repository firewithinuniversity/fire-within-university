/**
 * scripts/add-first-lesson.ts
 *
 * Adds the first published lesson ("Your Maker is Also Your Husband")
 * to the Song of Solomon course and links it as the only lesson.
 *
 * The other courses stay "Coming soon" — this script does NOT touch them.
 *
 * Before running: paste the real YouTube URL into YOUTUBE_URL below.
 *
 * Usage:  npx tsx scripts/add-first-lesson.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ─── FILL THIS IN ───────────────────────────────────────────────────
const YOUTUBE_URL = "https://youtu.be/9ESChxDNBwk";
// ────────────────────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local"
  );
  process.exit(1);
}

if (YOUTUBE_URL.includes("REPLACE_ME")) {
  console.error(
    "Please paste the real YouTube URL into YOUTUBE_URL at the top of this file."
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

const LESSON_TITLE = "Your Maker is Also Your Husband";
const LESSON_SLUG = "your-maker-is-also-your-husband";
const COURSE_SLUG = "song-of-solomon";

async function main() {
  console.log(`Project: ${projectId}, dataset: ${dataset}`);

  // 1. Find the Song of Solomon course
  const course: { _id: string; title: string } | null = await client.fetch(
    `*[_type == "course" && slug.current == $slug][0] { _id, title }`,
    { slug: COURSE_SLUG }
  );

  if (!course) {
    console.error(`Song of Solomon course not found (slug: ${COURSE_SLUG})`);
    process.exit(1);
  }

  console.log(`Found course: ${course.title}`);

  // 2. Create (or update) the first lesson
  const existing: { _id: string } | null = await client.fetch(
    `*[_type == "lesson" && slug.current == $slug][0] { _id }`,
    { slug: LESSON_SLUG }
  );

  const lessonDoc = {
    _type: "lesson",
    title: LESSON_TITLE,
    slug: { _type: "slug", current: LESSON_SLUG },
    lessonNumber: 1,
    youtubeUrl: YOUTUBE_URL,
    scripture: "Isaiah 54:5; Isaiah 62:5; Song of Solomon 1",
    body: [
      {
        _type: "block",
        _key: "intro",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "intro-text",
            text: '"For your Maker is your husband — the LORD Almighty is his name; the Holy One of Israel is your Redeemer." — Isaiah 54:5',
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "verse2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "verse2-text",
            text: '"And as a bridegroom rejoices over the bride, so shall your God rejoice over you." — Isaiah 62:5',
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "body",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "body-text",
            text: "In this teaching, we explore one of the most stunning truths in all of Scripture: God doesn't just love His people from a distance — He covenants Himself to them as a Bridegroom to a Bride. The Song of Solomon isn't just an ancient love poem. It's a window into how God sees you.",
            marks: [],
          },
        ],
      },
    ],
  };

  let lessonId: string;
  if (existing) {
    const updated = await client.patch(existing._id).set(lessonDoc).commit();
    lessonId = updated._id;
    console.log(`✅ Updated lesson: ${LESSON_TITLE}`);
  } else {
    const created = await client.create(lessonDoc);
    lessonId = created._id;
    console.log(`✅ Created lesson: ${LESSON_TITLE}`);
  }

  // 3. Link the lesson to the Song of Solomon course (as the only lesson)
  await client
    .patch(course._id)
    .set({
      lessons: [
        {
          _type: "reference",
          _key: "lesson-1",
          _ref: lessonId,
        },
      ],
      featured: true,
    })
    .commit();

  console.log(`✅ Linked lesson to course: ${course.title}`);
  console.log(`\nDone. Allow ~5 minutes for the live site to update.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
