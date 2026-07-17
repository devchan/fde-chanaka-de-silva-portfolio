import { getAdminSession } from "@/lib/auth";
import { publishToRepoDefault } from "@/lib/config-store";
import { getEditableSiteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Publish the current config to the repo's committable file
 * (`data/site-config.json`). Committing it makes the static GitHub Pages build
 * reflect the saved config. Always returns the JSON so it can also be
 * downloaded and committed manually when the filesystem is read-only.
 */
export async function POST() {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = getEditableSiteConfig();
  const path = publishToRepoDefault(config);
  return Response.json({
    ok: true,
    written: path !== null,
    path,
    config,
  });
}
