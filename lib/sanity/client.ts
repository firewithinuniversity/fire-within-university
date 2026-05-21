import { createClient } from "@sanity/client";
import { SANITY_PROJECT_ID, SANITY_DATASET, getSanityReadToken, getSanityWriteToken } from "@/lib/env";

export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
  requestTagPrefix: "fwu",
  timeout: 10_000, // 10s timeout — prevents hung requests from blocking page renders
});

export function getWriteClient() {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2024-01-01",
    useCdn: false,
    token: getSanityWriteToken(),
  });
}

export function getPreviewClient(token: string) {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2024-01-01",
    useCdn: false,
    token,
    perspective: "previewDrafts",
  });
}
