import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { availability } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db.select().from(availability).where(eq(availability.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role !== "admin") {
    const provider = await getProviderByUserId(user.id);
    if (!provider || provider.id !== row.providerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await db.delete(availability).where(eq(availability.id, id));
  return NextResponse.json({ ok: true });
}
