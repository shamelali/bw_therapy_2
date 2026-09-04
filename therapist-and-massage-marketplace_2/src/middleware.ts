import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

function hasLocalePrefix(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  // Default locale (English) is served without a URL prefix; rewrite
  // internally so the [locale] route segment still resolves to "en".
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
