import type { TCaroMoveSource } from 'src/services/caro-game-report/validate';
import type { THellGame } from 'src/services/caro-hell/encode';
import { logCaroEvent } from 'src/services/caro-dev-log';
import { findMachineMove, learnFromGame, TCaroMachineRequest } from 'src/services/caro-machine';
import {
  mergeExperience,
  TExperienceBook,
  TExperienceEntry,
  TGameRecord,
} from 'src/services/caro-machine/experience';
import { TCaroHellEngines, TCaroMachineLevel, TCaroWinMode } from 'src/types/caro.type';

export type TExperienceEntries = Array<[string, TExperienceEntry]>;

export type TCaroMachineWorkerRequest =
  | { type: 'book'; entries: TExperienceEntries }
  | ({ type: 'move'; id: number; epoch: number } & Omit<TCaroMachineRequest, 'book'>)
  | {
      type: 'learn';
      record: TGameRecord;
      level: TCaroMachineLevel;
      /** 0 or 1 when someone won, -1 for a draw. */
      winner: number;
      epoch: number;
      /** Recent hell games, replayed while fine-tuning the network. */
      replay: Array<THellGame>;
      /** Hell level: whether to fine-tune the network (only when it is what plays). */
      fineTune: boolean;
      /** How long the analysis may take. */
      budgetMs: number;
    }
  /** Hell level: load the engine for this rule (or the network) before the first move. */
  | { type: 'warm-up'; epoch: number; winMode: TCaroWinMode }
  /** Hell level: the learner saved new weights, drop the cached network. */
  | { type: 'reload-model' }
  /** Easy to hard on boards above 3x3: start loading Tengen and the book before the first move. */
  | { type: 'preload-levels' };

export type TCaroMachineWorkerResponse =
  /** `source`: which part of the hell level chose the move (other levels leave it out). */
  | { type: 'move'; id: number; location: number; source?: TCaroMoveSource }
  /** The move could not be found: the page restarts the worker or reloads. */
  | { type: 'move-failed'; id: number }
  | { type: 'learned'; entries: TExperienceEntries; hellGame: THellGame | null }
  | { type: 'hell-status'; available: boolean }
  | { type: 'hell-engines'; engines: TCaroHellEngines };

// The worker keeps its own copy of the book so it is not cloned into every move request.
let book: TExperienceBook = new Map();

function reply(response: TCaroMachineWorkerResponse) {
  self.postMessage(response);
}

// TensorFlow.js and the network are only loaded once the hell level actually needs them: the
// level plays Rapfi (a WebAssembly engine), with Tengen standing in for it, and keeps the
// network as the last fallback, for browsers where neither engine can run.
let hellRuntime: Promise<typeof import('src/services/caro-hell/worker-runtime')> | undefined;
const loadHell = () => (hellRuntime ??= import('src/services/caro-hell/worker-runtime'));
const loadTengen = () => import('src/services/caro-tengen/player');
const loadLevels = () => import('src/services/caro-tengen/levels');

// What the header shows: the last engine report, kept up to date after each move.
let engines: TCaroHellEngines | null = null;
function reportEngines(next: TCaroHellEngines) {
  engines = next;
  reply({ type: 'hell-engines', engines: next });
}

/** Finds and sends the machine's move. */
async function playMove(message: Extract<TCaroMachineWorkerRequest, { type: 'move' }>) {
  const { id, type: _type, epoch, ...request } = message;
  if (request.level == 'hell' && request.size != 3) {
    const player = await loadTengen();
    const found = await player.findTengenMove(request, book);
    // Once the warm-up reported them, the header follows the engines' later changes.
    const now = player.engineLoads();
    if (engines && (now.rapfi != engines.rapfi || now.tengen != engines.tengen)) reportEngines(now);
    if (found != null) {
      reply({ type: 'hell-status', available: true });
      reply({ type: 'move', id, ...found });
      if (found.source == 'tengen') player.remeasureTengenOnce();
      return;
    }
    const hell = await loadHell();
    const { location, available } = await hell.findHellLevelMove(request, epoch, book);
    logCaroEvent({
      type: 'move',
      source: 'network',
      location,
      size: request.size,
      steps: request.steps,
    });
    reply({ type: 'hell-status', available });
    reply({ type: 'move', id, location, source: 'network' });
  } else if (request.level != 'hell' && request.size != 3) {
    const { findLevelMove } = await loadLevels();
    const { location } = await findLevelMove({ ...request, level: request.level }, book);
    reply({ type: 'move', id, location });
  } else {
    reply({ type: 'move', id, location: findMachineMove({ ...request, book }) });
  }
}

/** Studies a finished game: lessons for the book and, when asked, a fine-tune of the network. */
async function learn(message: Extract<TCaroMachineWorkerRequest, { type: 'learn' }>) {
  const { record, level, winner, epoch, replay, fineTune, budgetMs } = message;
  const didMachineLose = winner >= 0 && winner != record.machineTurn;
  const entries = learnFromGame(record, book, didMachineLose, budgetMs);
  logCaroEvent({ type: 'game', level, winner, record, learned: entries });
  let hellGame: THellGame | null = null;
  if (level == 'hell' && fineTune) {
    mergeExperience(book, entries);
    const hell = await loadHell();
    hellGame = await hell.learnHellGame(record, winner, { book, replay, epoch }).catch(() => null);
  }
  return { entries, hellGame };
}

async function handle(message: TCaroMachineWorkerRequest) {
  if (message.type == 'book') {
    book = mergeExperience(new Map(), message.entries);
    logCaroEvent({ type: 'book', lessons: book.size });
  } else if (message.type == 'move') {
    try {
      await playMove(message);
    } catch (error) {
      // A chunk that no longer exists (a tab opened before a deploy), an engine that crashed:
      // the page must hear of it, or the machine never moves and nothing says why.
      reply({ type: 'move-failed', id: message.id });
      throw error;
    }
  } else if (message.type == 'learn') {
    // Always answers, so the page's queue of games to study moves on.
    const result = await learn(message).catch((error: unknown) => {
      console.error('[caro] could not study the game', error);
      return { entries: [], hellGame: null };
    });
    reply({ type: 'learned', ...result });
  } else if (message.type == 'warm-up') {
    const player = await loadTengen();
    const available = await player.warmUpTengen(message.winMode, (engines) => {
      reportEngines(engines);
      // The level plays as soon as either engine can.
      if (engines.rapfi == 'ready' || engines.tengen == 'ready')
        reply({ type: 'hell-status', available: true });
    });
    if (available) return;
    const hell = await loadHell();
    reply({ type: 'hell-status', available: await hell.warmUpHell(message.epoch) });
  } else if (message.type == 'preload-levels') {
    (await loadLevels()).preloadLevels();
  } else if (message.type == 'reload-model') {
    // Only a network this worker already loaded holds old weights. Loading TensorFlow.js here
    // just to drop nothing would hold up the next move.
    if (hellRuntime) (await hellRuntime).resetHellModel();
  }
}

// Runs the search off the main thread so the board stays responsive while the machine thinks.
// Messages are handled one at a time, in order, even when the hell level awaits its model. A
// warm-up or preload only starts downloads, so it runs beside the queue: a move must not wait
// for them.
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<TCaroMachineWorkerRequest>) => {
  if (event.data.type == 'warm-up' || event.data.type == 'preload-levels') {
    handle(event.data).catch((error) => console.error(error));
    return;
  }
  queue = queue.then(() => handle(event.data)).catch((error) => console.error(error));
};
