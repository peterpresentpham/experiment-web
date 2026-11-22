/* eslint-disable no-console -- command-line script */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { get, list } from '@vercel/blob';
import { ROOT } from './common';

/**
 * Downloads the hell-level games players finished on the deployed site (stored by
 * src/app/api/caro/games) into ml-data/caro-games/prod/, one JSON file per game. Needs the
 * store's credentials from `vercel env pull .env.local` (BLOB_STORE_ID with VERCEL_OIDC_TOKEN,
 * which expires after a few hours: pull again; or BLOB_READ_WRITE_TOKEN):
 *
 *   pnpm caro:fetch-games
 *
 * Resumable: games already downloaded are skipped.
 */

const OUT = join(ROOT, 'ml-data/caro-games/prod');

async function main() {
  const { BLOB_READ_WRITE_TOKEN, BLOB_STORE_ID, VERCEL_OIDC_TOKEN } = process.env;
  if (!BLOB_READ_WRITE_TOKEN && !(BLOB_STORE_ID && VERCEL_OIDC_TOKEN)) {
    console.error('No Blob credentials: run `vercel env pull .env.local` first');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  let cursor: string | undefined;
  let fetched = 0;
  let known = 0;
  do {
    const page = await list({ prefix: 'caro-games/', cursor });
    for (const blob of page.blobs) {
      const file = join(OUT, basename(blob.pathname));
      if (existsSync(file)) {
        known++;
        continue;
      }
      const result = await get(blob.pathname, { access: 'private' });
      if (!result) continue;
      writeFileSync(file, await new Response(result.stream).text());
      fetched++;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  console.log(`[games] ${fetched} new, ${known} already here, in ml-data/caro-games/prod/`);
}

await main();
