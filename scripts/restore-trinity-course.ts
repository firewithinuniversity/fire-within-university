/**
 * scripts/restore-trinity-course.ts
 *
 * One-shot: re-create the "The Trinity" course in Sanity after an accidental
 * deletion. Restores the course only (no lessons) so it renders with the
 * "Coming soon" tag on /courses; lessons are added one at a time as they're
 * recorded.
 *
 * Usage:
 *   npx tsx scripts/restore-trinity-course.ts
 *
 * Safe to run multiple times — uses createIfNotExists so it never clobbers
 * an existing document.
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

const course = {
  _id: "course-the-trinity",
  _type: "course",
  title: "The Trinity",
  slug: { _type: "slug", current: "the-trinity" },
  description:
    "One God, three persons — Father, Son, and Holy Spirit. This course unpacks one of the most essential and mysterious doctrines of the Christian faith.",
  instructor: "Brett & Jude",
  featured: false,
  publishedAt: new Date().toISOString(),
  whatYoullLearn: [
    "Define the doctrine of the Trinity from Scripture",
    "Understand how Father, Son, and Spirit relate to each other",
    "Avoid common heresies and misconceptions about the Trinity",
    "See the Trinity at work in creation, redemption, and daily life",
    "Deepen your worship through understanding God's triune nature",
  ],
  // No lessons array — lessons get added one at a time via the Studio.
};

async function main() {
  console.log(`Project: ${projectId}, dataset: ${dataset}`);
  const result = await client.createIfNotExists(course);
  console.log(`✅ Restored: ${result.title} (${result._id})`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
