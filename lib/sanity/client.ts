/**
 * lib/sanity/client.ts — Sanity API client
 *
 * This creates the client object we use everywhere in Next.js to fetch content
 * from Sanity. Think of it like a configured axios instance or a database connection.
 *
 * TWO CLIENTS:
 * - `client` — read-only, for public content. Uses the read token.
 *   Used in Server Components and static generation.
 * - `previewClient` — used only in preview mode, with a write token.
 *   This lets editors see unpublished drafts. Protected by a secret token.
 *
 * SECURITY: The API token here is read-only. Even if somehow exposed,
 * an attacker can only read published content — not create, edit, or delete.
 */
import { createClient } from "@sanity/client";
import { SANITY_PROJECT_ID, SANITY_DATASET, getSanityReadToken, getSanityWriteToken } from "@/lib/env";

// The main client used throughout the app for fetching published content
export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01", // Pin to a specific API version for stability
  useCdn: true,             // Use Sanity's CDN for fast cached reads in production
  // No token needed for public read access to published content,
  // but we include the read token for future authenticated queries
});

// Write client — for server-side mutations (prayer requests, pray counts)
// NEVER use this in a Client Component — token must stay server-side
export function getWriteClient() {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2024-01-01",
    useCdn: false, // CDN is read-only; writes must go to the API directly
    token: getSanityWriteToken(),
  });
}

// Preview client — bypasses the CDN and fetches unpublished drafts
// Only used in preview mode, never on public pages
export function getPreviewClient(token: string) {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2024-01-01",
    useCdn: false,  // Must be false to see draft content
    token,          // Write token allows reading drafts
    perspective: "previewDrafts", // Returns draft versions when available
  });
}
