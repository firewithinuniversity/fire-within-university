/**
 * app/studio/[[...tool]]/page.tsx
 *
 * This is the Sanity Studio embedded in your Next.js app.
 * Navigating to /studio opens the full content editing interface.
 *
 * WHY split into Server + Client:
 * - "metadata" must be exported from a Server Component
 * - NextStudio must run as a Client Component (it's a full React app)
 * - So we export metadata here (Server Component) and render a client wrapper
 *
 * SECURITY: Access to the Studio is protected by Sanity's own authentication.
 * Team members must have a sanity.io account and be invited to the project.
 */
import { metadata, viewport } from "next-sanity/studio";
import StudioPageClient from "./StudioPageClient";

export { metadata, viewport };

export default function StudioPage() {
  return <StudioPageClient />;
}
