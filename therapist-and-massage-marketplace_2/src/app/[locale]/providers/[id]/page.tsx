import { notFound } from "next/navigation";
import { db } from "@/db";
import { availability, providers, reviews, services, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { BookingWidget } from "@/components/marketplace/booking-widget";
import { StaticStars } from "@/components/ui/star-rating";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDuration, formatTime, initials } from "@/lib/utils";
import { MapPin, Phone, Mail, MessageSquareText } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function ProviderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: rawLocale, id } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const [provider] = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (!provider) notFound();

  const [serviceRows, availabilityRows, reviewRows, currentUser] = await Promise.all([
    db.select().from(services).where(eq(services.providerId, id)),
    db.select().from(availability).where(eq(availability.providerId, id)),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customerName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.customerId))
      .where(eq(reviews.providerId, id))
      .orderBy(desc(reviews.createdAt)),
    getCurrentUser(),
  ]);

  const activeAvailability = availabilityRows
    .filter((a) => a.isActive)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PublicNavbar locale={locale} />

      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-white/15 text-white">{dict.providerTypes[provider.type]}</Badge>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{provider.businessName}</h1>
              <p className="mt-2 max-w-2xl text-teal-50">{provider.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-teal-50">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {provider.address ? `${provider.address}, ` : ""}
                  {provider.city}
                </span>
                {provider.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> {provider.phone}
                  </span>
                )}
                {provider.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> {provider.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
              <StaticStars value={Number(provider.rating)} />
              <span className="font-semibold">{Number(provider.rating).toFixed(1)}</span>
              <span className="text-sm text-teal-100">({provider.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">{dict.providerDetail.about}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{provider.description || dict.providerDetail.aboutFallback}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">{dict.providerDetail.services}</h2>
            {serviceRows.filter((s) => s.isActive).length === 0 ? (
              <div className="mt-3">
                <EmptyState title={dict.providerDetail.noServicesTitle} description={dict.providerDetail.noServicesDesc} />
              </div>
            ) : (
              <div className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {serviceRows
                  .filter((s) => s.isActive)
                  .map((service) => (
                    <div key={service.id} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="font-medium text-slate-900">{service.name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{service.description}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                          <Badge variant="neutral">{service.category}</Badge>
                          <span>{formatDuration(service.durationMinutes)}</span>
                        </div>
                      </div>
                      <p className="shrink-0 font-semibold text-slate-900">{formatCurrency(service.price)}</p>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">{dict.providerDetail.weeklyAvailability}</h2>
            {activeAvailability.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{dict.providerDetail.noAvailability}</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activeAvailability.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <p className="font-medium text-slate-800">{dict.days[a.dayOfWeek as keyof typeof dict.days]}</p>
                    <p className="text-xs text-slate-500">
                      {formatTime(a.startTime)} – {formatTime(a.endTime)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <MessageSquareText className="h-5 w-5" /> {dict.providerDetail.reviews} ({reviewRows.length})
            </h2>
            {reviewRows.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{dict.providerDetail.noReviews}</p>
            ) : (
              <div className="mt-3 space-y-3">
                {reviewRows.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                          {initials(r.customerName)}
                        </span>
                        <p className="text-sm font-medium text-slate-800">{r.customerName}</p>
                      </div>
                      <StaticStars value={r.rating} size={14} />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div>
          <BookingWidget providerId={provider.id} services={serviceRows} currentUserRole={currentUser?.role ?? null} />
        </div>
      </div>
    </div>
  );
}
