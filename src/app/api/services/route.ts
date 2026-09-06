import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId is required" }, { status: 400 });
  const rows = await db.select().from(services).where(eq(services.providerId, providerId));
  return NextResponse.json({ services: rows });
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(600),
  price: z.number().min(0),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") {
    return NextResponse.json({ error: "Only providers can create services" }, { status: 403 });
  }
  const provider = await getProviderByUserId(user.id);
  if (!provider) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [row] = await db
    .insert(services)
    .values({
      providerId: provider.id,
      name: parsed.data.name,
      description: parsed.data.description,
      durationMinutes: parsed.data.durationMinutes,
      price: String(parsed.data.price),
      category: parsed.data.category,
      imageUrl: parsed.data.imageUrl,
    })
    .returning();

  return NextResponse.json({ service: row }, { status: 201 });
}
