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
async function main() {
  const videos = await client.fetch(
    `*[_type == "video"] | order(publishedAt desc) {
      _id, title, "slug": slug.current, youtubeUrl, duration, category, featured, speaker
    }`
  );
  console.log(JSON.stringify(videos, null, 2));
}
main();
