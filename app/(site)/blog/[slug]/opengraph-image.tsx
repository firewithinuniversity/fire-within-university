/**
 * app/(site)/blog/[slug]/opengraph-image.tsx — Dynamic OG image per post
 *
 * Next.js App Router automatically serves this as the Open Graph image for
 * every /blog/[slug] page. When someone shares a post link on Twitter,
 * Facebook, iMessage, etc., the platform fetches this URL and shows the
 * generated image as the link preview card.
 *
 * HOW IT WORKS:
 * Next.js calls this function at build time (for static params) and on-demand
 * (for dynamic slugs). It renders JSX using @vercel/og / next/og ImageResponse,
 * which converts the JSX to a PNG using a headless browser renderer.
 *
 * WHY edge runtime:
 * ImageResponse runs in the Edge runtime (not Node.js). This is lighter,
 * faster to cold-start, and deploys globally at the edge.
 *
 * DESIGN:
 * Matches the site's warm brown/gold/cream palette.
 * Title is large and centered — readable even at thumbnail size.
 * The branded footer (site name + author) is always visible.
 */
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/sanity/queries";

export const alt = "Fire Within University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Fire Within University";
  const category = post?.category?.title ?? "Ministry";
  const author = post?.author?.name ?? "Fire Within University";

  // Keep title readable at any length — shrink font for very long titles
  const titleSize = title.length > 60 ? "40px" : title.length > 40 ? "50px" : "60px";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(145deg, #2a1506 0%, #3d1f0a 40%, #5c2e0f 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial gold glow — depth and warmth */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "350px",
            background:
              "radial-gradient(ellipse, rgba(232,160,32,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Corner flame accents */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(ellipse at top right, rgba(196,94,26,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(ellipse at bottom left, rgba(196,94,26,0.20) 0%, transparent 70%)",
          }}
        />

        {/* Category badge */}
        <div
          style={{
            display: "flex",
            border: "1.5px solid rgba(232,160,32,0.55)",
            borderRadius: "999px",
            padding: "7px 22px",
            marginBottom: "28px",
            color: "#e8a020",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            background: "rgba(232,160,32,0.08)",
          }}
        >
          {category}
        </div>

        {/* Post title */}
        <div
          style={{
            color: "#fdf6ec",
            fontSize: titleSize,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.25,
            maxWidth: "980px",
            marginBottom: "36px",
          }}
        >
          {title}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: "64px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #e8a020, transparent)",
            marginBottom: "28px",
            borderRadius: "2px",
          }}
        />

        {/* Site name · author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "20px",
          }}
        >
          <span style={{ color: "#e8a020", fontWeight: 700 }}>
            Fire Within University
          </span>
          <span style={{ color: "rgba(253,246,236,0.35)", fontSize: "22px" }}>
            ·
          </span>
          <span style={{ color: "rgba(253,246,236,0.65)" }}>{author}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
