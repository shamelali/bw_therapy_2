"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Sparkles,
  ListChecks,
  Clock4,
  UserCog,
  Building2,
  Users,
  Store,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function buildNav(dict: Dictionary): Record<string, NavItem[]> {
  return {
    customer: [
      { href: "/dashboard", label: dict.sidebar.overview, icon: LayoutDashboard },
      { href: "/dashboard/bookings", label: dict.sidebar.myBookings, icon: CalendarCheck },
      { href: "/", label: dict.sidebar.browseProviders, icon: Store },
      { href: "/dashboard/profile", label: dict.sidebar.myProfile, icon: UserCog },
    ],
    provider: [
      { href: "/dashboard", label: dict.sidebar.overview, icon: LayoutDashboard },
      { href: "/dashboard/bookings", label: dict.sidebar.bookings, icon: CalendarCheck },
      { href: "/dashboard/services", label: dict.sidebar.services, icon: ListChecks },
      { href: "/dashboard/availability", label: dict.sidebar.availability, icon: Clock4 },
      { href: "/dashboard/profile", label: dict.sidebar.businessProfile, icon: Building2 },
    ],
    admin: [
      { href: "/dashboard", label: dict.sidebar.overview, icon: LayoutDashboard },
      { href: "/dashboard/bookings", label: dict.sidebar.allBookings, icon: CalendarCheck },
      { href: "/dashboard/providers", label: dict.sidebar.providers, icon: Building2 },
      { href: "/dashboard/users", label: dict.sidebar.users, icon: Users },
    ],
  };
}

function stripLocale(pathname: string, locale: Locale) {
  if (locale === "en") return pathname;
  if (pathname === `/${locale}`) return "/";
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  return pathname;
}

export function SidebarContent({ role, name, locale, dict }: { role: string; name: string; locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() || "/";
  const bare = stripLocale(pathname, locale);
  const items = buildNav(dict)[role] ?? buildNav(dict).customer;

  return (
    <div className="flex h-full flex-col">
      <Link href={localizedPath(locale, "/")} className="flex items-center gap-2 px-5 py-5 text-lg font-bold text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        {dict.common.brand}
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = bare === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={localizedPath(locale, item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <div className="mb-3">
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{name}</p>
            <p className="truncate text-xs capitalize text-slate-400">{role}</p>
          </div>
        </div>
        <LogoutButton className="w-full justify-center border border-slate-200" locale={locale} label={dict.nav.signOut} />
      </div>
    </div>
  );
}

export function MobileSidebar({
  role,
  name,
  locale,
  dict,
  open,
  onClose,
}: {
  role: string;
  name: string;
  locale: Locale;
  dict: Dictionary;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
        <button onClick={onClose} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <SidebarContent role={role} name={name} locale={locale} dict={dict} />
      </div>
    </div>
  );
}
