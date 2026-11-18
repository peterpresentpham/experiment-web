import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import * as tfl from '@tensorflow/tfjs-layers';
import { HELL_MODEL_VERSION } from './model';
import { THellSearchConfig } from './player';

export { createHellEvaluator } from './model';

/**
 * Browser side of the hell level, loaded lazily inside the caro workers so the TensorFlow.js
 * bundle is only fetched by people who pick that level.
 */

/** Base weights shipped with the site; produced by `pnpm hell:train`. */
export const BASE_MODEL_URL = '/models/caro-hell/model.json';

type TBaseInfo = { id: string };

let backendReady: Promise<string> | undefined;

/** WebGL when the worker can get a GPU context, the plain CPU backend otherwise. */
export function initHellBackend() {
  backendReady ??= (async () => {
    try {
      if (await tf.setBackend('webgl')) {
        await tf.ready();
        return 'webgl';
      }
    } catch {
      // No OffscreenCanvas/WebGL in this worker; fall through to the CPU backend.
    }
    await tf.setBackend('cpu');
    await tf.ready();
    return 'cpu';
  })();
  return backendReady;
}

/** The deployed base model's identity, or null when no trained model has been shipped yet. */
async function fetchBaseInfo(): Promise<TBaseInfo | null> {
  try {
    const response = await fetch(BASE_MODEL_URL, { cache: 'no-cache' });
    if (!response.ok) return null;
    const json = (await response.json()) as { userDefinedMetadata?: { trainedAt?: string } };
    return { id: `${HELL_MODEL_VERSION}-${json.userDefinedMetadata?.trainedAt ?? 'base'}` };
  } catch {
    return null;
  }
}

/**
 * Personal copy of the model, fine-tuned in this browser. The key ties it to the base model it
 * grew from and to the memory epoch, so a new base model or "clear memory" starts it afresh.
 */
function localModelUrl(base: TBaseInfo, epoch: number) {
  return `indexeddb://caro-hell-${base.id}-e${epoch}`;
}

async function removeStaleLocalModels(keep: string) {
  try {
    const models = await tf.io.listModels();
    await Promise.all(
      Object.keys(models)
        .filter((url) => url.startsWith('indexeddb://caro-hell-') && url != keep)
        .map((url) => tf.io.removeModel(url))
    );
  } catch {
    // IndexedDB may be unavailable (private mode); nothing to clean up then.
  }
}

/** The personal model if there is one, else the shipped base model; null without a base. */
export async function loadHellModel(epoch: number) {
  await initHellBackend();
  const base = await fetchBaseInfo();
  if (!base) return null;
  const localUrl = localModelUrl(base, epoch);
  void removeStaleLocalModels(localUrl);
  try {
    return await tfl.loadLayersModel(localUrl);
  } catch {
    return tfl.loadLayersModel(BASE_MODEL_URL);
  }
}

export async function saveLocalHellModel(model: tfl.LayersModel, epoch: number) {
  const base = await fetchBaseInfo();
  if (!base) return false;
  await model.save(localModelUrl(base, epoch));
  return true;
}

/** Bigger batches only pay off on the GPU; the time limit decides the real simulation count. */
export async function hellSearchConfig(): Promise<THellSearchConfig> {
  const backend = await initHellBackend();
  return backend == 'webgl'
    ? { batchSize: 8, maxSimulations: 3_200 }
    : { batchSize: 1, maxSimulations: 800 };
}
