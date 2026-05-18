/**
 * sanity.config.ts — Sanity Studio configuration
 *
 * This file configures the Sanity Studio that runs at /studio on your site.
 * The Studio is a full React app embedded inside Next.js.
 *
 * SECURITY NOTES:
 * - CORS must be configured in sanity.io to only allow your domain (never *)
 * - Role-based permissions (writers can draft, admins can publish) are
 *   configured in the Sanity dashboard under Settings > Members
 * - Two-factor authentication is enforced at the Sanity account level
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  // These must match your NEXT_PUBLIC_SANITY_* environment variables
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  // The path where the Studio is mounted in your Next.js app
  basePath: "/studio",

  plugins: [
    // structureTool: the main content editing interface
    structureTool(),

    // visionTool: a GROQ query playground — only shows in development
    // GROQ is Sanity's query language (like SQL for their database)
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
  },
});
