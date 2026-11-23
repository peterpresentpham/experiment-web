import { createHash } from 'node:crypto';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { parseCaroGameReport } from 'src/services/caro-game-report/validate';

/**
 * Stores hell-level games (finished ones, and ones left during a slow move) in Vercel Blob (private store), one file per game, for the
 * analysis in scripts/caro-hell/fetch-games.ts. Off (404) without a Blob store: a connected store
 * sets BLOB_STORE_ID (the SDK signs in with the deployment's OIDC token), an older one
 * BLOB_READ_WRITE_TOKEN. No IP or other player data is kept.
 */

// The longest game (20x20 full board) is under 2 KB, and its timing under 10 KB.
const MAX_BYTES = 16_384;

export async function POST(request: Request) {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN)
    return new NextResponse(null, { status: 404 });
  const text = await request.text();
  if (text.length > MAX_BYTES) return new NextResponse(null, { status: 413 });
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const game = parseCaroGameReport(value);
  if (!game) return new NextResponse(null, { status: 400 });

  // Named by the game itself, not its timing, so a game sent twice (a reload during the analysis,
  // a slow game left twice) is kept once, as first sent.
  const { timing: _timing, ...moves } = game;
  const key = createHash('sha256').update(JSON.stringify(moves)).digest('hex').slice(0, 32);
  const stored = {
    ...game,
    time: new Date().toISOString(),
    // Which engines played it: the deployed commit.
    build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
  };
  try {
    await put(`caro-games/${key}.json`, JSON.stringify(stored), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
  } catch (error) {
    if (error instanceof Error && /already exists/i.test(error.message))
      return new NextResponse(null, { status: 204 });
    console.error('[caro] could not store a game', error);
    return new NextResponse(null, { status: 502 });
  }
  return new NextResponse(null, { status: 204 });
}
