import { findMachineMove, TCaroMachineRequest } from 'src/services/caro-machine';

export type TCaroMachineWorkerRequest = TCaroMachineRequest & { id: number };
export type TCaroMachineWorkerResponse = { id: number; location: number };

// Runs the search off the main thread so the board stays responsive while the machine thinks.
self.onmessage = (event: MessageEvent<TCaroMachineWorkerRequest>) => {
  const { id, ...request } = event.data;
  const response: TCaroMachineWorkerResponse = { id, location: findMachineMove(request) };
  self.postMessage(response);
};
