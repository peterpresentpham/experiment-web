import { NextRequest, NextResponse } from 'next/server';
import { LOCALE_COOKIE, LOCALES, resolveLocale } from 'src/i18n/config';

/**
 * Serves every page from `app/[lang]` without showing the locale in the URL: `/caro` is rewritten
 * to `/vi/caro` or `/en/caro`. The saved choice in the locale cookie wins; otherwise Vietnamese
 * browsers get Vietnamese and everyone else gets English.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (locale) => pathname == `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolveLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get('accept-language')
  );
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname == '/' ? '' : pathname}`;
  // Note: the App Router page runtime overwrites `Vary`, so a shared cache (CDN) in front of
  // this app must not cache page HTML by URL alone, or every visitor gets the first language.
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Pages only: skip Next internals, API routes, the signaling socket, metadata routes and
    // any path with a file extension (images, sounds, robots.txt, sitemap.xml...).
    '/((?!_next|api|socket\\.io|opengraph-image|icon|favicon|.*\\..*).*)',
  ],
};
