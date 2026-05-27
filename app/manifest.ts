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
        src: "/pwa-icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
