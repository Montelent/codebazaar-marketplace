import { revalidatePath } from "next/cache";
import { query, queryOne } from "@/lib/db";
import { DEFAULT_SETTINGS, type SiteSettingsMap } from "@/lib/default-settings";

function normalizeValue(v: unknown): unknown {
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
}

export async function getAllSettings(): Promise<SiteSettingsMap> {
  const merged: SiteSettingsMap = { ...DEFAULT_SETTINGS };
  try {
    const { rows } = await query<{ key: string; value: unknown }>(
      `SELECT key, value FROM "SiteSetting"`
    );
    for (const row of rows) {
      merged[row.key] = normalizeValue(row.value) as unknown;
    }
  } catch (e) {
    console.error("getAllSettings:", e instanceof Error ? e.message : e);
  }
  return merged;
}

export async function getSettingsByPrefix(prefix: string): Promise<SiteSettingsMap> {
  const all = await getAllSettings();
  const out: SiteSettingsMap = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix)) out[k] = v;
  }
  return out;
}

export async function setSettings(entries: Record<string, unknown>) {
  const results: string[] = [];
  for (const [key, value] of Object.entries(entries)) {
    const group = key.split(".")[0] ?? "general";
    const payload = JSON.stringify(value === undefined ? null : value);
    await query(
      `
      INSERT INTO "SiteSetting" ("id", "key", "value", "group", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2::jsonb, $3, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "value" = EXCLUDED."value",
        "group" = EXCLUDED."group",
        "updatedAt" = NOW()
      `,
      [key, payload, group]
    );
    results.push(key);
  }

  try {
    revalidatePath("/");
    revalidatePath("/api/settings");
  } catch {
    /* ignore */
  }

  return results;
}

export async function getSetting(key: string): Promise<unknown> {
  const row = await queryOne<{ value: unknown }>(
    `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
    [key]
  );
  if (!row) return DEFAULT_SETTINGS[key];
  return normalizeValue(row.value);
}
