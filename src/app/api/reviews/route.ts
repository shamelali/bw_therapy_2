import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bookings, providers, reviews } from "@/db/schema";
import { avg, count, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") {
    return NextResponse.json({ error: "Only customers can leave reviews" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, parsed.data.bookingId)).limit(1);
  if (!booking || booking.customerId !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json({ error: "You can only review completed appointments" }, { status: 400 });
  }

  const existing = await db.select().from(reviews).where(eq(reviews.bookingId, booking.id)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "You already reviewed this appointment" }, { status: 409 });
  }

  const [review] = await db
    .insert(reviews)
    .values({
      bookingId: booking.id,
      providerId: booking.providerId,
      customerId: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    })
    .returning();

  const [agg] = await db
    .select({ avgRating: avg(reviews.rating), total: count(reviews.id) })
    .from(reviews)
    .where(eq(reviews.providerId, booking.providerId));

  await db
    .update(providers)
    .set({ rating: agg.avgRating ?? "0", reviewCount: Number(agg.total ?? 0) })
    .where(eq(providers.id, booking.providerId));

  return NextResponse.json({ review }, { status: 201 });
}
