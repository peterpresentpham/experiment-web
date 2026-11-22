'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from 'src/components/shadcn/button';
import { useLocale, useMessages } from 'src/i18n/client';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, TLocale } from 'src/i18n/config';
import { commonMessages } from 'src/i18n/messages/common';

export default function LanguageConfig() {
  const locale = useLocale();
  const router = useRouter();
  const [isSwitching, startTransition] = useTransition();
  const { settings, languageNames } = useMessages(commonMessages);

  function onChange(next: TLocale) {
    if (next == locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    // The proxy rewrites the same URL to the other locale once the cookie is set, so a refresh is
    // enough: the router keeps the page (only the [lang] value changes, not the root layout).
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-2 rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Languages size={16} /> {settings.language}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {LOCALES.map((option) => (
          <Button
            key={option}
            size="sm"
            lang={option}
            variant={option == locale ? 'default' : 'outline'}
            aria-pressed={option == locale}
            disabled={isSwitching}
            onClick={() => onChange(option)}
          >
            {languageNames[option]}
          </Button>
        ))}
      </div>
    </div>
  );
}
