import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { providers, services, availability, reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [provider] = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [serviceRows, availabilityRows, reviewRows] = await Promise.all([
    db.select().from(services).where(eq(services.providerId, id)),
    db.select().from(availability).where(eq(availability.providerId, id)),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customerName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.customerId))
      .where(eq(reviews.providerId, id))
      .orderBy(desc(reviews.createdAt)),
  ]);

  return NextResponse.json({ provider, services: serviceRows, availability: availabilityRows, reviews: reviewRows });
}

const updateSchema = z.object({
  businessName: z.string().min(2).optional(),
  type: z.enum(["therapist", "massage_center", "spa", "wellness_center", "chiropractor", "physiotherapy"]).optional(),
  city: z.string().min(1).optional(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  priceFrom: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [provider] = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && provider.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { priceFrom, ...rest } = parsed.data;
  const [updated] = await db
    .update(providers)
    .set({ ...rest, ...(priceFrom !== undefined ? { priceFrom: String(priceFrom) } : {}), updatedAt: new Date() })
    .where(eq(providers.id, id))
    .returning();

  return NextResponse.json({ provider: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [provider] = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && provider.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.delete(providers).where(eq(providers.id, id));
  return NextResponse.json({ ok: true });
}
