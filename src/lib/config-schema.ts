/**
 * Site configuration schema — the single source of truth for what the admin can
 * edit and what the site reads. Client-safe (zod only, no Node APIs) so it can
 * be imported by both the admin forms and the server accessor.
 */
import { z } from "zod";
import { site, stats, navLinks, technologies, features } from "@/data/site";

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

export const siteConfigSchema = z.object({
  site: z.object({
    name: nonEmpty(80),
    title: nonEmpty(120),
    email: z.email().max(160),
    github: z.url().max(300),
    linkedin: z.url().max(300),
    // A path (e.g. /resume/...pdf) or absolute URL — not constrained to a URL.
    resumeUrl: nonEmpty(300),
    tagline: nonEmpty(300),
    description: nonEmpty(600),
    keywords: z.array(nonEmpty(60)).max(40),
    targetRoles: z.array(nonEmpty(80)).max(20),
  }),
  stats: z
    .array(
      z.object({
        label: nonEmpty(60),
        value: z.number().int().min(0).max(1_000_000),
        suffix: z.string().max(6),
      }),
    )
    .max(8),
  navLinks: z
    .array(
      z.object({
        href: nonEmpty(120),
        label: nonEmpty(40),
      }),
    )
    .min(1)
    .max(20),
  technologies: z.array(nonEmpty(40)).max(80),
  features: z.object({
    stats: z.boolean(),
    techMarquee: z.boolean(),
    githubGraph: z.boolean(),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

/** The seed config, assembled from the static defaults in `@/data/site`. */
export const defaultSiteConfig: SiteConfig = {
  site: {
    name: site.name,
    title: site.title,
    email: site.email,
    github: site.github,
    linkedin: site.linkedin,
    resumeUrl: site.resumeUrl,
    tagline: site.tagline,
    description: site.description,
    keywords: [...site.keywords],
    targetRoles: [...site.targetRoles],
  },
  stats: stats.map((s) => ({ label: s.label, value: s.value, suffix: s.suffix })),
  navLinks: navLinks.map((l) => ({ href: l.href, label: l.label })),
  technologies: [...technologies],
  features: { ...features },
};

/**
 * Validate an unknown value against the schema, layering it over the defaults
 * first so a partial/older stored object still produces a complete config.
 * Returns the defaults unchanged if the merged value fails validation.
 */
export function parseSiteConfig(value: unknown): {
  config: SiteConfig;
  valid: boolean;
  error?: z.ZodError;
} {
  const merged = mergeOverDefaults(value);
  const result = siteConfigSchema.safeParse(merged);
  if (result.success) return { config: result.data, valid: true };
  return { config: defaultSiteConfig, valid: false, error: result.error };
}

function mergeOverDefaults(value: unknown): SiteConfig {
  if (!value || typeof value !== "object") return defaultSiteConfig;
  const v = value as Partial<SiteConfig>;
  return {
    site: { ...defaultSiteConfig.site, ...(v.site ?? {}) },
    stats: v.stats ?? defaultSiteConfig.stats,
    navLinks: v.navLinks ?? defaultSiteConfig.navLinks,
    technologies: v.technologies ?? defaultSiteConfig.technologies,
    features: { ...defaultSiteConfig.features, ...(v.features ?? {}) },
  };
}
