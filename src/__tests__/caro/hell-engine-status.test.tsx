// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider } from 'src/i18n/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The experience store persists to localStorage, which this Node does not provide to jsdom.
const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
  removeItem: (key: string) => memory.delete(key),
});
const { default: HellEngineStatus } =
  await import('src/components/AppDialog/CaroConfigDialog/HellEngineStatus');
const { useCaroExperienceStore } = await import('src/states/caro-experience.state');

afterEach(() => {
  cleanup();
  useCaroExperienceStore.setState({ hellEngines: null });
});

const show = () =>
  render(
    <LocaleProvider locale="en">
      <HellEngineStatus />
    </LocaleProvider>
  );

describe('HellEngineStatus', () => {
  it('stays hidden until the engines start loading', () => {
    const { container } = show();
    expect(container.textContent).toBe('');
  });

  it('follows the engines as they load', () => {
    const { setHellEngines } = useCaroExperienceStore.getState().fn;
    setHellEngines({ rapfi: 'loading', tengen: 'ready' });
    show();
    expect(screen.getByText('Rapfi · loading…')).toBeTruthy();
    expect(screen.getByText('Tengen · ready')).toBeTruthy();
    expect(screen.getByText(/Tengen plays until Rapfi/)).toBeTruthy();

    act(() => setHellEngines({ rapfi: 'ready', tengen: 'ready' }));
    expect(screen.getByText('Rapfi · ready')).toBeTruthy();
    expect(screen.queryByText(/Tengen plays until Rapfi/)).toBeNull();

    act(() => setHellEngines({ rapfi: 'failed', tengen: 'ready' }));
    expect(screen.getByText('Rapfi · unavailable')).toBeTruthy();
  });
});
