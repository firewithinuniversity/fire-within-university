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
      // Full brand logo (heart + flame + wordmark) for the home-screen install
      // icon, shown un-cropped where the wordmark is legible.
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Maskable uses the heart-and-flame mark (no wordmark) centered in the safe
      // zone, so nothing is clipped when the platform applies a circle/squircle mask.
      {
        src: "/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
