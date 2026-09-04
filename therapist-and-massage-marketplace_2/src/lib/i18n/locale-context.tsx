"use client";

import Link from "next/link";
import { createContext, useContext, type AnchorHTMLAttributes, type ReactNode } from "react";
import type { Locale } from "./config";
import { localizedPath } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { format } from "./get-dictionary";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx.locale;
}

export function useDictionary() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useDictionary must be used within LocaleProvider");
  return ctx.dict;
}

export { format };

/** Builds an href for the current locale, e.g. /providers/1 -> /ms/providers/1 */
export function useLocalizedHref() {
  const locale = useLocale();
  return (path: string) => localizedPath(locale, path);
}

/**
 * Drop-in replacement for next/link's <Link> that automatically prefixes
 * the href with the current locale segment (when not the default locale).
 */
export function LocaleLink({
  href,
  children,
  ...props
}: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const locale = useLocale();
  return (
    <Link href={localizedPath(locale, href)} {...props}>
      {children}
    </Link>
  );
}
