import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { availability } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId is required" }, { status: 400 });
  const rows = await db.select().from(availability).where(eq(availability.providerId, providerId));
  return NextResponse.json({ availability: rows });
}

const createSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") {
    return NextResponse.json({ error: "Only providers can manage availability" }, { status: 403 });
  }
  const provider = await getProviderByUserId(user.id);
  if (!provider) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (parsed.data.startTime >= parsed.data.endTime) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  const [row] = await db
    .insert(availability)
    .values({ providerId: provider.id, ...parsed.data })
    .returning();

  return NextResponse.json({ availability: row }, { status: 201 });
}
