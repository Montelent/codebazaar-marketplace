import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, type SiteSettingsMap } from "@/lib/default-settings";

export async function getAllSettings(): Promise<SiteSettingsMap> {
  const merged = { ...DEFAULT_SETTINGS };
  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) {
      merged[row.key] = row.value as unknown;
    }
  } catch {
    // tables may not exist yet
  }
  return merged;
}

export async function setSettings(entries: Record<string, unknown>) {
  const results = [];
  for (const [key, value] of Object.entries(entries)) {
    const group = key.split(".")[0] ?? "general";
    const row = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as object, group },
      create: { key, value: value as object, group },
    });
    results.push(row);
  }
  return results;
}
