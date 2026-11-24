import {
  findBookMove,
  openingKey,
  parseOpeningBook,
  TBookStone,
  TOpeningBook,
} from 'src/services/caro-tengen/opening-book';
import { TTurn } from 'src/types/caro.type';
import { describe, expect, it } from 'vitest';

// The eight symmetries, applied around the origin.
const SYMMETRIES: Array<(r: number, c: number) => [number, number]> = [
  (r, c) => [r, c],
  (r, c) => [c, -r],
  (r, c) => [-r, -c],
  (r, c) => [-c, r],
  (r, c) => [r, -c],
  (r, c) => [-r, c],
  (r, c) => [c, r],
  (r, c) => [-c, -r],
];

function place(stones: Array<TBookStone>, symmetry: number, dr: number, dc: number) {
  return stones.map((stone) => {
    const [row, column] = SYMMETRIES[symmetry](stone.row, stone.column);
    return { ...stone, row: row + dr, column: column + dc };
  });
}

const POSITION: Array<TBookStone> = [
  { row: 0, column: 0, own: false },
  { row: 1, column: 1, own: true },
  { row: 0, column: 2, own: false },
];

describe('openingKey', () => {
  it('is the same for every symmetry and translation of a position', () => {
    const key = openingKey(POSITION).key;
    for (let symmetry = 0; symmetry < 8; symmetry++)
      expect(openingKey(place(POSITION, symmetry, 7, 4)).key).toBe(key);
  });

  it('tells the side to move apart', () => {
    const swapped = POSITION.map((stone) => ({ ...stone, own: !stone.own }));
    expect(openingKey(swapped).key).not.toBe(openingKey(POSITION).key);
  });

  it('maps a move to the canonical frame and back', () => {
    for (let symmetry = 0; symmetry < 8; symmetry++) {
      const stones = place(POSITION, symmetry, 9, 6);
      const { toReal, toCanonical } = openingKey(stones);
      const [row, column] = toCanonical(12, 3);
      expect(toReal(row, column)).toEqual([12, 3]);
    }
  });
});

describe('findBookMove', () => {
  // Book built from POSITION: the move one cell below the own stone.
  const { key, toCanonical } = openingKey(POSITION);
  const book: TOpeningBook = new Map([[key, [toCanonical(2, 1)]]]);

  function request(stones: Array<TBookStone>, size: number) {
    const steps: { [location: number]: TTurn } = {};
    // The side to move is turn 1, so own stones are turn 1.
    for (const stone of stones) steps[stone.row * size + stone.column] = stone.own ? 1 : 0;
    return { steps, size, winMode: 'blockOpponent' as const, turn: 1 as TTurn };
  }

  it('finds the same move wherever the position sits and however it is turned', () => {
    for (let symmetry = 0; symmetry < 8; symmetry++) {
      const stones = place(POSITION, symmetry, 8, 9);
      const [row, column] = SYMMETRIES[symmetry](2, 1);
      const expected = (row + 8) * 20 + (column + 9);
      expect(findBookMove(book, request(stones, 20))).toBe(expected);
    }
  });

  it('serves a 15x15 board from the same book', () => {
    expect(findBookMove(book, request(place(POSITION, 0, 6, 6), 15))).toBe((2 + 6) * 15 + 7);
  });

  it('skips positions near an edge, other rules and unknown positions', () => {
    expect(findBookMove(book, request(place(POSITION, 0, 1, 6), 15))).toBeUndefined();
    expect(
      findBookMove(book, { ...request(place(POSITION, 0, 6, 6), 15), winMode: 'non-blockOpponent' })
    ).toBeUndefined();
    expect(findBookMove(book, request(POSITION.slice(1), 15))).toBeUndefined();
  });

  it('picks among equally good moves and skips moves to avoid', () => {
    const stones = place(POSITION, 0, 8, 9);
    const at = (row: number, column: number) => (row + 8) * 20 + (column + 9);
    const varied: TOpeningBook = new Map([[key, [toCanonical(2, 1), toCanonical(-1, 1)]]]);
    expect(findBookMove(varied, request(stones, 20), () => 0)).toBe(at(2, 1));
    expect(findBookMove(varied, request(stones, 20), () => 0.99)).toBe(at(-1, 1));
    const avoid = new Set([at(2, 1)]);
    expect(findBookMove(varied, { ...request(stones, 20), avoid }, () => 0)).toBe(at(-1, 1));
    const both = new Set([at(2, 1), at(-1, 1)]);
    expect(findBookMove(varied, { ...request(stones, 20), avoid: both })).toBeUndefined();
  });

  it('reads a version 1 book, one move per entry', () => {
    const file = {
      version: 1 as const,
      winMode: 'blockOpponent' as const,
      entries: { a: [1, 2] as [number, number] },
    };
    expect(parseOpeningBook(file).get('a')).toEqual([[1, 2]]);
  });

  it('opens in the centre', () => {
    expect(findBookMove(book, { steps: {}, size: 15, winMode: 'blockOpponent', turn: 0 })).toBe(
      112
    );
  });
});
