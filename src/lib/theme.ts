export const THEMES = ['system', 'light', 'dark'] as const;
export type TTheme = (typeof THEMES)[number];
export type TResolvedTheme = Exclude<TTheme, 'system'>;

export const THEME_STORAGE_KEY = 'experiment.theme';
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
// Fired on the window when the theme changes in this tab (`storage` only fires in other tabs).
export const THEME_CHANGE_EVENT = 'experiment:theme-change';

export function isTheme(value: unknown): value is TTheme {
  return THEMES.includes(value as TTheme);
}

export function resolveTheme(theme: TTheme, prefersDark: boolean): TResolvedTheme {
  if (theme == 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

export function readStoredTheme(): TTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function prefersDarkScheme() {
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

export function applyTheme(resolved: TResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved == 'dark');
  root.style.colorScheme = resolved;
}

/**
 * Runs before first paint so the page never flashes the wrong theme.
 * Pages are prerendered for every visitor, so the theme can't be decided on the server.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||(t!=='light'&&window.matchMedia('${DARK_MEDIA_QUERY}').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light'}catch(e){}})()`;
