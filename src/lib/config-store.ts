/**
 * File-backed persistence for the site configuration. Server-only (uses
 * node:fs) — never import from a Client Component.
 *
 * A single JSON document holds the whole editable config. Writes are atomic
 * (temp file + rename) so a crash mid-write can't corrupt the store. The path
 * is configurable via CONFIG_STORE_PATH so a Docker volume can persist it; the
 * default lives under `data/` in the project so a committed file can seed the
 * static (GitHub Pages) build.
 *
 * Swapping this for SQLite later means reimplementing only readRaw/writeRaw.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

const DEFAULT_RELATIVE_PATH = "data/site-config.json";

function storePath(): string {
  const configured = process.env.CONFIG_STORE_PATH?.trim();
  if (configured) {
    return isAbsolute(configured) ? configured : join(process.cwd(), configured);
  }
  return join(process.cwd(), DEFAULT_RELATIVE_PATH);
}

/** Raw parsed JSON from the store, or null when no config has been saved yet. */
export function readStoredConfig(): unknown | null {
  const path = storePath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    // A malformed file must not take the whole site down — fall back to
    // defaults (the caller layers over them) rather than throwing at render.
    return null;
  }
}

/** Persist the config atomically. Returns the absolute path written. */
export function writeStoredConfig(value: unknown): string {
  const path = storePath();
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
  return path;
}

export function configStorePath(): string {
  return storePath();
}

/**
 * Write the config to the repo's default path (`data/site-config.json`) so it
 * can be committed to seed the static GitHub Pages build. Distinct from the
 * live store, which may point at a Docker volume via CONFIG_STORE_PATH.
 * Best-effort: returns the path on success, or null on a read-only filesystem.
 */
export function publishToRepoDefault(value: unknown): string | null {
  const path = join(process.cwd(), DEFAULT_RELATIVE_PATH);
  try {
    mkdirSync(dirname(path), { recursive: true });
    const tmp = `${path}.${process.pid}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    renameSync(tmp, path);
    return path;
  } catch {
    return null;
  }
}
