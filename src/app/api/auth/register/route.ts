import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { providers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "provider"]),
  businessName: z.string().min(2).optional(),
  providerType: z
    .enum(["therapist", "massage_center", "spa", "wellness_center", "chiropractor", "physiotherapy"])
    .optional(),
  city: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, email, password, role, businessName, providerType, city } = parsed.data;

  if (role === "provider" && (!businessName || !city)) {
    return NextResponse.json({ error: "Business name and city are required for providers" }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ name, email: email.toLowerCase(), passwordHash, role })
    .returning();

  if (role === "provider") {
    await db.insert(providers).values({
      userId: user.id,
      businessName: businessName!,
      type: providerType ?? "therapist",
      city: city!,
      email: email.toLowerCase(),
      description: `${businessName} is newly listed on Serenity. Update your profile to tell customers more.`,
    });
  }

  await setSessionCookie({ userId: user.id, role: user.role, email: user.email, name: user.name });

  return NextResponse.json({ ok: true, role: user.role });
}
