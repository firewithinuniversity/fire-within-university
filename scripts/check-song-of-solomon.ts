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
  const course = await client.fetch(
    `*[_type == "course" && slug.current == "song-of-solomon"][0] {
      _id, title, "slug": slug.current,
      "lessons": lessons[]-> { _id, title, "slug": slug.current, lessonNumber, youtubeUrl }
    }`
  );
  console.log("Course:", JSON.stringify(course, null, 2));

  const lesson = await client.fetch(
    `*[_type == "lesson" && slug.current == "your-maker-is-also-your-husband"][0] {
      _id, title, "slug": slug.current, youtubeUrl, scripture
    }`
  );
  console.log("Lesson direct:", JSON.stringify(lesson, null, 2));
}
main();
