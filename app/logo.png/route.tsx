import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Generates a 200×200 PNG logo for structured data and social sharing.
 * Google requires Organization logos to be at least 112×112px in PNG/JPG format.
 * Matches the flame motif from app/icon.tsx.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 200,
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a0f05",
          borderRadius: 24,
        }}
      >
        {/* Flame icon */}
        <svg
          width="80"
          height="96"
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer flame — gold */}
          <path
            d="M12 0C12 0 4 8 4 16C4 20.418 7.582 24 12 24C16.418 24 20 20.418 20 16C20 8 12 0 12 0Z"
            fill="#E8A020"
          />
          {/* Inner flame — orange */}
          <path
            d="M12 6C12 6 8 12 8 17C8 19.209 9.791 21 12 21C14.209 21 16 19.209 16 17C16 12 12 6 12 6Z"
            fill="#C45E1A"
          />
        </svg>
        {/* Ministry initials */}
        <div
          style={{
            color: "#FDF6EC",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 6,
            marginTop: 8,
          }}
        >
          FWU
        </div>
      </div>
    ),
    { width: 200, height: 200 }
  );
}
