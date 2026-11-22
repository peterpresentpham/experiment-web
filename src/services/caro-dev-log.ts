/**
 * Development only: traces of hell-level games (which part chose each machine move, and what
 * Rapfi saw), for finding where the machine goes wrong. /api/dev/caro-log appends them to
 * ml-data/caro-games/ (gitignored). Production builds compile this to a no-op.
 */
export const CARO_DEV_LOG = process.env.NODE_ENV === 'development';

// Groups the events of one worker, i.e. one page load.
const SESSION = Math.random().toString(36).slice(2, 10);

export function logCaroEvent(event: { type: string } & Record<string, unknown>) {
  if (!CARO_DEV_LOG) return;
  const body = JSON.stringify({ time: new Date().toISOString(), session: SESSION, ...event });
  fetch('/api/dev/caro-log', { method: 'POST', body }).catch(() => {});
}
