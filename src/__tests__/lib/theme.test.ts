import { runInNewContext } from 'node:vm';
import { isTheme, resolveTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from 'src/lib/theme';
import { describe, expect, it } from 'vitest';

// Runs the inline <head> script against a minimal fake browser and returns what it applied.
function runInitScript(stored: string | null, prefersDark: boolean, storageThrows = false) {
  const classes = new Set<string>();
  const root = {
    classList: {
      toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)),
    },
    style: { colorScheme: '' },
  };
  runInNewContext(THEME_INIT_SCRIPT, {
    localStorage: {
      getItem: (key: string) => {
        if (storageThrows) throw new Error('blocked');
        return key == THEME_STORAGE_KEY ? stored : null;
      },
    },
    window: { matchMedia: () => ({ matches: prefersDark }) },
    document: { documentElement: root },
  });
  return { dark: classes.has('dark'), colorScheme: root.style.colorScheme };
}

describe('theme', () => {
  it('resolves system against the OS preference and keeps explicit choices', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('only accepts known theme values', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(true);
    expect(isTheme('blue')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it('init script follows the OS when nothing is stored', () => {
    expect(runInitScript(null, true)).toEqual({ dark: true, colorScheme: 'dark' });
    expect(runInitScript(null, false)).toEqual({ dark: false, colorScheme: 'light' });
  });

  it('init script lets a stored choice beat the OS preference', () => {
    expect(runInitScript('light', true)).toEqual({ dark: false, colorScheme: 'light' });
    expect(runInitScript('dark', false)).toEqual({ dark: true, colorScheme: 'dark' });
    expect(runInitScript('garbage', true)).toEqual({ dark: true, colorScheme: 'dark' });
  });

  it('init script never throws when storage is blocked', () => {
    expect(() => runInitScript(null, true, true)).not.toThrow();
  });
});
