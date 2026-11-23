import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const put = vi.fn();
vi.mock('@vercel/blob', () => ({ put: (...args: Array<unknown>) => put(...args) }));

const { POST } = await import('src/app/api/caro/games/route');

const GAME = {
  version: 1,
  size: 15,
  winMode: 'blockOpponent',
  machineTurn: 1,
  firstTurn: 0,
  moves: [108, 0, 109, 1, 110, 2, 111, 3, 112],
  winner: 0,
};
const post = (body: string) =>
  POST(new Request('http://test/api/caro/games', { method: 'POST', body }));

describe('POST /api/caro/games', () => {
  beforeEach(() => {
    put.mockReset();
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('is off without a Blob store', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('BLOB_STORE_ID', '');
    expect((await post(JSON.stringify(GAME))).status).toBe(404);
    expect(put).not.toHaveBeenCalled();
  });

  it('stores a real game privately, named by the game', async () => {
    expect((await post(JSON.stringify(GAME))).status).toBe(204);
    expect(put).toHaveBeenCalledTimes(1);
    const [path, body, options] = put.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(path).toMatch(/^caro-games\/[0-9a-f]{32}\.json$/);
    expect(JSON.parse(body)).toMatchObject(GAME);
    expect(options).toMatchObject({ access: 'private', addRandomSuffix: false });
  });

  it('is on with a store connected through OIDC', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('BLOB_STORE_ID', 'store_test');
    expect((await post(JSON.stringify(GAME))).status).toBe(204);
  });

  it('names a game by its moves, not its timing', async () => {
    const timing = { device: 'ios', threads: 1, loaded: {}, moves: [] };
    await post(JSON.stringify({ ...GAME, timing }));
    await post(JSON.stringify({ ...GAME, timing: { ...timing, threads: 2 } }));
    await post(JSON.stringify(GAME));
    const paths = put.mock.calls.map(([path]) => path as string);
    expect(new Set(paths).size).toBe(1);
    expect(JSON.parse(put.mock.calls[0][1] as string)).toMatchObject({ timing });
  });

  it('accepts a game sent twice', async () => {
    put.mockRejectedValueOnce(new Error('Vercel Blob: This blob already exists'));
    expect((await post(JSON.stringify(GAME))).status).toBe(204);
  });

  it('rejects what the app could not have played', async () => {
    expect((await post(JSON.stringify({ ...GAME, winner: 1 }))).status).toBe(400);
    expect((await post('not json')).status).toBe(400);
    expect((await post('x'.repeat(20_000))).status).toBe(413);
    expect(put).not.toHaveBeenCalled();
  });
});
