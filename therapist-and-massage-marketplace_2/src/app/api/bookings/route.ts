import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bookings, providers, services, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";
import { addMinutesToTime } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseSelect = {
    id: bookings.id,
    date: bookings.date,
    startTime: bookings.startTime,
    endTime: bookings.endTime,
    status: bookings.status,
    notes: bookings.notes,
    totalPrice: bookings.totalPrice,
    createdAt: bookings.createdAt,
    updatedAt: bookings.updatedAt,
    customerId: bookings.customerId,
    providerId: bookings.providerId,
    serviceId: bookings.serviceId,
    customerName: users.name,
    customerEmail: users.email,
    customerPhone: users.phone,
    providerName: providers.businessName,
    serviceName: services.name,
    serviceDuration: services.durationMinutes,
  };

  const query = db
    .select(baseSelect)
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.customerId))
    .innerJoin(providers, eq(providers.id, bookings.providerId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .orderBy(desc(bookings.date), desc(bookings.startTime));

  if (user.role === "admin") {
    const rows = await query;
    return NextResponse.json({ bookings: rows });
  }

  if (user.role === "customer") {
    const rows = await query.where(eq(bookings.customerId, user.id));
    return NextResponse.json({ bookings: rows });
  }

  const provider = await getProviderByUserId(user.id);
  if (!provider) return NextResponse.json({ bookings: [] });
  const rows = await query.where(eq(bookings.providerId, provider.id));
  return NextResponse.json({ bookings: rows });
}

const createSchema = z.object({
  providerId: z.string(),
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "customer") {
    return NextResponse.json({ error: "Only customers can book appointments" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, parsed.data.serviceId), eq(services.providerId, parsed.data.providerId)))
    .limit(1);

  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const endTime = addMinutesToTime(parsed.data.startTime, service.durationMinutes);

  const conflicting = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.providerId, parsed.data.providerId),
        eq(bookings.date, parsed.data.date),
        eq(bookings.startTime, parsed.data.startTime),
      ),
    );
  const activeConflict = conflicting.find((b) => b.status !== "cancelled" && b.status !== "declined");
  if (activeConflict) {
    return NextResponse.json({ error: "This time slot was just booked. Please choose another." }, { status: 409 });
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: user.id,
      providerId: parsed.data.providerId,
      serviceId: parsed.data.serviceId,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime,
      notes: parsed.data.notes,
      totalPrice: service.price,
      status: "pending",
    })
    .returning();

  return NextResponse.json({ booking }, { status: 201 });
}
