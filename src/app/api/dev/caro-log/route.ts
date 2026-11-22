import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

// Development only (see src/services/caro-dev-log.ts): one JSON line per event, a file per day.
const DIR = join(process.cwd(), 'ml-data', 'caro-games');

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse(null, { status: 404 });
  const event: unknown = await request.json();
  await mkdir(DIR, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  await appendFile(join(DIR, `${day}.jsonl`), JSON.stringify(event) + '\n');
  return new NextResponse(null, { status: 204 });
}
