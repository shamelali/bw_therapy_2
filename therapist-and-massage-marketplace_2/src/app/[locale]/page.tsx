import { db } from "@/db";
import { providers } from "@/db/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { SearchFilters } from "@/components/marketplace/search-filters";
import { ProviderCard } from "@/components/marketplace/provider-card";
import { EmptyState } from "@/components/ui/primitives";
import { Search, ShieldCheck, CalendarCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary, format } from "@/lib/i18n/get-dictionary";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; city?: string; type?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const searchParamsResolved = await searchParams;

  const conditions = [eq(providers.isActive, true)];
  if (searchParamsResolved.city && searchParamsResolved.city !== "all") conditions.push(eq(providers.city, searchParamsResolved.city));
  if (searchParamsResolved.type && searchParamsResolved.type !== "all") conditions.push(eq(providers.type, searchParamsResolved.type as any));
  if (searchParamsResolved.q) {
    conditions.push(
      or(ilike(providers.businessName, `%${searchParamsResolved.q}%`), ilike(providers.description, `%${searchParamsResolved.q}%`))!,
    );
  }

  const [rows, cityRows] = await Promise.all([
    db
      .select()
      .from(providers)
      .where(and(...conditions))
      .orderBy(asc(providers.businessName)),
    db.selectDistinct({ city: providers.city }).from(providers).orderBy(asc(providers.city)),
  ]);

  const hasFilters = Boolean(
    searchParamsResolved.q || (searchParamsResolved.city && searchParamsResolved.city !== "all") || (searchParamsResolved.type && searchParamsResolved.type !== "all"),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar locale={locale} />

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-teal-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
              <Sparkles className="h-3.5 w-3.5" /> {dict.home.badge}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{dict.home.title}</h1>
            <p className="mt-4 text-lg text-slate-600">{dict.home.subtitle}</p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <SearchFilters cities={cityRows.map((c) => c.city)} />
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3" id="how-it-works">
            <div className="flex items-start gap-3 rounded-xl bg-white/70 p-4">
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{dict.home.stepDiscoverTitle}</p>
                <p className="text-xs text-slate-500">{dict.home.stepDiscoverDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/70 p-4">
              <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{dict.home.stepBookTitle}</p>
                <p className="text-xs text-slate-500">{dict.home.stepBookDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/70 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{dict.home.stepRelaxTitle}</p>
                <p className="text-xs text-slate-500">{dict.home.stepRelaxDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {hasFilters
              ? rows.length === 1
                ? dict.home.resultOne
                : format(dict.home.resultMany, { count: rows.length })
              : dict.home.popularProviders}
          </h2>
          {hasFilters && (
            <Link href={localizedPath(locale, "/")} className="text-sm font-medium text-teal-700 hover:underline">
              {dict.home.clearFilters}
            </Link>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<Search className="h-6 w-6" />} title={dict.home.noProvidersTitle} description={dict.home.noProvidersDesc} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} locale={locale} dict={dict} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {dict.home.footer}
      </footer>
    </div>
  );
}
