import { lang } from 'next/root-params';
import { DEFAULT_LOCALE, isLocale, TLocale } from './config';
import { TLocalized } from './define';

/** Locale of the current request, for Server Components and metadata. */
export async function getLocale(): Promise<TLocale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Messages of one feature in the current locale, for Server Components. */
export async function getMessages<T>(messages: TLocalized<T>): Promise<T> {
  return messages[await getLocale()];
}
