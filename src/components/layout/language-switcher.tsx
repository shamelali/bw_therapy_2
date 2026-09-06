"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function stripLocale(pathname: string) {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

function hrefFor(pathname: string, locale: Locale) {
  const bare = stripLocale(pathname) || "/";
  if (locale === defaultLocale) return bare;
  return `/${locale}${bare === "/" ? "" : bare}`;
}

const LABELS: Record<Locale, string> = { en: "EN", ms: "BM" };

export function LanguageSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const pathname = usePathname() || "/";

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1", compact && "border-slate-700 bg-slate-800")}>
      <Languages className={cn("ml-1 h-3.5 w-3.5", compact ? "text-slate-400" : "text-slate-400")} />
      {locales.map((l) => (
        <Link
          key={l}
          href={hrefFor(pathname, l)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold transition",
            l === locale
              ? compact
                ? "bg-teal-600 text-white"
                : "bg-teal-600 text-white"
              : compact
              ? "text-slate-300 hover:bg-slate-700"
              : "text-slate-500 hover:bg-slate-100",
          )}
        >
          {LABELS[l]}
        </Link>
      ))}
    </div>
  );
}
