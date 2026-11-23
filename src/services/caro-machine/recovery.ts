/**
 * What to do when the machine worker cannot move (a failed move or a worker that failed to load):
 * - restart: a new worker, in case only this one broke (an engine that crashed);
 * - reload: the page, once, when a new worker fails as well. Usually the tab was opened before a
 *   deploy and asks for scripts of the old build, which no longer exist; the reload gets the new
 *   build;
 * - give up: the page was reloaded for this already, so another reload would loop; the player is
 *   told instead.
 */
export type TMachineRecovery = 'restart' | 'reload' | 'give-up';

/** A reload for the same reason within this time counts as the same failure. */
export const RELOAD_GUARD_MS = 10 * 60_000;

export function machineRecovery(options: {
  /** Failures since the machine last moved, this one included. */
  failures: number;
  /** When this tab last reloaded to recover, if it did. */
  reloadedAt: number | null;
  now: number;
}): TMachineRecovery {
  if (options.failures <= 1) return 'restart';
  const reloadedRecently =
    options.reloadedAt != null && options.now - options.reloadedAt < RELOAD_GUARD_MS;
  return reloadedRecently ? 'give-up' : 'reload';
}

const RELOAD_KEY = 'experiment.caro.machine-reload';

/** When this tab last reloaded to recover the machine (session storage: this tab only). */
export function readMachineReload(): number | null {
  try {
    const value = Number(sessionStorage.getItem(RELOAD_KEY));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function reloadForMachine(now: number) {
  try {
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // Without storage a reload could repeat: the guard then lives only as long as the page.
    return false;
  }
  location.reload();
  return true;
}
