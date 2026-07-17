/**
 * Admin authentication for the config dashboard. Server-only.
 *
 * - Password hashing: scrypt with a per-hash random salt (Node crypto, no
 *   native deps). Stored form: `scrypt$<saltHex>$<hashHex>`.
 * - Sessions: a stateless HMAC-SHA256-signed token in an httpOnly cookie
 *   (`<b64url(payload)>.<b64url(sig)>`), verified on every request. No server
 *   session store needed for a single-admin surface.
 * - The admin identity is seeded from env (ADMIN_USERNAME + ADMIN_PASSWORD_HASH,
 *   or ADMIN_PASSWORD for local convenience). Auth is "configured" only when a
 *   session secret and an admin credential both exist.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h
const SCRYPT_KEYLEN = 64;

export interface AdminSession {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
}

// --- password hashing --------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPasswordHash(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  let actual: Buffer;
  try {
    actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  } catch {
    return false;
  }
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// --- configuration -----------------------------------------------------------

function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;
  // Outside production, fall back to a fixed dev secret so the admin works
  // out-of-the-box; production must set a real SESSION_SECRET.
  if (process.env.NODE_ENV !== "production") return "dev-insecure-session-secret-change-me";
  return null;
}

function adminCredential(): { username: string; verify: (pw: string) => boolean } | null {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (passwordHash) {
    return { username, verify: (pw) => verifyPasswordHash(pw, passwordHash) };
  }
  const password = process.env.ADMIN_PASSWORD;
  if (password && password.length > 0) {
    return {
      username,
      verify: (pw) => {
        const a = Buffer.from(pw);
        const b = Buffer.from(password);
        return a.length === b.length && timingSafeEqual(a, b);
      },
    };
  }
  return null;
}

/** True when both a session secret and an admin credential are configured. */
export function isAuthConfigured(): boolean {
  return sessionSecret() !== null && adminCredential() !== null;
}

/** Verify credentials; returns the admin username on success, else null. */
export function verifyCredentials(username: string, password: string): string | null {
  const cred = adminCredential();
  if (!cred) return null;
  // Compare the username in constant time too, but only accept the configured one.
  const nameOk =
    Buffer.from(username).length === Buffer.from(cred.username).length &&
    timingSafeEqual(Buffer.from(username), Buffer.from(cred.username));
  if (!nameOk) return null;
  return cred.verify(password) ? cred.username : null;
}

// --- session tokens ----------------------------------------------------------

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function createSessionToken(username: string): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = { sub: username, role: "admin", iat: now, exp: now + SESSION_TTL_SECONDS };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  const secret = sessionSecret();
  if (!secret || !token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const provided = Buffer.from(sig, "base64url");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSession;
    if (payload.role !== "admin") return null;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

/** Read + verify the admin session from the request cookies. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
