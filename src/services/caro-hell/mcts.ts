import { MachineBoard, opponentOf, TCandidate, TStone } from '../caro-machine/board';
import { CELL_FLAG } from '../caro-machine/pattern';
import { encodePlanes, INPUT_PLANES } from './encode';
import { THellEvaluation } from './model';

/** Evaluates positions of one board size in a single batch; planes/legal are concatenated. */
export type THellEvaluator = (
  size: number,
  planes: Float32Array,
  legal: Float32Array,
  count: number
) => Array<THellEvaluation>;

export type TMctsOptions = {
  /** Stops at whichever comes first. */
  maxSimulations: number;
  deadline: number;
  /** Leaves evaluated together; larger batches suit the GPU, 1 suits the plain CPU backend. */
  batchSize: number;
  cPuct?: number;
  /** Root exploration noise for self-play; off when playing a person. */
  dirichlet?: { alpha: number; weight: number; random: () => number };
  /** Root moves that must not be played (lessons from earlier losses). */
  exclude?: ReadonlySet<number>;
};

export type TMctsResult = {
  /** Root moves with their visit counts, most visited first. */
  moves: Array<{ move: number; visits: number; value: number }>;
  simulations: number;
  /** Expected result for the side to move at the root. */
  value: number;
};

const C_PUCT = 1.6;
// Unvisited moves start slightly pessimistic, so the search trusts the policy before wandering.
const FIRST_PLAY_VALUE = -0.15;

type TNode = {
  side: TStone;
  /** Result for the side to move when the position is decided by the forcing rules. */
  terminal: number | null;
  expanded: boolean;
  pending: boolean;
  moves: Int16Array;
  priors: Float32Array;
  visits: Float32Array;
  /** Summed results of each move, from this node's side to move. */
  valueSums: Float32Array;
  virtual: Float32Array;
  children: Array<TNode | undefined>;
  total: number;
};

function createNode(side: TStone): TNode {
  return {
    side,
    terminal: null,
    expanded: false,
    pending: false,
    moves: new Int16Array(0),
    priors: new Float32Array(0),
    visits: new Float32Array(0),
    valueSums: new Float32Array(0),
    virtual: new Float32Array(0),
    children: [],
    total: 0,
  };
}

/**
 * Applies the forcing rules: a five on the board wins, two opponent fives lose, one must be
 * blocked, an open four wins unless the opponent can answer with a four, and an opponent's open
 * three narrows the choice to defending moves. Returns the moves to consider, or a result.
 */
function classify(candidates: Array<TCandidate>): { result: number } | { moves: Array<number> } {
  if (candidates.length == 0) return { result: 0 };
  const opponentFives: Array<number> = [];
  let hasOwnWinThreat = false;
  let opponentHasFour = false;
  let opponentHasWinThreat = false;
  for (const candidate of candidates) {
    if (candidate.attackFlags & CELL_FLAG.FIVE) return { result: 1 };
    if (candidate.defenseFlags & CELL_FLAG.FIVE) opponentFives.push(candidate.index);
    if (candidate.attackFlags & CELL_FLAG.WIN_THREAT) hasOwnWinThreat = true;
    if (candidate.defenseFlags & CELL_FLAG.FOUR) opponentHasFour = true;
    if (candidate.defenseFlags & CELL_FLAG.WIN_THREAT) opponentHasWinThreat = true;
  }
  if (opponentFives.length >= 2) return { result: -1 };
  if (opponentFives.length == 1) return { moves: opponentFives };
  if (hasOwnWinThreat && !opponentHasFour) return { result: 1 };
  if (!opponentHasWinThreat) return { moves: candidates.map((candidate) => candidate.index) };
  return {
    moves: candidates
      .filter(
        (candidate) =>
          candidate.defenseFlags & (CELL_FLAG.WIN_THREAT | CELL_FLAG.FOUR) ||
          candidate.attackFlags & CELL_FLAG.FOUR
      )
      .map((candidate) => candidate.index),
  };
}

function expand(node: TNode, moves: Array<number>, policy: Float32Array) {
  const count = moves.length;
  node.moves = Int16Array.from(moves);
  node.priors = new Float32Array(count);
  node.visits = new Float32Array(count);
  node.valueSums = new Float32Array(count);
  node.virtual = new Float32Array(count);
  node.children = new Array(count);
  let sum = 0;
  for (let i = 0; i < count; i++) sum += policy[moves[i]];
  for (let i = 0; i < count; i++) node.priors[i] = sum > 1e-6 ? policy[moves[i]] / sum : 1 / count;
  node.expanded = true;
}

function selectChild(node: TNode, cPuct: number) {
  const exploration = cPuct * Math.sqrt(node.total + 1);
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < node.moves.length; i++) {
    const visits = node.visits[i] + node.virtual[i];
    // Virtual visits count as losses so parallel descents spread over different moves.
    const quality = visits > 0 ? (node.valueSums[i] - node.virtual[i]) / visits : FIRST_PLAY_VALUE;
    const score = quality + (exploration * node.priors[i]) / (1 + visits);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

type TPath = Array<{ node: TNode; child: number }>;

function backup(path: TPath, leafValue: number) {
  let value = leafValue;
  for (let step = path.length - 1; step >= 0; step--) {
    const { node, child } = path[step];
    value = -value;
    node.visits[child] += 1;
    node.valueSums[child] += value;
    node.virtual[child] -= 1;
    node.total += 1;
  }
}

function revertVirtual(path: TPath) {
  for (const { node, child } of path) node.virtual[child] -= 1;
}

// Gamma(alpha, 1) sample (Marsaglia–Tsang), boosted for alpha < 1.
function sampleGamma(alpha: number, random: () => number): number {
  if (alpha < 1) return sampleGamma(alpha + 1, random) * Math.pow(random(), 1 / alpha);
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      // Box–Muller standard normal.
      x = Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = random();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

function addNoise(node: TNode, alpha: number, weight: number, random: () => number) {
  const noise = Array.from(node.priors, () => sampleGamma(alpha, random));
  const sum = noise.reduce((total, value) => total + value, 0) || 1;
  for (let i = 0; i < node.priors.length; i++) {
    node.priors[i] = (1 - weight) * node.priors[i] + (weight * noise[i]) / sum;
  }
}

/**
 * Monte Carlo tree search guided by the policy/value network (PUCT, as in AlphaZero).
 * The board is restored to its original state when the search returns.
 */
export function runMcts(
  board: MachineBoard,
  side: TStone,
  evaluate: THellEvaluator,
  options: TMctsOptions
): TMctsResult {
  const { size, area } = board;
  const cPuct = options.cPuct ?? C_PUCT;
  const batchSize = Math.max(1, options.batchSize);
  const planes = new Float32Array(batchSize * area * INPUT_PLANES);
  const legal = new Float32Array(batchSize * area);
  const root = createNode(side);

  // Encodes the current board into batch slot `slot`.
  const encodeSlot = (slot: number, toMove: TStone) => {
    encodePlanes(
      board.cells,
      size,
      board.winMode,
      toMove,
      planes.subarray(slot * area * INPUT_PLANES)
    );
    for (let cell = 0; cell < area; cell++)
      legal[slot * area + cell] = board.cells[cell] == 0 ? 1 : 0;
  };

  const rootPlan = classify(board.scoreCandidates(side));
  if ('result' in rootPlan) return { moves: [], simulations: 0, value: rootPlan.result };
  let rootMoves = rootPlan.moves;
  if (options.exclude?.size) {
    const allowed = rootMoves.filter((move) => !options.exclude!.has(move));
    if (allowed.length > 0) rootMoves = allowed;
  }
  encodeSlot(0, side);
  const [rootEvaluation] = evaluate(size, planes, legal, 1);
  expand(root, rootMoves, rootEvaluation.policy);
  if (options.dirichlet) {
    const { alpha, weight, random } = options.dirichlet;
    addNoise(root, alpha, weight, random);
  }

  let simulations = 0;
  while (simulations < options.maxSimulations && performance.now() < options.deadline) {
    const pending: Array<{ node: TNode; path: TPath; moves: Array<number> }> = [];

    for (let slot = 0; slot < batchSize && simulations < options.maxSimulations; slot++) {
      const path: TPath = [];
      let node = root;
      while (node.expanded && node.terminal == null) {
        const child = selectChild(node, cPuct);
        node.virtual[child] += 1;
        board.place(node.moves[child], node.side);
        path.push({ node, child });
        node.children[child] ??= createNode(opponentOf(node.side));
        node = node.children[child]!;
      }

      if (node.terminal != null) {
        backup(path, node.terminal);
        simulations++;
      } else if (node.pending) {
        // Another descent in this batch is already waiting on this leaf.
        revertVirtual(path);
        for (let i = 0; i < path.length; i++) board.undo();
        break;
      } else {
        const plan = classify(board.scoreCandidates(node.side));
        if ('result' in plan) {
          node.terminal = plan.result;
          backup(path, plan.result);
          simulations++;
        } else {
          node.pending = true;
          encodeSlot(pending.length, node.side);
          pending.push({ node, path, moves: plan.moves });
        }
      }
      for (let i = 0; i < path.length; i++) board.undo();
    }

    if (pending.length > 0) {
      const evaluations = evaluate(size, planes, legal, pending.length);
      pending.forEach(({ node, path, moves }, index) => {
        expand(node, moves, evaluations[index].policy);
        node.pending = false;
        backup(path, evaluations[index].value);
        simulations++;
      });
    }
  }

  const moves = Array.from(root.moves, (move, i) => ({
    move,
    visits: root.visits[i],
    value: root.visits[i] > 0 ? root.valueSums[i] / root.visits[i] : FIRST_PLAY_VALUE,
  })).sort((a, b) => b.visits - a.visits || b.value - a.value);
  const value =
    root.total > 0
      ? moves.reduce((sum, item) => sum + item.value * item.visits, 0) / root.total
      : rootEvaluation.value;
  return { moves, simulations, value };
}
