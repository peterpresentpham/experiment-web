import type {
  TCaroMachineWorkerRequest,
  TCaroMachineWorkerResponse,
} from 'src/workers/caro-machine.worker';

export type { TCaroMachineWorkerRequest, TCaroMachineWorkerResponse };

/** A caro machine worker: the one that plays, or one that studies a finished game. */
export function createMachineWorker() {
  return new Worker(new URL('../../workers/caro-machine.worker.ts', import.meta.url), {
    type: 'module',
  });
}

export function postToMachine(worker: Worker, request: TCaroMachineWorkerRequest) {
  worker.postMessage(request);
}
