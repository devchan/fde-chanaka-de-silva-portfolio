import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} Portfolio`,
    short_name: "Chanaka",
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#06060b",
    theme_color: "#06060b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
