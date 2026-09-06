import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { availability, bookings, services } from "@/db/schema";
import { and, eq, ne, notInArray } from "drizzle-orm";
import { addMinutesToTime, timeToMinutes } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json({ error: "date and serviceId are required" }, { status: 400 });
  }

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.providerId, id)))
    .limit(1);
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const windows = await db
    .select()
    .from(availability)
    .where(and(eq(availability.providerId, id), eq(availability.dayOfWeek, dayOfWeek), eq(availability.isActive, true)));

  if (windows.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  const existingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.providerId, id),
        eq(bookings.date, date),
        notInArray(bookings.status, ["cancelled", "declined"]),
      ),
    );

  const isToday = date === new Date().toISOString().slice(0, 10);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const STEP = 30;
  const slots = new Set<string>();

  for (const window of windows) {
    let cursor = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    while (cursor + service.durationMinutes <= windowEnd) {
      const startTime = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
      const endTime = addMinutesToTime(startTime, service.durationMinutes);
      const overlaps = existingBookings.some((b) => {
        return startTime < b.endTime && b.startTime < endTime;
      });
      const isPast = isToday && cursor <= nowMinutes;
      if (!overlaps && !isPast) {
        slots.add(startTime);
      }
      cursor += STEP;
    }
  }

  return NextResponse.json({ slots: Array.from(slots).sort() });
}
