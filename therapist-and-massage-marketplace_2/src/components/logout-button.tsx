"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { localizedPath, type Locale } from "@/lib/i18n/config";

export function LogoutButton({
  className,
  iconOnly = false,
  locale,
  label = "Sign out",
}: {
  className?: string;
  iconOnly?: boolean;
  locale: Locale;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(localizedPath(locale, "/"));
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-rose-600 disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      {!iconOnly && label}
    </button>
  );
}
