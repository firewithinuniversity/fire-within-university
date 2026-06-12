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
  const post = await client.fetch(
    `*[_type == "post" && slug.current == "apostolic-authorship-fourth-gospel"][0] {
      _id, title, "slug": slug.current,
      "author": author->name,
      "category": category->title,
      excerpt,
      "bodyBlockCount": count(body),
      "firstBlocks": body[0..2]
    }`
  );
  console.log(JSON.stringify(post, null, 2));
}
main();
