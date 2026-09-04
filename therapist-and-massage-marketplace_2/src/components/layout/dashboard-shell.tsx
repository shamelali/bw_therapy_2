"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { SidebarContent, MobileSidebar } from "@/components/layout/sidebar";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function DashboardShell({
  role,
  name,
  locale,
  dict,
  children,
}: {
  role: string;
  name: string;
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="fixed h-screen w-64">
          <SidebarContent role={role} name={name} locale={locale} dict={dict} />
        </div>
      </aside>

      <MobileSidebar role={role} name={name} locale={locale} dict={dict} open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-900">{dict.dashboardShell.header}</span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
