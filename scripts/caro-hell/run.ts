/* eslint-disable no-console -- command-line script */
import * as tf from '@tensorflow/tfjs-core';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { createHellModel } from 'src/services/caro-hell/model';
import { TCaroSizeBoard, TTurn } from 'src/types/caro.type';
import { hellPlayer } from './arena';
import {
  appendGames,
  copyModel,
  countGames,
  DATA_DIR,
  hasModel,
  initBackend,
  loadModel,
  loadOptimizer,
  lowerPriority,
  MODEL_DIR,
  mulberry32,
  parseNumber,
  playGame,
  randomOpening,
  readGames,
  saveModel,
  saveOptimizer,
  sleep,
  timestamp,
  TPlayer,
  writeAtomic,
  yieldToEvents,
} from './common';
import { startTeacherWorkers } from './generate';
import { selfPlayer } from './selfplay';
import { trainOnGames } from './train';

/**
 * The whole training pipeline as one long, resumable job. Stop it at any time (Ctrl+C, closing
 * the lid, `--hours`, `--until`) and run the same command again: it carries on from the last
 * checkpoint. Progress lives in ml-data/caro-hell/run-state.json.
 *
 *   pnpm hell:run                         # half the cores, low priority
 *   pnpm hell:run --threads 2 --rest 1    # gentle: 2 cores, pause as long as it works
 *   pnpm hell:run --hours 6               # stop by itself after 6 hours
 *   pnpm hell:run --until 07:30           # stop by itself at 07:30
 *   pnpm hell:run --patience 20           # stop after 20 rounds in a row without progress
 *   pnpm hell:run --status                # print progress and exit
 *
 * Stages: teacher (hard engine self-play data) → pretrain (imitate it) → self-play rounds
 * (play, train, arena). A round's network replaces the deployed one only if it wins its arena.
 */

const STATE_FILE = join(DATA_DIR, 'run-state.json');
const LOCK_FILE = join(DATA_DIR, 'run.lock');
const CANDIDATE_DIR = join(DATA_DIR, 'checkpoints/candidate');
const CHECKPOINT_EVERY = 200;
const SIZE: TCaroSizeBoard = 15;

type TArena = { played: number; wins: number; draws: number; losses: number };

type TRunState = {
  version: 1;
  model: { filters: number; blocks: number };
  stage: 'teacher' | 'pretrain' | 'selfplay';
  pretrainStep: number;
  round: number;
  phase: 'play' | 'train' | 'arena';
  trainStep: number;
  arena: TArena;
  history: Array<TArena & { round: number; accepted: boolean; finishedAt: string }>;
  /** Hours of actual work across all sessions. */
  hours: number;
};

const EMPTY_ARENA: TArena = { played: 0, wins: 0, draws: 0, losses: 0 };

const { values } = parseArgs({
  // pnpm passes a lone `--` through when options follow the script name.
  args: process.argv.slice(2).filter((arg) => arg != '--'),
  options: {
    status: { type: 'boolean', default: false },
    threads: {
      type: 'string',
      default: String(Math.max(1, Math.floor(availableParallelism() / 2))),
    },
    rest: { type: 'string', default: '0' },
    hours: { type: 'string' },
    until: { type: 'string' },
    // Network size; only used when the run starts.
    filters: { type: 'string', default: '64' },
    blocks: { type: 'string', default: '6' },
    'teacher-games': { type: 'string', default: '3000' },
    'teacher-time': { type: 'string', default: '150' },
    'pretrain-steps': { type: 'string', default: '15000' },
    batch: { type: 'string', default: '128' },
    lr: { type: 'string', default: '1e-3' },
    rounds: { type: 'string', default: 'Infinity' },
    // Stop once this many rounds in a row failed to beat the deployed network.
    patience: { type: 'string', default: '10' },
    games: { type: 'string', default: '40' },
    sims: { type: 'string', default: '160' },
    // Opening plies where self-play samples from the search instead of playing its best move.
    'temperature-plies': { type: 'string', default: '3' },
    'round-steps': { type: 'string', default: '1000' },
    'round-lr': { type: 'string', default: '2e-4' },
    'arena-games': { type: 'string', default: '16' },
    'arena-time': { type: 'string', default: '1000' },
    gate: { type: 'string', default: '0.55' },
  },
});

const config = {
  threads: parseNumber(values.threads, 4),
  rest: parseNumber(values.rest, 0),
  teacherGames: parseNumber(values['teacher-games'], 3_000),
  teacherTime: parseNumber(values['teacher-time'], 150),
  pretrainSteps: parseNumber(values['pretrain-steps'], 15_000),
  batch: parseNumber(values.batch, 128),
  lr: parseNumber(values.lr, 1e-3),
  rounds: parseNumber(values.rounds, Infinity),
  patience: parseNumber(values.patience, 10),
  games: parseNumber(values.games, 40),
  sims: parseNumber(values.sims, 160),
  temperaturePlies: parseNumber(values['temperature-plies'], 3),
  roundSteps: parseNumber(values['round-steps'], 1_000),
  roundLr: parseNumber(values['round-lr'], 2e-4),
  arenaGames: parseNumber(values['arena-games'], 16),
  arenaTime: parseNumber(values['arena-time'], 1_000),
  gate: parseNumber(values.gate, 0.55),
};

// ---- stopping -------------------------------------------------------------------------------

function parseDeadline() {
  if (values.hours) return Date.now() + parseNumber(values.hours, 0) * 3_600_000;
  if (values.until) {
    const [hours, minutes = 0] = values.until.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);
    if (deadline.getTime() <= Date.now()) deadline.setDate(deadline.getDate() + 1);
    return deadline.getTime();
  }
  return Infinity;
}

const deadline = parseDeadline();
let isStopping = false;
const shouldStop = () => isStopping || Date.now() >= deadline;

/** Rounds since the network last improved: the trailing run of rejected rounds. */
function roundsWithoutProgress(state: TRunState) {
  const lastAccepted = state.history.findLastIndex((item) => item.accepted);
  return state.history.length - 1 - lastAccepted;
}

const hasPlateaued = (state: TRunState) => roundsWithoutProgress(state) >= config.patience;

let stoppingSince = 0;
function onSignal() {
  // pnpm and the terminal may both deliver the same Ctrl+C; only a later one quits at once.
  if (isStopping && Date.now() - stoppingSince > 2_000) process.exit(130);
  if (isStopping) return;
  isStopping = true;
  stoppingSince = Date.now();
  console.log('\n[run] Stopping after the current step and saving… (Ctrl+C again to quit now)');
}

/** Throttle: after `workMs` of work, pause `rest` times as long. Wakes early on stop. */
async function pace(workMs: number) {
  await yieldToEvents();
  const until = Date.now() + workMs * config.rest;
  while (Date.now() < until && !shouldStop()) await sleep(Math.min(500, until - Date.now()));
}

/** Gives up on a game as soon as a stop is requested; such games are not saved. */
function abortable(player: TPlayer): TPlayer {
  return (state) => (shouldStop() ? { move: -1 } : player(state));
}

// ---- state ----------------------------------------------------------------------------------

function loadState(): TRunState | null {
  if (!existsSync(STATE_FILE)) return null;
  return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as TRunState;
}

function newState(): TRunState {
  return {
    version: 1,
    model: { filters: parseNumber(values.filters, 64), blocks: parseNumber(values.blocks, 6) },
    stage: 'teacher',
    pretrainStep: 0,
    round: 1,
    phase: 'play',
    trainStep: 0,
    arena: { ...EMPTY_ARENA },
    history: [],
    hours: 0,
  };
}

let sessionStartedAt = Date.now();
function saveState(state: TRunState) {
  const now = Date.now();
  state.hours += (now - sessionStartedAt) / 3_600_000;
  sessionStartedAt = now;
  mkdirSync(DATA_DIR, { recursive: true });
  writeAtomic(STATE_FILE, JSON.stringify(state, null, 2));
}

function teacherCount() {
  if (!existsSync(DATA_DIR)) return 0;
  return readdirSync(DATA_DIR)
    .filter((file) => file.startsWith('teacher') && file.endsWith('.jsonl'))
    .reduce((sum, file) => sum + countGames(file), 0);
}

const roundFile = (round: number) => `selfplay-r${String(round).padStart(4, '0')}.jsonl`;

function describe(state: TRunState) {
  const lines = [`[status] ${state.hours.toFixed(1)} h of work so far`];
  if (state.stage == 'teacher') {
    lines.push(`[status] stage 1/3 teacher games: ${teacherCount()}/${config.teacherGames}`);
  } else if (state.stage == 'pretrain') {
    lines.push(
      `[status] stage 2/3 pretraining: step ${state.pretrainStep}/${config.pretrainSteps}`
    );
  } else {
    const progress =
      state.phase == 'play'
        ? `self-play ${countGames(roundFile(state.round))}/${config.games} games`
        : state.phase == 'train'
          ? `training step ${state.trainStep}/${config.roundSteps}`
          : `arena ${state.arena.played}/${config.arenaGames} (W${state.arena.wins} D${state.arena.draws} L${state.arena.losses})`;
    const accepted = state.history.filter((item) => item.accepted).length;
    lines.push(
      `[status] stage 3/3 round ${state.round}: ${progress}; ${accepted}/${state.history.length} rounds improved the network`
    );
    lines.push(
      hasPlateaued(state)
        ? `[status] finished: no progress in the last ${roundsWithoutProgress(state)} rounds (raise --patience to keep going)`
        : `[status] ${roundsWithoutProgress(state)}/${config.patience} rounds without progress (stops at ${config.patience})`
    );
    for (const item of state.history.slice(-5)) {
      lines.push(
        `[status]   round ${item.round}: W${item.wins} D${item.draws} L${item.losses} ${item.accepted ? 'accepted' : 'rejected'} (${item.finishedAt.slice(0, 16)})`
      );
    }
  }
  lines.push(`[status] deployed model: ${hasModel() ? MODEL_DIR : 'none yet'}`);
  return lines.join('\n');
}

/** One run at a time; a second one would write the same checkpoints. */
function acquireLock() {
  mkdirSync(DATA_DIR, { recursive: true });
  if (existsSync(LOCK_FILE)) {
    const pid = Number(readFileSync(LOCK_FILE, 'utf8'));
    try {
      process.kill(pid, 0);
      throw new Error(`Another hell:run is already running (pid ${pid}).`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code != 'ESRCH') throw error;
    }
  }
  writeFileSync(LOCK_FILE, String(process.pid));
  process.on('exit', () => rmSync(LOCK_FILE, { force: true }));
}

// ---- stages ---------------------------------------------------------------------------------

async function runTeacher(state: TRunState) {
  let count = teacherCount();
  if (count < config.teacherGames) {
    const file = `teacher-${timestamp()}.jsonl`;
    const startedAt = Date.now();
    const startCount = count;
    await new Promise<void>((resolve) => {
      let isDone = false;
      const finish = () => {
        if (isDone) return;
        isDone = true;
        clearInterval(timer);
        void stop().then(() => resolve());
      };
      const stop = startTeacherWorkers({
        threads: config.threads,
        timeMs: config.teacherTime,
        rest: config.rest,
        onGame: (game) => {
          if (isDone) return;
          appendGames(file, [game]);
          count++;
          if (count % 10 == 0) {
            const perGame = (Date.now() - startedAt) / (count - startCount);
            const eta = ((config.teacherGames - count) * perGame) / 3_600_000;
            console.log(
              `[teacher] ${count}/${config.teacherGames} games (~${eta.toFixed(1)} h left)`
            );
          }
          if (count >= config.teacherGames) finish();
        },
      });
      const timer = setInterval(() => shouldStop() && finish(), 500);
    });
  }
  if (count >= config.teacherGames) state.stage = 'pretrain';
  saveState(state);
}

async function checkpoint(
  state: TRunState,
  model: Parameters<typeof saveModel>[0],
  optimizer: tf.Optimizer
) {
  await saveModel(model, CANDIDATE_DIR);
  await saveOptimizer(optimizer, CANDIDATE_DIR);
  saveState(state);
}

async function runTraining(
  state: TRunState,
  options: {
    key: 'pretrainStep' | 'trainStep';
    steps: number;
    lr: number;
    games: ReturnType<typeof readGames>;
  }
) {
  const isResuming = state[options.key] > 0 && hasModel(CANDIDATE_DIR);
  const model =
    isResuming || options.key == 'trainStep'
      ? await loadModel(CANDIDATE_DIR)
      : createHellModel(state.model);
  const optimizer = tf.train.adam(options.lr);
  if (isResuming) await loadOptimizer(optimizer, CANDIDATE_DIR);
  console.log(
    `[train] ${options.games.length} games, ${isResuming ? `resuming at step ${state[options.key]}` : 'starting'} (${model.countParams()} parameters)`
  );
  const step = await trainOnGames(model, options.games, {
    steps: options.steps,
    startStep: state[options.key],
    batchSize: config.batch,
    learningRate: options.lr,
    window: options.games.length,
    optimizer,
    shouldStop,
    afterStep: async (step, stepMs) => {
      state[options.key] = step;
      if (step % CHECKPOINT_EVERY == 0) await checkpoint(state, model, optimizer);
      await pace(stepMs);
    },
  });
  state[options.key] = step;
  await checkpoint(state, model, optimizer);
  model.dispose();
  optimizer.dispose();
  return step >= options.steps;
}

async function runPretrain(state: TRunState) {
  const isDone = await runTraining(state, {
    key: 'pretrainStep',
    steps: config.pretrainSteps,
    lr: config.lr,
    games: readGames(['teacher']),
  });
  if (!isDone) return;
  copyModel(CANDIDATE_DIR, MODEL_DIR);
  console.log(`[run] Pretraining done; first model deployed to ${MODEL_DIR}`);
  state.stage = 'selfplay';
  state.round = 1;
  state.phase = 'play';
  saveState(state);
}

async function runSelfPlay(state: TRunState) {
  const file = roundFile(state.round);
  const best = await loadModel(MODEL_DIR);
  const player = abortable(selfPlayer(best, config.sims, config.temperaturePlies));
  while (countGames(file) < config.games && !shouldStop()) {
    const startedAt = Date.now();
    const game = await playGame(
      { 0: player, 1: player },
      SIZE,
      'blockOpponent',
      randomOpening(SIZE, 2, Math.random)
    );
    if (shouldStop()) break;
    appendGames(file, [game]);
    const minutes = (Date.now() - startedAt) / 60_000;
    console.log(
      `[self-play] round ${state.round} game ${countGames(file)}/${config.games}: ${game.winner < 0 ? 'draw' : `turn ${game.winner} won`} in ${game.moves.length} plies (${minutes.toFixed(1)} min)`
    );
    await pace(Date.now() - startedAt);
  }
  best.dispose();
  if (countGames(file) >= config.games) {
    // The round's candidate starts from the deployed network.
    rmSync(CANDIDATE_DIR, { recursive: true, force: true });
    copyModel(MODEL_DIR, CANDIDATE_DIR);
    state.phase = 'train';
    state.trainStep = 0;
  }
  saveState(state);
}

async function runRoundTraining(state: TRunState) {
  // Recent self-play plus some teacher games, so the basics are not forgotten.
  const games = [...readGames(['teacher']).slice(-2_000), ...readGames(['selfplay']).slice(-3_000)];
  const isDone = await runTraining(state, {
    key: 'trainStep',
    steps: config.roundSteps,
    lr: config.roundLr,
    games,
  });
  if (!isDone) return;
  state.phase = 'arena';
  state.arena = { ...EMPTY_ARENA };
  saveState(state);
}

async function runArenaPhase(state: TRunState) {
  const candidate = await loadModel(CANDIDATE_DIR);
  const best = await loadModel(MODEL_DIR);
  const challenger = abortable(hellPlayer(candidate, config.arenaTime));
  const defender = abortable(hellPlayer(best, config.arenaTime));
  const arena = state.arena;
  const needed = config.gate * config.arenaGames;

  while (arena.played < config.arenaGames && !shouldStop()) {
    // Already decided either way: no need to play the remaining games.
    const points = arena.wins + arena.draws / 2;
    if (points >= needed || points + (config.arenaGames - arena.played) < needed) break;
    const startedAt = Date.now();
    const challengerTurn = (arena.played % 2) as TTurn;
    // Both colours of a pair share an opening, the same one if the arena is resumed.
    const opening = randomOpening(SIZE, 2, mulberry32(state.round * 1_000 + (arena.played >> 1)));
    const players = { [challengerTurn]: challenger, [1 - challengerTurn]: defender } as Record<
      TTurn,
      TPlayer
    >;
    const game = await playGame(players, SIZE, 'blockOpponent', opening);
    if (shouldStop()) break;
    if (game.winner == challengerTurn) arena.wins++;
    else if (game.winner < 0) arena.draws++;
    else arena.losses++;
    arena.played++;
    console.log(
      `[arena] round ${state.round} game ${arena.played}: new network W${arena.wins} D${arena.draws} L${arena.losses}`
    );
    saveState(state);
    await pace(Date.now() - startedAt);
  }
  candidate.dispose();
  best.dispose();

  const points = arena.wins + arena.draws / 2;
  const isDecided =
    arena.played >= config.arenaGames ||
    points >= needed ||
    points + (config.arenaGames - arena.played) < needed;
  if (!isDecided) return saveState(state);

  const accepted = points >= needed;
  if (accepted) copyModel(CANDIDATE_DIR, MODEL_DIR);
  console.log(
    `[run] Round ${state.round}: ${accepted ? 'new network is stronger, deployed' : 'not better, kept the previous network'}`
  );
  state.history.push({
    ...arena,
    round: state.round,
    accepted,
    finishedAt: new Date().toISOString(),
  });
  state.round++;
  state.phase = 'play';
  state.trainStep = 0;
  state.arena = { ...EMPTY_ARENA };
  saveState(state);
}

// ---- main -----------------------------------------------------------------------------------

async function main() {
  const state = loadState() ?? newState();
  if (values.status) return console.log(describe(state));

  acquireLock();
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  lowerPriority();
  const backend = await initBackend({ threads: config.threads });
  console.log(
    `[run] backend ${backend}, ${config.threads} threads, rest ${config.rest}x${deadline < Infinity ? `, until ${new Date(deadline).toLocaleString()}` : ''}`
  );
  console.log(describe(state));
  sessionStartedAt = Date.now();

  while (!shouldStop()) {
    if (state.stage == 'teacher') await runTeacher(state);
    else if (state.stage == 'pretrain') await runPretrain(state);
    else if (state.round > config.rounds) break;
    else if (hasPlateaued(state)) {
      console.log(
        `[run] No progress in the last ${roundsWithoutProgress(state)} rounds: the network has stopped improving at this size. Raise --patience to keep trying.`
      );
      break;
    } else if (state.phase == 'play') await runSelfPlay(state);
    else if (state.phase == 'train') await runRoundTraining(state);
    else await runArenaPhase(state);
  }
  saveState(state);
  console.log('[run] Saved. Run the same command again to continue.');
  console.log(describe(state));
  process.exit(0);
}

await main();
