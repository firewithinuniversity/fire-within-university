/**
 * scripts/update-song-video.ts
 *
 * Points the Song of Solomon video + lesson at a new YouTube URL so the
 * homepage "Latest Videos" card and the course lesson play the same video.
 *
 * Set NEW_DURATION below once known (YouTube MM:SS), or leave null to keep
 * the existing duration.
 *
 * Usage:  npx tsx scripts/update-song-video.ts
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

const NEW_URL = "https://www.youtube.com/watch?v=uT21quCCPak";
const NEW_DURATION: string | null = null; // e.g. "7:42" — null keeps existing

async function main() {
  // Video document (homepage Latest Videos)
  const video = await client.fetch(
    `*[_type == "video"][0]{ _id, title, duration }`
  );
  if (video) {
    const patch = client.patch(video._id).set({ youtubeUrl: NEW_URL });
    if (NEW_DURATION) patch.set({ duration: NEW_DURATION });
    await patch.commit();
    console.log(`✅ Video "${video.title}" → ${NEW_URL}${NEW_DURATION ? ` (${NEW_DURATION})` : ""}`);
  } else {
    console.log("No video document found.");
  }

  // Lesson document (Song of Solomon course)
  const lesson = await client.fetch(
    `*[_type == "lesson" && slug.current == "your-maker-is-also-your-husband"][0]{ _id, title }`
  );
  if (lesson) {
    const patch = client.patch(lesson._id).set({ youtubeUrl: NEW_URL });
    if (NEW_DURATION) patch.set({ duration: NEW_DURATION });
    await patch.commit();
    console.log(`✅ Lesson "${lesson.title}" → ${NEW_URL}`);
  } else {
    console.log("No matching lesson found.");
  }

  console.log("\nDone. Allow ~5 minutes for the live site cache to refresh.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
