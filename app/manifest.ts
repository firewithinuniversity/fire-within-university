import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fire Within University",
    short_name: "Fire Within",
    description: "Sermons, articles, and resources to fuel your faith",
    start_url: "/",
    display: "standalone",
    background_color: "#1a0f05",
    theme_color: "#1a0f05",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        // Full brand logo for the home-screen / install icon (shown un-cropped).
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Maskable variant uses the icon-only mark so the wordmark isn't cropped
        // when the platform applies a circle/squircle mask.
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
