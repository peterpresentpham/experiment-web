import {
  isPhone,
  loadTengen,
  PHONE_HASH_MB,
  TTengen,
  TTengenHelperSetup,
  tengenThreads,
} from './engine';
import { parseOpeningBook, TOpeningBook, TOpeningBookFile } from './opening-book';
import { createRetryingLoad } from './retrying-load';

/** Browser (worker) side of Tengen: loads the WebAssembly build from /engines/tengen once. */

const BASE_URL = '/engines/tengen/';

async function compile(file: string) {
  const url = BASE_URL + file;
  // A failed download must not reach the compiler, which would call it a module this browser
  // cannot run and the engine would not be tried again.
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  try {
    return await WebAssembly.compileStreaming(response.clone());
  } catch (error) {
    if (error instanceof WebAssembly.CompileError) throw error;
    // Servers that do not send application/wasm defeat compileStreaming.
    return WebAssembly.compile(await response.arrayBuffer());
  }
}

function spawnHelper(setup: TTengenHelperSetup) {
  const helper = new Worker(new URL('../../workers/tengen-helper.worker.ts', import.meta.url), {
    type: 'module',
  });
  helper.postMessage(setup);
}

const tengen = createRetryingLoad<TTengen>(
  async () => {
    if (typeof WebAssembly != 'object') return null;
    const threads = tengenThreads({
      isolated: self.crossOriginIsolated && typeof SharedArrayBuffer != 'undefined',
      cores: navigator.hardwareConcurrency,
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
    });
    const device = {
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
    };
    const options = { hashMb: isPhone(device) ? PHONE_HASH_MB : undefined };
    try {
      return await loadTengen({ compile, spawnHelper }, threads, options);
    } catch (error) {
      if (threads == 1) throw error;
      // Shared memory can run short; one thread always fits.
      return loadTengen({ compile }, 1, options);
    }
  },
  { name: 'Tengen' }
);

/**
 * The engine, or null where WebAssembly cannot run it or its download failed (the caller falls
 * back to the network). A failed download is tried again on the next call.
 */
export const getTengen = tengen.get;
/** Whether the engine is loading, ready or unavailable, for the header. */
export const tengenLoadState = tengen.state;
/** The engine if it has finished loading, without waiting or starting a load. */
export const readyTengen = tengen.peek;

const BOOK_URL = '/models/caro-book/opening-block.json';
const EMPTY_BOOK: TOpeningBook = new Map();
const book = createRetryingLoad<TOpeningBook>(
  async () => {
    const response = await fetch(BOOK_URL);
    if (!response.ok) throw new Error(`${BOOK_URL}: HTTP ${response.status}`);
    return parseOpeningBook((await response.json()) as TOpeningBookFile);
  },
  { name: 'the opening book' }
);

/**
 * The opening book, or an empty one while it cannot be fetched (the engine then searches); a
 * failed download is tried again on the next call.
 */
export async function getOpeningBook() {
  return (await book.get()) ?? EMPTY_BOOK;
}
