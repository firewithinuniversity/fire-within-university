import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fire Within University",
    short_name: "FWU",
    description:
      "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
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
    ],
  };
}
