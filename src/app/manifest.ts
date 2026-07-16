import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { basePath, publicPath } from "@/lib/paths";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} Portfolio`,
    short_name: "Chanaka",
    description: site.description,
    start_url: basePath ? `${basePath}/` : "/",
    scope: basePath ? `${basePath}/` : "/",
    display: "standalone",
    background_color: "#06060b",
    theme_color: "#06060b",
    icons: [
      {
        src: publicPath("/favicon.ico"),
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
