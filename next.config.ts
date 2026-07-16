import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "fde-chanaka-de-silva-portfolio";
const pagesBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (isGithubPages ? `/${repositoryName}` : "");

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : "standalone",
  basePath: pagesBasePath || undefined,
  trailingSlash: isGithubPages,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    unoptimized: isGithubPages,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
