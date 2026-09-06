import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().int().min(5).max(600).optional(),
  price: z.number().min(0).optional(),
  category: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

async function assertOwnership(serviceId: string, userId: string, role: string) {
  const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  if (!service) return { error: "Not found", status: 404 } as const;
  if (role === "admin") return { service } as const;
  const provider = await getProviderByUserId(userId);
  if (!provider || provider.id !== service.providerId) return { error: "Forbidden", status: 403 } as const;
  return { service } as const;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertOwnership(id, user.id, user.role);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { price, ...rest } = parsed.data;
  const [updated] = await db
    .update(services)
    .set({ ...rest, ...(price !== undefined ? { price: String(price) } : {}), updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();

  return NextResponse.json({ service: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertOwnership(id, user.id, user.role);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  await db.delete(services).where(eq(services.id, id));
  return NextResponse.json({ ok: true });
}
