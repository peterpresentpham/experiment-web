'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'src/hooks/useTheme';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import IconButton from './IconButton';

export default function ThemeToggle() {
  const { toggleTheme } = useTheme();
  const { settings } = useMessages(commonMessages);

  // Icons switch through the `dark` class, so the first paint is right before hydration.
  return (
    <IconButton
      aria-label={settings.toggleTheme}
      title={settings.toggleTheme}
      onClick={toggleTheme}
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="dark:hidden" />
    </IconButton>
  );
}
