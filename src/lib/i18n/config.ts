export const locales = ["en", "ms"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Builds a path prefixed with the locale segment when the locale is not the
 * default one. The default locale ("en") is served without a URL prefix,
 * while other locales (e.g. "ms") are served under /ms/...
 */
export function localizedPath(locale: string, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  return `/${locale}${normalized === "/" ? "" : normalized}` || `/${locale}`;
}
