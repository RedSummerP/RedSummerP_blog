import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { profileBio } from "@db/schema";
import type { InsertProfileBio } from "@db/schema";

export async function getProfileBio() {
  const rows = await getDb()
    .select()
    .from(profileBio)
    .where(eq(profileBio.id, 1))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function upsertProfileBio(data: Partial<InsertProfileBio>) {
  const existing = await getProfileBio();
  const updateData = { ...data };
  if (data.badges !== undefined && typeof data.badges === "string") {
    try {
      JSON.parse(data.badges);
    } catch {
      delete updateData.badges;
    }
  }
  if (existing) {
    await getDb()
      .update(profileBio)
      .set(updateData)
      .where(eq(profileBio.id, 1));
  } else {
    await getDb()
      .insert(profileBio)
      .values({ ...updateData, id: 1, zhText: "", enText: "" });
  }
  return getProfileBio();
}

export async function addBadge(badge: { name: string; description: string; icon: string; x: number; y: number }) {
  const bio = await getProfileBio();
  let badges: any[] = [];
  if (bio?.badges) {
    try { badges = JSON.parse(bio.badges as string); } catch { badges = []; }
  }
  badges.push(badge);
  await upsertProfileBio({ badges: JSON.stringify(badges) } as any);
  return badges;
}

export async function updateBadge(index: number, data: Partial<{ name: string; description: string; icon: string; x: number; y: number }>) {
  const bio = await getProfileBio();
  let badges: any[] = [];
  if (bio?.badges) {
    try { badges = JSON.parse(bio.badges as string); } catch { badges = []; }
  }
  if (index >= 0 && index < badges.length) {
    badges[index] = { ...badges[index], ...data };
  }
  await upsertProfileBio({ badges: JSON.stringify(badges) } as any);
  return badges;
}

export async function deleteBadge(index: number) {
  const bio = await getProfileBio();
  let badges: any[] = [];
  if (bio?.badges) {
    try { badges = JSON.parse(bio.badges as string); } catch { badges = []; }
  }
  if (index >= 0 && index < badges.length) {
    badges.splice(index, 1);
  }
  await upsertProfileBio({ badges: JSON.stringify(badges) } as any);
  return badges;
}
