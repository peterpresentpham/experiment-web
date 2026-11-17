import { NextRequest } from 'next/server';
import { localeFromAcceptLanguage, LOCALES, resolveLocale } from 'src/i18n/config';
import { TLocalized } from 'src/i18n/define';
import { blogMessages } from 'src/i18n/messages/blog';
import { caroMessages } from 'src/i18n/messages/caro';
import { commonMessages } from 'src/i18n/messages/common';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';
import { pikachuMessages } from 'src/i18n/messages/pikachu';
import { processMessages } from 'src/i18n/messages/process';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { proxy } from 'src/proxy';
import { describe, expect, it } from 'vitest';

describe('localeFromAcceptLanguage', () => {
  it.each([
    ['vi', 'vi'],
    ['vi-VN', 'vi'],
    ['VI-vn,vi;q=0.9,en;q=0.8', 'vi'],
    ['en-US,en;q=0.9,vi;q=0.8', 'en'],
    ['en;q=0.5, vi;q=0.9', 'vi'],
    ['fr-FR,fr;q=0.9', 'en'],
    ['vie', 'en'],
    ['*', 'en'],
    ['vi;q=0, en', 'en'],
    ['', 'en'],
  ])('%j -> %s', (header, expected) => {
    expect(localeFromAcceptLanguage(header)).toBe(expected);
  });

  it('falls back to English without a header', () => {
    expect(localeFromAcceptLanguage(null)).toBe('en');
    expect(localeFromAcceptLanguage(undefined)).toBe('en');
  });
});

describe('resolveLocale', () => {
  it('prefers a valid cookie over the browser language', () => {
    expect(resolveLocale('en', 'vi-VN')).toBe('en');
    expect(resolveLocale('vi', 'en-US')).toBe('vi');
  });

  it('ignores an unknown cookie value', () => {
    expect(resolveLocale('fr', 'vi-VN')).toBe('vi');
    expect(resolveLocale('', 'en-US')).toBe('en');
  });
});

describe('proxy', () => {
  function rewriteOf(path: string, headers: Record<string, string> = {}) {
    const response = proxy(new NextRequest(`https://example.com${path}`, { headers }));
    return { rewrite: response.headers.get('x-middleware-rewrite') };
  }

  it('rewrites to the browser language without changing the URL', () => {
    expect(rewriteOf('/caro', { 'accept-language': 'vi-VN' }).rewrite).toBe(
      'https://example.com/vi/caro'
    );
    expect(rewriteOf('/', { 'accept-language': 'de' }).rewrite).toBe('https://example.com/en');
    expect(rewriteOf('/blog/rubik3x3?level=advanced').rewrite).toBe(
      'https://example.com/en/blog/rubik3x3?level=advanced'
    );
  });

  it('uses the saved cookie over the browser language', () => {
    const result = rewriteOf('/pikachu', {
      'accept-language': 'vi',
      cookie: 'NEXT_LOCALE=en',
    });
    expect(result.rewrite).toBe('https://example.com/en/pikachu');
  });

  it('leaves paths that already carry a locale alone', () => {
    expect(rewriteOf('/vi/caro', { 'accept-language': 'en' }).rewrite).toBeNull();
    expect(rewriteOf('/en').rewrite).toBeNull();
  });
});

/** Keys of every nested object, so a missing translation shows up as a different key list. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (typeof value == 'function') return 'fn';
  if (value && typeof value == 'object' && !('$$typeof' in value))
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape((value as Record<string, unknown>)[key])])
    );
  return typeof value;
}

function emptyStrings(value: unknown, path = ''): Array<string> {
  if (typeof value == 'string') return value.trim() ? [] : [path];
  if (Array.isArray(value)) return value.flatMap((item, i) => emptyStrings(item, `${path}[${i}]`));
  if (value && typeof value == 'object' && !('$$typeof' in value))
    return Object.entries(value).flatMap(([key, item]) => emptyStrings(item, `${path}.${key}`));
  return [];
}

const MODULES: Record<string, TLocalized<unknown>> = {
  common: commonMessages,
  caro: caroMessages,
  pikachu: pikachuMessages,
  process: processMessages,
  blog: blogMessages,
  formatNumber: formatNumberMessages,
  rubikGuide: RUBIK_GUIDE,
};

describe('message catalogues', () => {
  it.each(Object.keys(MODULES))('%s has the same keys in every locale', (name) => {
    const [first, ...rest] = LOCALES.map((locale) => shape(MODULES[name][locale]));
    for (const other of rest) expect(other).toEqual(first);
  });

  it.each(Object.keys(MODULES))('%s has no empty strings', (name) => {
    for (const locale of LOCALES) expect(emptyStrings(MODULES[name][locale]), locale).toEqual([]);
  });

  it('rubik guide shares the same algorithms in both languages', () => {
    const algsOf = (locale: 'en' | 'vi') =>
      RUBIK_GUIDE[locale].beginnerSteps.flatMap((step) => step.algs?.map((a) => a.alg) ?? []);
    expect(algsOf('vi')).toEqual(algsOf('en'));
    for (const locale of LOCALES) {
      const steps = RUBIK_GUIDE[locale].beginnerSteps;
      expect(steps.flatMap((step) => step.algs ?? []).every((a) => a.name)).toBe(true);
      expect(steps.flatMap((step) => step.images ?? []).every((image) => image.caption)).toBe(true);
    }
  });
});
