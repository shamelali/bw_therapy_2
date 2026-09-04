import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const user = await getCurrentUser();
  if (!user) redirect(localizedPath(locale, "/login"));

  const dict = getDictionary(locale);

  return (
    <DashboardShell role={user.role} name={user.name} avatarUrl={user.avatarUrl} locale={locale} dict={dict}>
      {children}
    </DashboardShell>
  );
}
