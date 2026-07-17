/**
 * Server-side site-config accessor. Reads the persisted config (if any),
 * validates + layers it over the defaults, and injects the deployment-derived
 * URL (which is an env concern, never user-editable). Server-only.
 *
 * `getSiteConfig()` returns the resolved config the site renders from.
 * `getEditableSiteConfig()` returns just the editable document (no `url`) that
 * the admin form loads and PUTs back.
 */
import { cache } from "react";
import { readStoredConfig } from "./config-store";
import { defaultSiteConfig, parseSiteConfig, type SiteConfig } from "./config-schema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chanakadesilva.dev";

export type ResolvedSite = SiteConfig["site"] & { url: string };
export type ResolvedSiteConfig = Omit<SiteConfig, "site"> & { site: ResolvedSite };

/** The editable document, validated + merged over defaults. */
export const getEditableSiteConfig = cache((): SiteConfig => {
  const stored = readStoredConfig();
  return parseSiteConfig(stored ?? defaultSiteConfig).config;
});

/** The resolved config the public site renders from (adds the env-derived url). */
export const getSiteConfig = cache((): ResolvedSiteConfig => {
  const config = getEditableSiteConfig();
  return { ...config, site: { ...config.site, url: siteUrl } };
});
