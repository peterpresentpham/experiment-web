/* eslint-disable no-console -- command-line script */
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { parseNumber } from './common';
import { ATTACK_FILE, readAttackGames } from './hell-attack';
import { analyseAttackGames, name, saveAnalysis } from './hell-attack-analysis';

/**
 * Turns the games of `hell-attack.ts` into what the caro guide says about beating the Hell level:
 * - the opening tree, with every game turned (one of the 8 symmetries around the centre) so the
 *   Hell level's first reply is j10: how often each line was played and won;
 * - when the attacker first saw a forced win, and which Hell move allowed it (book or engine);
 * - how games were finished: the length of the final run of fours (a VCF).
 *
 *   node --import tsx scripts/caro-hell/hell-attack-report.ts --plies 5
 *
 * The analysis is saved next to the games (analysis.json, mistakes.jsonl, history.jsonl; see
 * hell-attack-analysis.ts) for later training rounds; `--no-save` only prints it, `--json`
 * also writes the full analysis elsewhere.
 */

function main() {
  const { values } = parseArgs({
    options: {
      file: { type: 'string', default: ATTACK_FILE },
      plies: { type: 'string', default: '5' },
      json: { type: 'string' },
      'no-save': { type: 'boolean', default: false },
    },
  });
  const analysis = analyseAttackGames(readAttackGames(values.file), parseNumber(values.plies, 5));
  const { summary, tree, mistakes } = analysis;
  console.log(
    `[report] ${summary.games} games, attacker won ${summary.attackerWon}, Hell won ${summary.hellWon}`
  );
  console.log(`[report] Hell book moves per game: ${JSON.stringify(summary.bookMoves)}`);
  console.log(
    `[report] attacker's move number when it first saw a forced win: ${JSON.stringify(summary.firstMateMove)}`
  );
  console.log(
    `[report] the Hell move that allowed it came from: ${JSON.stringify(summary.mistakeSource)} (${mistakes.length} games)`
  );
  console.log(
    `[report] forced win length (plies) when first seen: ${JSON.stringify(summary.mateLength)}`
  );
  for (const node of tree) {
    const average = node.firstMate.length
      ? (node.firstMate.reduce((sum, value) => sum + value, 0) / node.firstMate.length).toFixed(1)
      : '-';
    console.log(
      `[tree] ${'  '.repeat(node.line.length - 1)}${node.line.at(-1)}  ${node.won}/${node.games} won, forced win seen at own move ${average}`
    );
  }
  console.log(`[report] final run of fours in won games: ${JSON.stringify(summary.finalFours)}`);
  console.log(`[report] game length (plies) of won games: ${JSON.stringify(summary.wonLength)}`);

  if (!values['no-save']) console.log(`[report] analysis saved to ${saveAnalysis(analysis)}`);
  if (values.json)
    writeFileSync(
      values.json,
      JSON.stringify(
        { ...analysis, games: analysis.games.map((g) => ({ ...g, names: g.moves.map(name) })) },
        null,
        1
      )
    );
}

main();
