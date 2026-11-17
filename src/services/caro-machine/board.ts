import { TCaroWinMode } from 'src/types/caro.type';
import { combinePatterns, getPattern, LINE_RADIUS } from './pattern';

/** Stone owners on the engine board. 0 is an empty cell. */
export type TStone = 1 | 2;

export type TCandidate = {
  index: number;
  /** Score for the side to move playing here. */
  attack: number;
  attackFlags: number;
  /** Score for the opponent playing here, i.e. how much this cell is worth blocking. */
  defense: number;
  defenseFlags: number;
};

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;
const LINE_CELLS = LINE_RADIUS * 2;
const NEAR_RADIUS = 2;
const OFF_BOARD = -1;

// Deterministic PRNG so Zobrist keys are reproducible between runs.
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) | 0;
  };
}

export function opponentOf(stone: TStone): TStone {
  return stone == 1 ? 2 : 1;
}

/** Mutable board used by the search, with cached geometry and an incremental Zobrist hash. */
export class MachineBoard {
  readonly size: number;
  readonly area: number;
  readonly winMode: TCaroWinMode;
  readonly cells: Int8Array;
  readonly stones: Array<number> = [];
  hash = 0;
  hashCheck = 0;

  // lines[(cell * 4 + direction) * 10 + k]: neighbour index or OFF_BOARD.
  private readonly lines: Int16Array;
  private readonly near: Array<Int16Array>;
  private readonly zobristKey: Int32Array;
  private readonly zobristCheck: Int32Array;
  private readonly marks: Int32Array;
  private generation = 0;
  private readonly patternBuffer = new Uint8Array(4);
  private readonly flagsOut = { flags: 0 };

  constructor(size: number, winMode: TCaroWinMode) {
    this.size = size;
    this.area = size * size;
    this.winMode = winMode;
    this.cells = new Int8Array(this.area);
    this.marks = new Int32Array(this.area);
    this.lines = new Int16Array(this.area * 4 * LINE_CELLS);
    this.near = [];

    for (let cell = 0; cell < this.area; cell++) {
      const row = Math.floor(cell / size);
      const column = cell % size;
      DIRECTIONS.forEach(([dRow, dColumn], direction) => {
        let k = 0;
        for (let offset = -LINE_RADIUS; offset <= LINE_RADIUS; offset++) {
          if (offset == 0) continue;
          const r = row + dRow * offset;
          const c = column + dColumn * offset;
          const isInside = r >= 0 && r < size && c >= 0 && c < size;
          this.lines[(cell * 4 + direction) * LINE_CELLS + k] = isInside ? r * size + c : OFF_BOARD;
          k++;
        }
      });

      const near: Array<number> = [];
      for (let dRow = -NEAR_RADIUS; dRow <= NEAR_RADIUS; dRow++) {
        for (let dColumn = -NEAR_RADIUS; dColumn <= NEAR_RADIUS; dColumn++) {
          const r = row + dRow;
          const c = column + dColumn;
          if ((dRow || dColumn) && r >= 0 && r < size && c >= 0 && c < size) {
            near.push(r * size + c);
          }
        }
      }
      this.near.push(Int16Array.from(near));
    }

    const random = mulberry32(size * 7919 + (winMode == 'blockOpponent' ? 1 : 2));
    this.zobristKey = new Int32Array(this.area * 2).map(() => random());
    this.zobristCheck = new Int32Array(this.area * 2).map(() => random());
  }

  place(cell: number, stone: TStone) {
    this.cells[cell] = stone;
    this.stones.push(cell);
    const z = cell * 2 + stone - 1;
    this.hash ^= this.zobristKey[z];
    this.hashCheck ^= this.zobristCheck[z];
  }

  undo() {
    const cell = this.stones.pop();
    if (cell == undefined) return;
    const z = cell * 2 + this.cells[cell] - 1;
    this.hash ^= this.zobristKey[z];
    this.hashCheck ^= this.zobristCheck[z];
    this.cells[cell] = 0;
  }

  private lineCode(cell: number, direction: number, stone: TStone) {
    const base = (cell * 4 + direction) * LINE_CELLS;
    let code = 0;
    for (let k = 0; k < LINE_CELLS; k++) {
      const neighbour = this.lines[base + k];
      let value: number;
      if (neighbour == OFF_BOARD) value = 3;
      else {
        const owner = this.cells[neighbour];
        value = owner == 0 ? 0 : owner == stone ? 1 : 2;
      }
      code |= value << (k * 2);
    }
    return code;
  }

  /** Line pattern `stone` would form on `cell` along one direction. */
  patternAt(cell: number, direction: number, stone: TStone) {
    return getPattern(this.lineCode(cell, direction, stone), this.winMode);
  }

  /** Heuristic value of `stone` playing on the empty `cell`; flags go to `out`. */
  evaluateCell(cell: number, stone: TStone, out: { flags: number } = this.flagsOut) {
    for (let direction = 0; direction < 4; direction++) {
      this.patternBuffer[direction] = this.patternAt(cell, direction, stone);
    }
    return combinePatterns(this.patternBuffer, out);
  }

  /** Empty cells within two steps of any stone; the center when the board is empty. */
  candidateCells() {
    if (this.stones.length == 0)
      return [Math.floor(this.size / 2) * this.size + Math.floor(this.size / 2)];
    this.generation++;
    const result: Array<number> = [];
    for (const stone of this.stones) {
      const near = this.near[stone];
      for (let i = 0; i < near.length; i++) {
        const cell = near[i];
        if (this.cells[cell] != 0 || this.marks[cell] == this.generation) continue;
        this.marks[cell] = this.generation;
        result.push(cell);
      }
    }
    return result;
  }

  /** Scores every candidate cell for both the side to move and its opponent. */
  scoreCandidates(side: TStone): Array<TCandidate> {
    const opponent = opponentOf(side);
    const out = { flags: 0 };
    return this.candidateCells().map((index) => {
      const attack = this.evaluateCell(index, side, out);
      const attackFlags = out.flags;
      const defense = this.evaluateCell(index, opponent, out);
      return { index, attack, attackFlags, defense, defenseFlags: out.flags };
    });
  }
}
