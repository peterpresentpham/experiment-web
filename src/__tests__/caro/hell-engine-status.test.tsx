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
const { default: HellEngineStatus, hellEngineState } =
  await import('src/views/CaroView/HellEngineStatus');
const { useCaroExperienceStore } = await import('src/states/caro-experience.state');
const { useCaroStore } = await import('src/states/caro.state');

const hellGame = useCaroStore.getState().metadata;

afterEach(() => {
  cleanup();
  useCaroExperienceStore.setState({ hellEngines: null });
  useCaroStore.setState({ metadata: hellGame });
});

const show = () =>
  render(
    <LocaleProvider locale="en">
      <HellEngineStatus />
    </LocaleProvider>
  );

describe('hellEngineState', () => {
  it('names the engine the hell level plays with right now', () => {
    expect(hellEngineState({ rapfi: 'loading', tengen: 'loading' })).toBe('loading');
    expect(hellEngineState({ rapfi: 'loading', tengen: 'ready' })).toBe('loadingRapfi');
    expect(hellEngineState({ rapfi: 'ready', tengen: 'loading' })).toBe('rapfi');
    expect(hellEngineState({ rapfi: 'failed', tengen: 'ready' })).toBe('tengen');
    expect(hellEngineState({ rapfi: 'failed', tengen: 'loading' })).toBe('loading');
    expect(hellEngineState({ rapfi: 'failed', tengen: 'failed' })).toBe('none');
  });
});

describe('HellEngineStatus', () => {
  it('stays hidden until the engines start loading', () => {
    const { container } = show();
    expect(container.textContent).toBe('');
  });

  it('follows the engines as they load', () => {
    const { setHellEngines } = useCaroExperienceStore.getState().fn;
    setHellEngines({ rapfi: 'loading', tengen: 'ready' });
    show();
    const badge = screen.getByText('Loading Rapfi…');
    expect(badge.getAttribute('title')).toMatch(/Tengen plays until Rapfi/);

    act(() => setHellEngines({ rapfi: 'ready', tengen: 'ready' }));
    expect(screen.getByText('Rapfi')).toBeTruthy();

    act(() => setHellEngines({ rapfi: 'failed', tengen: 'ready' }));
    expect(screen.getByText('Tengen')).toBeTruthy();
  });

  it('is hidden outside a game against the hell level', () => {
    useCaroExperienceStore.getState().fn.setHellEngines({ rapfi: 'ready', tengen: 'ready' });
    useCaroStore.setState({ metadata: { ...hellGame, machineLevel: 'hard' } });
    const { container } = show();
    expect(container.textContent).toBe('');
  });
});
