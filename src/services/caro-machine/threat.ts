import { MachineBoard, opponentOf, TStone } from './board';
import { CELL_FLAG } from './pattern';

/**
 * - vcf: victory by continuous fours, every attacking move makes a four.
 * - vct: victory by continuous threats, attacking moves may also make open threes.
 */
export type TThreatMode = 'vcf' | 'vct';

type TThreatContext = {
  board: MachineBoard;
  attacker: TStone;
  defender: TStone;
  mode: TThreatMode;
  nodes: number;
  budget: number;
  deadline: number;
};

const MAX_ATTACKS_PER_NODE = 12;

function isOutOfBudget(context: TThreatContext) {
  context.nodes++;
  if (context.nodes > context.budget) return true;
  return (context.nodes & 255) == 0 && performance.now() > context.deadline;
}

function attackerTurn(context: TThreatContext, depth: number): boolean {
  if (isOutOfBudget(context)) return false;
  const { board, attacker, mode } = context;
  const candidates = board.scoreCandidates(attacker);

  const defenderFives: Array<number> = [];
  const attacks: Array<{ index: number; score: number }> = [];
  const attackMask =
    mode == 'vcf'
      ? CELL_FLAG.FOUR
      : CELL_FLAG.FOUR | CELL_FLAG.OPEN_THREE | CELL_FLAG.DOUBLE_THREAT;
  for (const candidate of candidates) {
    if (candidate.attackFlags & CELL_FLAG.FIVE) return true;
    if (candidate.defenseFlags & CELL_FLAG.FIVE) defenderFives.push(candidate.index);
    if (candidate.attackFlags & attackMask) {
      attacks.push({ index: candidate.index, score: candidate.attack });
    }
  }

  if (defenderFives.length >= 2) return false;
  if (defenderFives.length == 1) {
    // Forced to block; the sequence survives only if the block keeps the pressure on.
    board.place(defenderFives[0], attacker);
    const result = defenderTurn(context, depth);
    board.undo();
    return result;
  }
  if (depth <= 0) return false;

  attacks.sort((a, b) => b.score - a.score);
  for (const { index } of attacks.slice(0, MAX_ATTACKS_PER_NODE)) {
    board.place(index, attacker);
    const result = defenderTurn(context, depth - 1);
    board.undo();
    if (result) return true;
  }
  return false;
}

function defenderTurn(context: TThreatContext, depth: number): boolean {
  if (isOutOfBudget(context)) return false;
  const { board, defender } = context;
  // Scored from the defender's point of view: attack = defender, defense = attacker.
  const candidates = board.scoreCandidates(defender);

  const attackerFives: Array<number> = [];
  let hasWinThreat = false;
  for (const candidate of candidates) {
    if (candidate.attackFlags & CELL_FLAG.FIVE) return false;
    if (candidate.defenseFlags & CELL_FLAG.FIVE) attackerFives.push(candidate.index);
    if (candidate.defenseFlags & CELL_FLAG.WIN_THREAT) hasWinThreat = true;
  }
  if (attackerFives.length >= 2) return true;

  let replies: Array<number>;
  if (attackerFives.length == 1) replies = attackerFives;
  else if (hasWinThreat) {
    // Any cell that touches the attacker's four-making lines, plus counter-fours.
    replies = candidates
      .filter(
        (candidate) =>
          candidate.defenseFlags & (CELL_FLAG.WIN_THREAT | CELL_FLAG.FOUR) ||
          candidate.attackFlags & CELL_FLAG.FOUR
      )
      .map((candidate) => candidate.index);
  } else return false;

  for (const reply of replies) {
    board.place(reply, defender);
    const result = attackerTurn(context, depth);
    board.undo();
    if (!result) return false;
  }
  return replies.length > 0;
}

/**
 * Looks for a forced win for `attacker`, who is to move.
 * Returns the first move of the winning sequence, or -1 when none is found within the budget.
 * Running out of budget is treated as "no win", so a returned move is always a proven win.
 */
export function findThreatWin(
  board: MachineBoard,
  attacker: TStone,
  options: { mode: TThreatMode; depth: number; budget: number; deadline: number }
) {
  const context: TThreatContext = {
    board,
    attacker,
    defender: opponentOf(attacker),
    mode: options.mode,
    nodes: 0,
    budget: options.budget,
    deadline: options.deadline,
  };
  const attackMask =
    options.mode == 'vcf'
      ? CELL_FLAG.FOUR
      : CELL_FLAG.FOUR | CELL_FLAG.OPEN_THREE | CELL_FLAG.DOUBLE_THREAT;

  const candidates = board.scoreCandidates(attacker);
  const win = candidates.find((candidate) => candidate.attackFlags & CELL_FLAG.FIVE);
  if (win) return win.index;
  if (candidates.some((candidate) => candidate.defenseFlags & CELL_FLAG.FIVE)) return -1;

  const attacks = candidates
    .filter((candidate) => candidate.attackFlags & attackMask)
    .sort((a, b) => b.attack - a.attack);
  for (const { index } of attacks) {
    board.place(index, attacker);
    const result = defenderTurn(context, options.depth - 1);
    board.undo();
    if (result) return index;
    if (context.nodes > context.budget || performance.now() > context.deadline) break;
  }
  return -1;
}

/** Cheap boolean VCF probe used at search leaves. */
export function hasVcf(board: MachineBoard, attacker: TStone, depth: number, budget: number) {
  return findThreatWin(board, attacker, { mode: 'vcf', depth, budget, deadline: Infinity }) != -1;
}
