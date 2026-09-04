import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ServicesManager } from "@/components/dashboard/services-manager";
import { EmptyState } from "@/components/ui/primitives";
import Link from "next/link";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary, format } from "@/lib/i18n/get-dictionary";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
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
        title={dict.servicesPage.needsProfileTitle}
        description={dict.servicesPage.needsProfileDesc}
        action={
          <Link href={localizedPath(locale, "/dashboard/profile")} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            {dict.dashboardHome.completeProfile}
          </Link>
        }
      />
    );
  }

  const rows = await db.select().from(services).where(eq(services.providerId, provider.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{dict.servicesPage.title}</h1>
        <p className="text-sm text-slate-500">{format(dict.servicesPage.subtitle, { business: provider.businessName })}</p>
      </div>
      <ServicesManager initialServices={rows} />
    </div>
  );
}
