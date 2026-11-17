export const LOCALES = ['en', 'vi'] as const;
export type TLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: TLocale = 'en';

/** Cookie that stores an explicit language choice; it wins over the browser language. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is TLocale {
  return typeof value == 'string' && (LOCALES as ReadonlyArray<string>).includes(value);
}

/**
 * Picks the locale from an Accept-Language header: Vietnamese when the browser's most preferred
 * language is Vietnamese, English for everything else.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): TLocale {
  if (!header) return DEFAULT_LOCALE;
  const preferred = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const quality = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      const q = quality ? Number(quality.slice(2)) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 0, index };
    })
    .filter(({ tag, q }) => tag.length > 0 && tag != '*' && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)[0];
  return preferred && (preferred.tag == 'vi' || preferred.tag.startsWith('vi-')) ? 'vi' : 'en';
}

/** Cookie first, then the browser language. */
export function resolveLocale(cookie: string | undefined, acceptLanguage: string | null) {
  return isLocale(cookie) ? cookie : localeFromAcceptLanguage(acceptLanguage);
}
