import { getAdminSession } from "@/lib/auth";
import { siteConfigSchema } from "@/lib/config-schema";
import { writeStoredConfig } from "@/lib/config-store";
import { getEditableSiteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Current editable config (admin only). */
export async function GET() {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ config: getEditableSiteConfig() });
}

/** Validate and persist a new config (admin only). */
export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = siteConfigSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Validation failed.",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 422 },
    );
  }

  writeStoredConfig(parsed.data);
  return Response.json({ ok: true, config: parsed.data });
}
