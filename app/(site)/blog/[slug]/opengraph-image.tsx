/**
 * Dynamic Open Graph image for blog posts.
 * Next.js serves this at /blog/[slug]/opengraph-image automatically.
 * Shows title, author, category on a branded background.
 */
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/sanity/queries";

export const alt = "Fire Within University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Fire Within University";
  const author = post?.author?.name ?? "";
  const category = post?.category?.title ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #1a0f05 0%, #3D1F0A 50%, #4A2A12 100%)",
          fontFamily: "serif",
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            width: 80,
            height: 4,
            background: "#E8A020",
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Category */}
        {category && (
          <div
            style={{
              color: "#E8A020",
              fontSize: 20,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 16,
            }}
          >
            {category}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            color: "#FDF6EC",
            fontSize: title.length > 60 ? 42 : 52,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: "90%",
            marginBottom: 32,
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Author + branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            marginTop: "auto",
          }}
        >
          {author && (
            <div
              style={{
                color: "rgba(253, 246, 236, 0.6)",
                fontSize: 22,
                display: "flex",
              }}
            >
              by {author}
            </div>
          )}
          <div
            style={{
              color: "#E8A020",
              fontSize: 24,
              fontWeight: 700,
              display: "flex",
            }}
          >
            🔥 Fire Within University
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
