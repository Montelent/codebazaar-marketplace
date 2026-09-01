import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, type SiteSettingsMap } from "@/lib/default-settings";

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value === undefined ? null : value));
}

export async function getAllSettings(): Promise<SiteSettingsMap> {
  const merged: SiteSettingsMap = { ...DEFAULT_SETTINGS };
  try {
    const rows = await prisma.$queryRawUnsafe<
      Array<{ key: string; value: unknown }>
    >(`SELECT key, value FROM "SiteSetting"`);
    for (const row of rows) {
      let v = row.value;
      if (typeof v === "string") {
        try {
          v = JSON.parse(v);
        } catch {
          /* keep string */
        }
      }
      merged[row.key] = v as unknown;
    }
  } catch {
    try {
      const rows = await prisma.siteSetting.findMany();
      for (const row of rows) {
        merged[row.key] = row.value as unknown;
      }
    } catch {
      /* tables may not exist */
    }
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
    const jsonValue = toJsonValue(value);
    try {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: jsonValue, group },
        create: { key, value: jsonValue, group },
      });
      results.push(key);
    } catch {
      const payload = JSON.stringify(jsonValue);
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "SiteSetting" ("id", "key", "value", "group", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2::jsonb, $3, NOW())
        ON CONFLICT ("key") DO UPDATE SET
          "value" = EXCLUDED."value",
          "group" = EXCLUDED."group",
          "updatedAt" = NOW()
        `,
        key,
        payload,
        group
      );
      results.push(key);
    }
  }

  try {
    revalidatePath("/");
    revalidatePath("/api/settings");
  } catch {
    /* ignore */
  }

  return results;
}
