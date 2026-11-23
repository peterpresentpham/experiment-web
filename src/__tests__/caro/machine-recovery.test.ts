import { machineRecovery, RELOAD_GUARD_MS } from 'src/services/caro-machine/recovery';
import { describe, expect, it } from 'vitest';

describe('machineRecovery', () => {
  const now = 1_000_000_000;

  it('restarts the worker on a first failure', () => {
    expect(machineRecovery({ failures: 1, reloadedAt: null, now })).toBe('restart');
  });

  it('reloads the page once a new worker fails too', () => {
    expect(machineRecovery({ failures: 2, reloadedAt: null, now })).toBe('reload');
    // A reload long ago was for another failure.
    expect(machineRecovery({ failures: 2, reloadedAt: now - RELOAD_GUARD_MS - 1, now })).toBe(
      'reload'
    );
  });

  it('gives up instead of reloading again, which would loop', () => {
    expect(machineRecovery({ failures: 2, reloadedAt: now - 5_000, now })).toBe('give-up');
    expect(machineRecovery({ failures: 5, reloadedAt: now - 5_000, now })).toBe('give-up');
  });
});
