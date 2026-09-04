import { db } from "@/db";
import { providers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProviderByUserId(userId: string) {
  const [row] = await db.select().from(providers).where(eq(providers.userId, userId)).limit(1);
  return row ?? null;
}

export async function getProviderById(id: string) {
  const [row] = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  return row ?? null;
}
