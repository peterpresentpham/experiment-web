'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  applyTheme,
  DARK_MEDIA_QUERY,
  prefersDarkScheme,
  readStoredTheme,
  resolveTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  TTheme,
} from 'src/lib/theme';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_MEDIA_QUERY);
  media.addEventListener('change', onChange);
  window.addEventListener('storage', onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener('change', onChange);
    window.removeEventListener('storage', onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function getServerTheme(): TTheme {
  return 'system';
}

function getServerPrefersDark() {
  return false;
}

export function setTheme(theme: TTheme) {
  try {
    if (theme == 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the choice then only lasts for this page.
  }
  applyTheme(resolveTheme(theme, prefersDarkScheme()));
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/**
 * The server snapshot is always "system/light", so anything that must match the real theme on
 * first paint should be styled with the `dark:` variant instead of reading this hook.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, getServerTheme);
  const prefersDark = useSyncExternalStore(subscribe, prefersDarkScheme, getServerPrefersDark);
  const resolvedTheme = resolveTheme(theme, prefersDark);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme == 'dark' ? 'light' : 'dark');
  }, [resolvedTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme };
}
