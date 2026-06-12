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
  const authors = await client.fetch(`*[_type == "author"] { _id, name, "slug": slug.current }`);
  const categories = await client.fetch(`*[_type == "category"] { _id, title, "slug": slug.current }`);
  console.log("Authors:", JSON.stringify(authors, null, 2));
  console.log("Categories:", JSON.stringify(categories, null, 2));
}
main();
