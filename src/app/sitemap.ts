import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { experiments } from "@/data/experiments";
import { projects } from "@/data/projects";
import { navLinks, site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-16T00:00:00.000Z");
  const staticRoutes = navLinks.map((link) => ({
    url: `${site.url}${link.href}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: link.href === "/" ? 1 : 0.8,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${site.url}/projects/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const labRoutes = experiments.map((experiment) => ({
    url: `${site.url}/ai-lab/${experiment.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes, ...labRoutes];
}
