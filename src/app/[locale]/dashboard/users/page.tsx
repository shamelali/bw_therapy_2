import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { AdminUsersManager } from "@/components/dashboard/admin-users-manager";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "admin") redirect(localizedPath(locale, "/dashboard"));

  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
    .from(users)
    .orderBy(asc(users.name));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{dict.adminUsersPage.title}</h1>
        <p className="text-sm text-slate-500">{dict.adminUsersPage.subtitle}</p>
      </div>
      <AdminUsersManager
        initialUsers={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        currentUserId={user.id}
      />
    </div>
  );
}
