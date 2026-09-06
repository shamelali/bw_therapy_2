import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "declined"]),
});

const CUSTOMER_ALLOWED = new Set(["cancelled"]);
const PROVIDER_ALLOWED = new Set(["confirmed", "declined", "completed", "cancelled"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { status } = parsed.data;

  if (user.role === "admin") {
    // allowed
  } else if (user.role === "customer") {
    if (booking.customerId !== user.id || !CUSTOMER_ALLOWED.has(status)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (user.role === "provider") {
    const provider = await getProviderByUserId(user.id);
    if (!provider || provider.id !== booking.providerId || !PROVIDER_ALLOWED.has(status)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();

  return NextResponse.json({ booking: updated });
}
