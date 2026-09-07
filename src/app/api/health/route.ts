import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Check if DATABASE_URL is set to determine mode
  const hasDatabase = !!process.env.DATABASE_URL;
  
  if (!hasDatabase) {
    // Demo mode — no external DB connection needed
    return Response.json({ ok: true, mode: "demo" });
  }
  
  try {
    await sql`select 1`;
    return Response.json({ ok: true, mode: "postgres" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
