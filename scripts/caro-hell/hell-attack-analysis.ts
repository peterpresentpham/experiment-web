import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { cellName, fiveSpots, TGuideStone } from 'src/services/caro-guide/board';
import { ROOT } from './common';
import { ATTACK_FILE, TAttackGame } from './hell-attack';

/**
 * The analysis of `hell-attack.ts` games, kept next to them in ml-data/caro-hell/attack/ so later
 * training rounds can use it and compare against it:
 * - analysis.json: the latest full analysis (summary, opening tree, every game in cell names);
 * - mistakes.jsonl: one line per won game, the position before the Hell move that let the
 *   attacker see a forced win, that move, and the attacker's winning reply: positions to give a
 *   longer search (book entries, training targets);
 * - history.jsonl: one summary line per run, with the opening book's hash, to see whether a new
 *   book or engine setting made the Hell level harder to beat.
 */

const SIZE = 20;
const MID = SIZE / 2;
const MATE = 20_000;
const BOOK_FILE = join(ROOT, 'public/models/caro-book/opening-block.json');

const TRANSFORMS: Array<(r: number, c: number) => [number, number]> = [
  (r, c) => [r, c],
  (r, c) => [c, -r],
  (r, c) => [-r, -c],
  (r, c) => [-c, r],
  (r, c) => [r, -c],
  (r, c) => [-r, c],
  (r, c) => [c, r],
  (r, c) => [-c, -r],
];

function transformMove(transform: number, move: number) {
  const [r, c] = TRANSFORMS[transform](Math.floor(move / SIZE) - MID, (move % SIZE) - MID);
  const [row, column] = [r + MID, c + MID];
  return row >= 0 && row < SIZE && column >= 0 && column < SIZE ? row * SIZE + column : -1;
}

/** The game turned so its second move is j10 (9, 9), choosing the smallest third move on ties. */
export function normalise(moves: Array<number>) {
  const target = 9 * SIZE + 9;
  let best: Array<number> | null = null;
  for (let t = 0; t < TRANSFORMS.length; t++) {
    if (transformMove(t, moves[1]) != target) continue;
    const turned = moves.map((move) => transformMove(t, move));
    if (turned.includes(-1)) continue;
    if (!best || turned[2] < best[2]) best = turned;
  }
  return best ?? moves;
}

export const name = (move: number) => cellName(move, SIZE);
const names = (moves: Array<number>) => moves.map(name);

/** First ply at which the attacker's own score was a forced win, or -1. */
export function firstMate(game: TAttackGame) {
  return game.scores.findIndex((score, ply) => ply % 2 == 0 && score != null && score > MATE);
}

/** The attacker's moves at the end of a won game that each made a four (its final VCF). */
export function finalFours(game: TAttackGame) {
  const stones = new Map<number, TGuideStone>();
  game.moves.forEach((move, ply) => stones.set(move, ply % 2 == 0 ? 'x' : 'o'));
  let count = 0;
  for (let ply = game.moves.length - 3; ply >= 0; ply -= 2) {
    const before = new Map(stones);
    for (const move of game.moves.slice(ply + 1)) before.delete(move);
    if (fiveSpots(before, 'x', SIZE, 'blockOpponent').length == 0) break;
    count++;
  }
  return count;
}

export function histogram(values: Array<number | string>) {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

export type TTreeNode = {
  line: Array<string>;
  games: number;
  won: number;
  firstMate: Array<number>;
};

/** Every line of the first `plies` moves, with how often it was played and won. */
export function openingTree(games: Array<TAttackGame>, plies: number) {
  const tree = new Map<string, TTreeNode>();
  for (const game of games) {
    const line = names(game.moves.slice(0, plies));
    for (let depth = 1; depth <= line.length; depth++) {
      const key = line.slice(0, depth).join(' ');
      const node = tree.get(key) ?? { games: 0, won: 0, firstMate: [], line: line.slice(0, depth) };
      node.games++;
      if (game.winner == 0) node.won++;
      const mate = firstMate(game);
      if (mate > 0) node.firstMate.push(mate / 2 + 1);
      tree.set(key, node);
    }
  }
  return [...tree.values()].sort((a, b) => a.line.join(' ').localeCompare(b.line.join(' ')));
}

/** The Hell move that let the attacker first see a forced win, with the position before it. */
export function mistakeOf(game: TAttackGame, index: number) {
  const ply = firstMate(game);
  if (ply <= 0) return null;
  return {
    game: index,
    before: names(game.moves.slice(0, ply - 1)),
    played: name(game.moves[ply - 1]),
    source: game.sources[ply - 1],
    refutation: name(game.moves[ply]),
    mateIn: 30_000 - game.scores[ply]!,
  };
}

/** Normalised games, with everything the report prints. */
export function analyseAttackGames(raw: Array<TAttackGame>, plies: number) {
  const games = raw.map((game) => ({ ...game, moves: normalise(game.moves) }));
  const won = games.filter((game) => game.winner == 0);
  const mates = games.map(firstMate).filter((ply) => ply > 0);
  const mistakes = games.map(mistakeOf).filter((mistake) => mistake != null);
  const summary = {
    games: games.length,
    attackerWon: won.length,
    hellWon: games.filter((game) => game.winner == 1).length,
    bookMoves: histogram(games.map((g) => g.sources.filter((s) => s == 'book').length)),
    firstMateMove: histogram(mates.map((ply) => ply / 2 + 1)),
    mistakeSource: histogram(mistakes.map((mistake) => mistake.source ?? 'none')),
    mateLength: histogram(mistakes.map((mistake) => mistake.mateIn)),
    finalFours: histogram(won.map(finalFours)),
    wonLength: histogram(won.map((g) => g.moves.length)),
  };
  return { games, summary, tree: openingTree(games, plies), mistakes };
}

/** Writes analysis.json and mistakes.jsonl (replaced) and appends a line to history.jsonl. */
export function saveAnalysis(
  analysis: ReturnType<typeof analyseAttackGames>,
  dir = dirname(ATTACK_FILE)
) {
  const book = readFileSync(BOOK_FILE);
  const meta = (JSON.parse(book.toString()) as { meta?: unknown }).meta ?? null;
  const bookInfo = { hash: createHash('sha256').update(book).digest('hex').slice(0, 12), meta };
  const at = new Date().toISOString();
  const games = analysis.games.map((game) => ({ ...game, names: names(game.moves) }));
  const full = { at, book: bookInfo, ...analysis, games };
  writeFileSync(join(dir, 'analysis.json'), JSON.stringify(full, null, 1));
  writeFileSync(
    join(dir, 'mistakes.jsonl'),
    analysis.mistakes.map((mistake) => JSON.stringify(mistake)).join('\n') + '\n'
  );
  appendFileSync(
    join(dir, 'history.jsonl'),
    JSON.stringify({ at, book: bookInfo, ...analysis.summary }) + '\n'
  );
  return dir;
}
