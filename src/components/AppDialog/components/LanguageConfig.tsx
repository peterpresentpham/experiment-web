'use client';

import { Languages } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useLocale, useMessages } from 'src/i18n/client';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, TLocale } from 'src/i18n/config';
import { commonMessages } from 'src/i18n/messages/common';

export default function LanguageConfig() {
  const locale = useLocale();
  const { settings, languageNames } = useMessages(commonMessages);

  function onChange(next: TLocale) {
    if (next == locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    // The locale is a root layout segment, so switching it needs a full document load.
    window.location.reload();
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
            onClick={() => onChange(option)}
          >
            {languageNames[option]}
          </Button>
        ))}
      </div>
    </div>
  );
}
