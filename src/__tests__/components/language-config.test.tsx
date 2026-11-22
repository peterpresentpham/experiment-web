// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LanguageConfig from 'src/components/AppDialog/components/LanguageConfig';
import { LocaleProvider } from 'src/i18n/client';
import { LOCALE_COOKIE } from 'src/i18n/config';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

afterEach(() => {
  cleanup();
  refresh.mockClear();
  document.cookie = `${LOCALE_COOKIE}=; max-age=0; path=/`;
});

describe('LanguageConfig', () => {
  it('saves the new locale and refreshes the page in place', () => {
    const reload = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload });
    render(
      <LocaleProvider locale="en">
        <LanguageConfig />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tiếng Việt' }));
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=vi`);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
  });

  it('does nothing for the current locale', () => {
    render(
      <LocaleProvider locale="en">
        <LanguageConfig />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(refresh).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain(`${LOCALE_COOKIE}=`);
  });
});
