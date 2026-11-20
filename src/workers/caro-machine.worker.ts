import type { THellGame } from 'src/services/caro-hell/encode';
import { findMachineMove, learnFromGame, TCaroMachineRequest } from 'src/services/caro-machine';
import {
  mergeExperience,
  TExperienceBook,
  TExperienceEntry,
  TGameRecord,
} from 'src/services/caro-machine/experience';
import { TCaroMachineLevel } from 'src/types/caro.type';

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
    }
  /** Hell level: load the network before the first move. */
  | { type: 'warm-up'; epoch: number }
  /** Hell level: the learner saved new weights, drop the cached network. */
  | { type: 'reload-model' };

export type TCaroMachineWorkerResponse =
  | { type: 'move'; id: number; location: number }
  | { type: 'learned'; entries: TExperienceEntries; hellGame: THellGame | null }
  | { type: 'hell-status'; available: boolean };

// The worker keeps its own copy of the book so it is not cloned into every move request.
let book: TExperienceBook = new Map();

function reply(response: TCaroMachineWorkerResponse) {
  self.postMessage(response);
}

// TensorFlow.js and the network are only loaded once the hell level actually needs them: the
// level plays Tengen (a WebAssembly engine) and keeps the network as its fallback.
const loadHell = () => import('src/services/caro-hell/worker-runtime');
const loadTengen = () => import('src/services/caro-tengen/player');

async function handle(message: TCaroMachineWorkerRequest) {
  if (message.type == 'book') {
    book = mergeExperience(new Map(), message.entries);
  } else if (message.type == 'move') {
    const { id, type: _type, epoch, ...request } = message;
    if (request.level == 'hell' && request.size != 3) {
      const tengen = await (await loadTengen()).findTengenMove(request, book);
      if (tengen != null) {
        reply({ type: 'hell-status', available: true });
        reply({ type: 'move', id, location: tengen });
        return;
      }
      const hell = await loadHell();
      const { location, available } = await hell.findHellLevelMove(request, epoch, book);
      reply({ type: 'hell-status', available });
      reply({ type: 'move', id, location });
    } else {
      reply({ type: 'move', id, location: findMachineMove({ ...request, book }) });
    }
  } else if (message.type == 'learn') {
    const { record, level, winner, epoch, replay } = message;
    const entries = learnFromGame(record, book, winner >= 0 && winner != record.machineTurn);
    let hellGame: THellGame | null = null;
    if (level == 'hell') {
      mergeExperience(book, entries);
      const hell = await loadHell();
      hellGame = await hell
        .learnHellGame(record, winner, { book, replay, epoch })
        .catch(() => null);
    }
    reply({ type: 'learned', entries, hellGame });
  } else if (message.type == 'warm-up') {
    if (await (await loadTengen()).warmUpTengen()) {
      reply({ type: 'hell-status', available: true });
      return;
    }
    const hell = await loadHell();
    reply({ type: 'hell-status', available: await hell.warmUpHell(message.epoch) });
  } else if (message.type == 'reload-model') {
    const hell = await loadHell();
    hell.resetHellModel();
  }
}

// Runs the search off the main thread so the board stays responsive while the machine thinks.
// Messages are handled one at a time, in order, even when the hell level awaits its model.
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<TCaroMachineWorkerRequest>) => {
  queue = queue.then(() => handle(event.data)).catch((error) => console.error(error));
};
