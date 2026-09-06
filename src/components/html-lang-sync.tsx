"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

/** Keeps the <html lang> attribute in sync with the active locale segment. */
export function HtmlLangSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
