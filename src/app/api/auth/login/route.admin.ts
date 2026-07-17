import { cookies } from "next/headers";
import { z } from "zod";
import {
  SESSION_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Route handlers that read the request / set cookies can't be statically
// exported, so this file is named *.admin.ts and only compiled in server mode.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return Response.json(
      { error: "Admin auth is not configured. Set ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) and SESSION_SECRET." },
      { status: 503 },
    );
  }

  const limited = rateLimit(clientKey(request, "login"), 8, 60_000);
  if (!limited.ok) {
    return Response.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Username and password are required." }, { status: 400 });
  }

  const username = verifyCredentials(parsed.data.username, parsed.data.password);
  if (!username) {
    return Response.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = createSessionToken(username);
  if (!token) {
    return Response.json({ error: "Session secret is not configured." }, { status: 503 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
  return Response.json({ ok: true, username });
}
