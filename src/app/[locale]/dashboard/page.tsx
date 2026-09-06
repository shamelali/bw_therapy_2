import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";
import { db } from "@/db";
import { bookings, providers, services, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, EmptyState, Badge } from "@/components/ui/primitives";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { CalendarCheck, Clock, DollarSign, Users as UsersIcon, Building2, ListChecks, ArrowRight } from "lucide-react";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary, format } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}

function statusVariant(status: string) {
  switch (status) {
    case "confirmed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "completed":
      return "info" as const;
    case "cancelled":
    case "declined":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export default async function DashboardOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict: Dictionary = getDictionary(locale);
  const p = (path: string) => localizedPath(locale, path);

  const user = await getCurrentUser();
  if (!user) return null;

  const baseSelect = {
    id: bookings.id,
    date: bookings.date,
    startTime: bookings.startTime,
    status: bookings.status,
    totalPrice: bookings.totalPrice,
    providerName: providers.businessName,
    serviceName: services.name,
    customerName: users.name,
  };

  if (user.role === "admin") {
    const [allBookings, allProviders, allUsers] = await Promise.all([
      db
        .select(baseSelect)
        .from(bookings)
        .innerJoin(providers, eq(providers.id, bookings.providerId))
        .innerJoin(services, eq(services.id, bookings.serviceId))
        .innerJoin(users, eq(users.id, bookings.customerId))
        .orderBy(desc(bookings.createdAt))
        .limit(8),
      db.select().from(providers),
      db.select().from(users),
    ]);

    const totalBookingsCount = allBookings.length;
    const pending = allBookings.filter((b) => b.status === "pending").length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{dict.dashboardHome.adminTitle}</h1>
          <p className="text-sm text-slate-500">{dict.dashboardHome.adminSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={dict.dashboardHome.statProviders} value={String(allProviders.length)} icon={Building2} accent="bg-teal-100 text-teal-700" />
          <StatCard label={dict.dashboardHome.statUsers} value={String(allUsers.length)} icon={UsersIcon} accent="bg-sky-100 text-sky-700" />
          <StatCard label={dict.dashboardHome.statRecentBookings} value={String(totalBookingsCount)} icon={CalendarCheck} accent="bg-violet-100 text-violet-700" />
          <StatCard label={dict.dashboardHome.statPending} value={String(pending)} icon={Clock} accent="bg-amber-100 text-amber-700" />
        </div>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{dict.dashboardHome.recentBookingsTitle}</h2>
            <Link href={p("/dashboard/bookings")} className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
              {dict.dashboardHome.viewAll} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {allBookings.length === 0 ? (
            <EmptyState title={dict.dashboardHome.noBookingsYet} />
          ) : (
            <div className="divide-y divide-slate-100">
              {allBookings.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">
                      {b.customerName} → {b.providerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.serviceName} · {formatDate(b.date)} at {formatTime(b.startTime)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(b.status)}>{dict.bookingStatus[b.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (user.role === "provider") {
    const provider = await getProviderByUserId(user.id);
    if (!provider) {
      return (
        <EmptyState
          title={dict.dashboardHome.setupTitle}
          description={dict.dashboardHome.setupDesc}
          action={
            <Link href={p("/dashboard/profile")} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              {dict.dashboardHome.completeProfile}
            </Link>
          }
        />
      );
    }

    const [allBookings, myServices] = await Promise.all([
      db
        .select(baseSelect)
        .from(bookings)
        .innerJoin(providers, eq(providers.id, bookings.providerId))
        .innerJoin(services, eq(services.id, bookings.serviceId))
        .innerJoin(users, eq(users.id, bookings.customerId))
        .where(eq(bookings.providerId, provider.id))
        .orderBy(desc(bookings.createdAt)),
      db.select().from(services).where(eq(services.providerId, provider.id)),
    ]);

    const pending = allBookings.filter((b) => b.status === "pending");
    const today = new Date().toISOString().slice(0, 10);
    const todaysBookings = allBookings.filter((b) => b.date === today && b.status === "confirmed");
    const revenue = allBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{format(dict.dashboardHome.providerWelcome, { name: user.name.split(" ")[0] })}</h1>
          <p className="text-sm text-slate-500">{format(dict.dashboardHome.providerSubtitle, { business: provider.businessName })}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={dict.dashboardHome.statPendingRequests} value={String(pending.length)} icon={Clock} accent="bg-amber-100 text-amber-700" />
          <StatCard label={dict.dashboardHome.statTodaysAppointments} value={String(todaysBookings.length)} icon={CalendarCheck} accent="bg-teal-100 text-teal-700" />
          <StatCard label={dict.dashboardHome.statActiveServices} value={String(myServices.filter((s) => s.isActive).length)} icon={ListChecks} accent="bg-sky-100 text-sky-700" />
          <StatCard label={dict.dashboardHome.statRevenue} value={formatCurrency(revenue)} icon={DollarSign} accent="bg-emerald-100 text-emerald-700" />
        </div>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{dict.dashboardHome.pendingRequestsTitle}</h2>
            <Link href={p("/dashboard/bookings")} className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
              {dict.dashboardHome.manageAll} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState title={dict.dashboardHome.caughtUpTitle} description={dict.dashboardHome.caughtUpDesc} />
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.slice(0, 6).map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{b.customerName}</p>
                    <p className="text-xs text-slate-500">
                      {b.serviceName} · {formatDate(b.date)} at {formatTime(b.startTime)}
                    </p>
                  </div>
                  <Badge variant="warning">{dict.bookingStatus.pending}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // customer
  const myBookings = await db
    .select(baseSelect)
    .from(bookings)
    .innerJoin(providers, eq(providers.id, bookings.providerId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(users, eq(users.id, bookings.customerId))
    .where(eq(bookings.customerId, user.id))
    .orderBy(desc(bookings.createdAt));

  const upcoming = myBookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const completed = myBookings.filter((b) => b.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{format(dict.dashboardHome.customerWelcome, { name: user.name.split(" ")[0] })}</h1>
        <p className="text-sm text-slate-500">{dict.dashboardHome.customerSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={dict.dashboardHome.statUpcoming} value={String(upcoming.length)} icon={CalendarCheck} accent="bg-teal-100 text-teal-700" />
        <StatCard label={dict.dashboardHome.statCompletedVisits} value={String(completed.length)} icon={ListChecks} accent="bg-sky-100 text-sky-700" />
        <StatCard label={dict.dashboardHome.statTotalSpent} value={formatCurrency(completed.reduce((s, b) => s + Number(b.totalPrice), 0))} icon={DollarSign} accent="bg-emerald-100 text-emerald-700" />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{dict.dashboardHome.upcomingTitle}</h2>
          <Link href={p("/dashboard/bookings")} className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
            {dict.dashboardHome.viewAll} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title={dict.dashboardHome.noUpcomingTitle}
            description={dict.dashboardHome.noUpcomingDesc}
            action={
              <Link href={p("/")} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                {dict.dashboardHome.exploreProviders}
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.slice(0, 6).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{b.providerName}</p>
                  <p className="text-xs text-slate-500">
                    {b.serviceName} · {formatDate(b.date)} at {formatTime(b.startTime)}
                  </p>
                </div>
                <Badge variant={statusVariant(b.status)}>{dict.bookingStatus[b.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
