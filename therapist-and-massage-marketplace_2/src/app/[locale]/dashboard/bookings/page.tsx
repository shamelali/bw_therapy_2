import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";
import { db } from "@/db";
import { bookings, providers, reviews, services, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { BookingsManager, type BookingRow } from "@/components/dashboard/bookings-manager";
import { EmptyState } from "@/components/ui/primitives";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function BookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const user = await getCurrentUser();
  if (!user) return null;

  const selection = {
    id: bookings.id,
    date: bookings.date,
    startTime: bookings.startTime,
    endTime: bookings.endTime,
    status: bookings.status,
    notes: bookings.notes,
    totalPrice: bookings.totalPrice,
    customerId: bookings.customerId,
    providerId: bookings.providerId,
    serviceId: bookings.serviceId,
    customerName: users.name,
    customerEmail: users.email,
    customerPhone: users.phone,
    providerName: providers.businessName,
    serviceName: services.name,
    serviceDuration: services.durationMinutes,
    reviewId: reviews.id,
  };

  const baseQuery = db
    .select(selection)
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.customerId))
    .innerJoin(providers, eq(providers.id, bookings.providerId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .orderBy(desc(bookings.date), desc(bookings.startTime));

  let rows: (typeof selection extends any ? any : never)[] = [];

  if (user.role === "admin") {
    rows = await baseQuery;
  } else if (user.role === "customer") {
    rows = await baseQuery.where(eq(bookings.customerId, user.id));
  } else {
    const provider = await getProviderByUserId(user.id);
    if (!provider) {
      return <EmptyState title={dict.bookingsPage.needsProfileTitle} description={dict.bookingsPage.needsProfileDesc} />;
    }
    rows = await baseQuery.where(eq(bookings.providerId, provider.id));
  }

  const bookingRows: BookingRow[] = rows.map((r) => ({ ...r, hasReview: Boolean(r.reviewId) }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{user.role === "customer" ? dict.bookingsPage.titleCustomer : dict.bookingsPage.titleOther}</h1>
        <p className="text-sm text-slate-500">
          {user.role === "provider"
            ? dict.bookingsPage.subtitleProvider
            : user.role === "admin"
            ? dict.bookingsPage.subtitleAdmin
            : dict.bookingsPage.subtitleCustomer}
        </p>
      </div>
      <BookingsManager role={user.role as any} initialBookings={bookingRows} />
    </div>
  );
}
