import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";
import { db } from "@/db";
import { availability } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AvailabilityManager } from "@/components/dashboard/availability-manager";
import { EmptyState } from "@/components/ui/primitives";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AvailabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "provider") redirect(localizedPath(locale, "/dashboard"));

  const provider = await getProviderByUserId(user.id);
  if (!provider) {
    return (
      <EmptyState
        title={dict.availabilityPage.needsProfileTitle}
        description={dict.availabilityPage.needsProfileDesc}
        action={
          <Link href={localizedPath(locale, "/dashboard/profile")} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            {dict.dashboardHome.completeProfile}
          </Link>
        }
      />
    );
  }

  const rows = await db.select().from(availability).where(eq(availability.providerId, provider.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{dict.availabilityPage.title}</h1>
        <p className="text-sm text-slate-500">{dict.availabilityPage.subtitle}</p>
      </div>
      <AvailabilityManager initialAvailability={rows} />
    </div>
  );
}
