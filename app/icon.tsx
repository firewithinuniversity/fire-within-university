import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a0f05",
          borderRadius: 6,
        }}
      >
        <svg
          width="22"
          height="26"
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
