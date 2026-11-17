'use client';

import { createContext, ReactNode, useContext } from 'react';
import { DEFAULT_LOCALE, isLocale, TLocale } from './config';
import { TLocalized } from './define';

const LocaleContext = createContext<TLocale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: TLocale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Messages of one feature in the current locale, for Client Components. */
export function useMessages<T>(messages: TLocalized<T>): T {
  return messages[useLocale()];
}

/**
 * Locale for code outside React (toasts fired from state machines). The root layout writes the
 * active locale into `<html lang>`.
 */
export function getDocumentLocale(): TLocale {
  if (typeof document == 'undefined') return DEFAULT_LOCALE;
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}
