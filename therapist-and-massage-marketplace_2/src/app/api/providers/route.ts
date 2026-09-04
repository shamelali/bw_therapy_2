import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { providers } from "@/db/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  const type = searchParams.get("type")?.trim();
  const includeInactive = searchParams.get("all") === "true";

  const conditions = [] as any[];
  if (!includeInactive) conditions.push(eq(providers.isActive, true));
  if (city && city !== "all") conditions.push(eq(providers.city, city));
  if (type && type !== "all") conditions.push(eq(providers.type, type as any));
  if (q) {
    conditions.push(or(ilike(providers.businessName, `%${q}%`), ilike(providers.description, `%${q}%`)));
  }

  const rows = await db
    .select()
    .from(providers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(providers.businessName));

  return NextResponse.json({ providers: rows });
}

const createSchema = z.object({
  businessName: z.string().min(2),
  type: z.enum(["therapist", "massage_center", "spa", "wellness_center", "chiropractor", "physiotherapy"]),
  city: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  imageUrl: z.string().optional(),
  priceFrom: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") {
    return NextResponse.json({ error: "Only providers can create a business profile" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const [row] = await db
    .insert(providers)
    .values({ ...parsed.data, userId: user.id, priceFrom: String(parsed.data.priceFrom ?? 0) })
    .returning();
  return NextResponse.json({ provider: row }, { status: 201 });
}
