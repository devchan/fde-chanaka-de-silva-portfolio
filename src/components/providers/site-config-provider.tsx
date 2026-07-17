"use client";

/**
 * Makes the resolved site config available to Client Components (navbar, hero,
 * command palette, contact form). The server layout reads the config once and
 * hydrates this provider, so client surfaces reflect admin edits without any
 * client-side fetching.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedSiteConfig } from "@/lib/site-config";

const SiteConfigContext = createContext<ResolvedSiteConfig | null>(null);

export function SiteConfigProvider({
  value,
  children,
}: {
  value: ResolvedSiteConfig;
  children: ReactNode;
}) {
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig(): ResolvedSiteConfig {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return ctx;
}
