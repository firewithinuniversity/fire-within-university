import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a0f05 0%, #2a1a0e 100%)",
          borderRadius: 40,
        }}
      >
        <svg
          width="110"
          height="130"
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 0C12 0 4 8 4 16C4 20.418 7.582 24 12 24C16.418 24 20 20.418 20 16C20 8 12 0 12 0Z"
            fill="#E8A020"
          />
          <path
            d="M12 6C12 6 8 12 8 17C8 19.209 9.791 21 12 21C14.209 21 16 19.209 16 17C16 12 12 6 12 6Z"
            fill="#C45E1A"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
