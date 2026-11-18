import * as tf from '@tensorflow/tfjs-core';
import * as tfl from '@tensorflow/tfjs-layers';
import { INPUT_PLANES, THellSample } from './encode';
import type { THellEvaluator } from './mcts';

/**
 * AlphaZero-style policy/value network. Fully convolutional, so one set of weights plays every
 * board size: the policy head returns one logit per cell and the value head pools the board.
 */
export type THellModelConfig = { filters: number; blocks: number };

export const DEFAULT_MODEL_CONFIG: THellModelConfig = { filters: 64, blocks: 6 };

/** Weight decay on convolution and dense kernels, applied in `trainStep`. */
export const L2_WEIGHT_DECAY = 1e-4;

/** Bumped whenever the architecture or the input planes change; old saved weights are dropped. */
export const HELL_MODEL_VERSION = 1;

function convBn(input: tfl.SymbolicTensor, filters: number, kernelSize: number) {
  const conv = tfl.layers
    .conv2d({
      filters,
      kernelSize,
      padding: 'same',
      useBias: false,
      kernelInitializer: 'heNormal',
    })
    .apply(input) as tfl.SymbolicTensor;
  return tfl.layers.batchNormalization().apply(conv) as tfl.SymbolicTensor;
}

function relu(input: tfl.SymbolicTensor) {
  return tfl.layers.reLU().apply(input) as tfl.SymbolicTensor;
}

export function createHellModel(config: THellModelConfig = DEFAULT_MODEL_CONFIG) {
  const { filters, blocks } = config;
  const input = tfl.input({ shape: [null, null, INPUT_PLANES], name: 'board' });

  let trunk = relu(convBn(input, filters, 3));
  for (let block = 0; block < blocks; block++) {
    const inner = relu(convBn(trunk, filters, 3));
    const residual = convBn(inner, filters, 3);
    trunk = relu(tfl.layers.add().apply([trunk, residual]) as tfl.SymbolicTensor);
  }

  const policyHidden = relu(convBn(trunk, 2, 1));
  const policy = tfl.layers
    .conv2d({ filters: 1, kernelSize: 1, padding: 'same', name: 'policy' })
    .apply(policyHidden) as tfl.SymbolicTensor;

  const valueHidden = relu(convBn(trunk, 32, 1));
  const pooled = tfl.layers.globalAveragePooling2d({}).apply(valueHidden) as tfl.SymbolicTensor;
  const valueDense = tfl.layers
    .dense({ units: 64, activation: 'relu' })
    .apply(pooled) as tfl.SymbolicTensor;
  const value = tfl.layers
    .dense({ units: 1, activation: 'tanh', name: 'value' })
    .apply(valueDense) as tfl.SymbolicTensor;

  return tfl.model({
    inputs: input,
    outputs: [policy, value],
    name: `caro_hell_v${HELL_MODEL_VERSION}`,
  });
}

export type THellEvaluation = {
  /** Probabilities over all cells, zero on occupied ones. */
  policy: Float32Array;
  /** Expected result for the side to move, from -1 to 1. */
  value: number;
};

/** Evaluates a batch of positions of the same size. `planes` and `legal` are concatenated. */
export function evaluateBatch(
  model: tfl.LayersModel,
  size: number,
  planes: Float32Array,
  legal: Float32Array,
  count: number
): Array<THellEvaluation> {
  const area = size * size;
  const [policyData, valueData] = tf.tidy(() => {
    const input = tf.tensor4d(planes, [count, size, size, INPUT_PLANES]);
    const [logits, value] = model.predict(input) as Array<tf.Tensor>;
    const mask = tf.tensor2d(legal, [count, area]);
    // Occupied cells get a huge negative logit so the softmax ignores them.
    const masked = tf.add(tf.reshape(logits, [count, area]), tf.mul(tf.sub(mask, 1), 1e9));
    return [tf.softmax(masked).dataSync() as Float32Array, value.dataSync() as Float32Array];
  });

  return Array.from({ length: count }, (_, index) => ({
    policy: policyData.slice(index * area, (index + 1) * area),
    value: valueData[index],
  }));
}

/** Adapts the model to the batched evaluator the tree search expects. */
export function createHellEvaluator(model: tfl.LayersModel): THellEvaluator {
  return (size, planes, legal, count) => {
    const area = size * size;
    return evaluateBatch(
      model,
      size,
      planes.subarray(0, count * area * INPUT_PLANES),
      legal.subarray(0, count * area),
      count
    );
  };
}

/** Stacks samples of the same board size into tensors. */
function batchTensors(samples: Array<THellSample>) {
  const { size } = samples[0];
  const area = size * size;
  const count = samples.length;
  const planes = new Float32Array(count * area * INPUT_PLANES);
  const legal = new Float32Array(count * area);
  const policy = new Float32Array(count * area);
  const policyWeight = new Float32Array(count);
  const value = new Float32Array(count);
  samples.forEach((sample, index) => {
    planes.set(sample.planes, index * area * INPUT_PLANES);
    legal.set(sample.legal, index * area);
    policy.set(sample.policy, index * area);
    policyWeight[index] = sample.policyWeight;
    value[index] = sample.value;
  });
  return {
    planes: tf.tensor4d(planes, [count, size, size, INPUT_PLANES]),
    legal: tf.tensor2d(legal, [count, area]),
    policy: tf.tensor2d(policy, [count, area]),
    policyWeight: tf.tensor1d(policyWeight),
    value: tf.tensor2d(value, [count, 1]),
  };
}

export type THellLoss = { total: number; policy: number; value: number };

/**
 * One optimisation step on samples of a single board size:
 * cross-entropy on the policy (legal cells only) plus squared error on the value, plus L2.
 */
export function trainStep(
  model: tfl.LayersModel,
  optimizer: tf.Optimizer,
  samples: Array<THellSample>
): THellLoss {
  const { size } = samples[0];
  const area = size * size;
  const count = samples.length;
  const batch = batchTensors(samples);
  let policyLoss = 0;
  let valueLoss = 0;
  // Conv and dense kernels; biases and batch-norm parameters are rank 1. Names cannot be used:
  // a model loaded from disk gets uniquified ones.
  const kernels = model.trainableWeights.filter((weight) => weight.shape.length > 1);

  const total = optimizer.minimize(
    () => {
      const [logits, value] = model.apply(batch.planes, { training: true }) as Array<tf.Tensor>;
      const masked = tf.add(tf.reshape(logits, [count, area]), tf.mul(tf.sub(batch.legal, 1), 1e9));
      const crossEntropy = tf.neg(tf.sum(tf.mul(batch.policy, tf.logSoftmax(masked)), 1));
      const weightSum = tf.maximum(tf.sum(batch.policyWeight), 1);
      const policyTerm = tf.div(tf.sum(tf.mul(crossEntropy, batch.policyWeight)), weightSum);
      const valueTerm = tf.mean(tf.square(tf.sub(value, batch.value)));
      const regularization = tf.mul(
        tf.addN(kernels.map((kernel) => tf.sum(tf.square(kernel.read())))),
        L2_WEIGHT_DECAY
      );
      policyLoss = policyTerm.dataSync()[0];
      valueLoss = valueTerm.dataSync()[0];
      return tf.addN([policyTerm, valueTerm, regularization]) as tf.Scalar;
      // Only this model's weights, in a fixed order, so a saved optimizer state lines up again.
    },
    true,
    model.trainableWeights.map((weight) => weight.read() as tf.Variable)
  );

  const totalValue = total ? total.dataSync()[0] : 0;
  total?.dispose();
  Object.values(batch).forEach((tensor) => tensor.dispose());
  return { total: totalValue, policy: policyLoss, value: valueLoss };
}

/** Serialises the model into plain artifacts (topology + one weight buffer). */
export async function exportHellModel(model: tfl.LayersModel) {
  let saved: tf.io.ModelArtifacts | undefined;
  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      saved = artifacts;
      return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
    })
  );
  if (!saved) throw new Error('Model could not be serialised');
  return saved;
}

export function loadHellModelFromArtifacts(artifacts: tf.io.ModelArtifacts) {
  return tfl.loadLayersModel(tf.io.fromMemory(artifacts));
}
