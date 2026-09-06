import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Sparkles, LayoutDashboard } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export async function PublicNavbar({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();
  const dict = getDictionary(locale);
  const p = (path: string) => localizedPath(locale, path);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href={p("/")} className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          {dict.common.brand}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href={p("/")} className="hover:text-slate-900">
            {dict.nav.explore}
          </Link>
          <Link href={p("/#how-it-works")} className="hover:text-slate-900">
            {dict.nav.howItWorks}
          </Link>
          <Link href={p("/register?role=provider")} className="hover:text-slate-900">
            {dict.nav.listBusiness}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link
                href={p("/dashboard")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{dict.nav.dashboard}</span>
              </Link>
              <LogoutButton locale={locale} label={dict.nav.signOut} />
            </>
          ) : (
            <>
              <Link href={p("/login")} className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                {dict.nav.signIn}
              </Link>
              <Link
                href={p("/register")}
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
              >
                {dict.nav.getStarted}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
