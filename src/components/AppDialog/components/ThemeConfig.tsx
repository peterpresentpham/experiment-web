'use client';

import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useTheme } from 'src/hooks/useTheme';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { THEMES } from 'src/lib/theme';

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon };

export default function ThemeConfig() {
  const { theme, setTheme } = useTheme();
  const { settings } = useMessages(commonMessages);

  return (
    <div className="mt-2 rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Palette size={16} /> {settings.theme}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {THEMES.map((option) => {
          const Icon = THEME_ICONS[option];
          return (
            <Button
              key={option}
              size="sm"
              variant={option == theme ? 'default' : 'outline'}
              aria-pressed={option == theme}
              onClick={() => setTheme(option)}
            >
              <Icon size={16} /> {settings.themes[option]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
