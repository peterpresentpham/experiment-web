import { TPikachuNewBoard } from 'src/types/pikachu.type';
import { randomSubGroup } from '..';
import { findPathWithoutTarget } from './move.utils';

function __refineNumTypes(halfCells: number, maxNumTypes: number, percent: number) {
  const newNumTypes = Math.min(maxNumTypes, Math.floor(halfCells * percent));
  return newNumTypes;
}

export function _refineNumTypes(halfCells: number, numTypes: number) {
  if (halfCells >= 2 * numTypes) return numTypes;
  if (halfCells <= 25) {
    const random = Math.random();
    if (random < 0.2) return halfCells - 1;
    else return halfCells;
  } else if (halfCells <= 50) {
    const random = 0.85 + 0.15 * Math.random();
    return __refineNumTypes(halfCells, numTypes, random);
  } else return __refineNumTypes(halfCells, numTypes, 0.5);
}

function _createRawBoard(totalCells: number, numTypes: number, percent?: number) {
  if (totalCells % 2 !== 0)
    throw new Error('Total number of cells must be even for matching pairs.');

  const tileIds: Array<number> = [];
  const halfCells = totalCells / 2;
  const refinedNumTypes = percent
    ? __refineNumTypes(halfCells, numTypes, percent)
    : _refineNumTypes(halfCells, numTypes);

  const _arr = randomSubGroup(numTypes);
  for (let i = 0; i < halfCells; i++) {
    const id = i % refinedNumTypes;
    tileIds.push(_arr[id] + 1);
  }

  const pairedTiles = [...tileIds, ...tileIds];
  for (let i = pairedTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairedTiles[i], pairedTiles[j]] = [pairedTiles[j], pairedTiles[i]];
  }
  return pairedTiles;
}

function createBoard(rows: number, cols: number, numTypes: number): Array<Array<number>> {
  const pairedTiles = _createRawBoard(rows * cols, numTypes);

  const board: Array<Array<number>> = [];
  for (let r = 0; r < rows; r++) {
    const row = pairedTiles.slice(r * cols, (r + 1) * cols);
    board.push(row);
  }
  return board;
}

function _createNewPikachuBoard(params: TPikachuNewBoard) {
  const { numberOfRows, numberOfColumns, numTypes } = params;
  const rawBoard = createBoard(numberOfRows, numberOfColumns, numTypes);
  const board: Array<Array<number>> = [];
  board.push(Array(numberOfColumns + 2).fill(0));
  rawBoard.forEach((row) => {
    board.push([0, ...row, 0]);
  });
  board.push(Array(numberOfColumns + 2).fill(0));
  return board;
}

export function createNewPikachuBoard(params: TPikachuNewBoard & { numberOfLines: number }) {
  const { numberOfRows, numberOfColumns, numTypes, numberOfLines } = params;
  let board = _createNewPikachuBoard({ numberOfRows, numberOfColumns, numTypes });
  let path = findPathWithoutTarget({ numberOfRows, numberOfColumns, board, numberOfLines });
  while (!path) {
    board = _createNewPikachuBoard({ numberOfRows, numberOfColumns, numTypes });
    path = findPathWithoutTarget({ numberOfRows, numberOfColumns, board, numberOfLines });
  }
  return { board, path };
}

function _changePikachuBoard(params: TPikachuNewBoard & { currentBoard: Array<Array<number>> }) {
  const { numberOfRows, numberOfColumns, numTypes, currentBoard } = params;
  let totalCells = 0;
  const values: { [key: number]: number } = {};
  for (let i = 1; i <= numberOfRows; i++) {
    for (let j = 1; j <= numberOfColumns; j++) {
      const _value = currentBoard[i][j];
      if (_value > 0) {
        totalCells++;
        if (values[_value]) values[_value] = values[_value] + 1;
        else values[_value] = 1;
      }
    }
  }
  let totalFourCells = 0;
  for (const value of Object.values(values)) {
    if (value == 4) totalFourCells++;
  }
  const pairedTiles = _createRawBoard(totalCells, numTypes, 1 - (2 * totalFourCells) / totalCells);
  const rawBoard: Array<Array<number>> = [];
  let index = 0;
  for (let i = 0; i < numberOfRows; i++) {
    rawBoard.push([]);
    for (let j = 0; j < numberOfColumns; j++) {
      if (currentBoard[i + 1][j + 1] > 0) rawBoard[i].push(pairedTiles[index++]);
      else rawBoard[i].push(0);
    }
  }
  const board: Array<Array<number>> = [];
  board.push(Array(numberOfColumns + 2).fill(0));
  rawBoard.forEach((row) => {
    board.push([0, ...row, 0]);
  });
  board.push(Array(numberOfColumns + 2).fill(0));
  return board;
}

export function changePikachuBoard(
  params: TPikachuNewBoard & { currentBoard: Array<Array<number>>; numberOfLines: number }
) {
  const { currentBoard, numberOfRows, numberOfColumns, numTypes, numberOfLines } = params;
  let board = _changePikachuBoard({ currentBoard, numberOfRows, numberOfColumns, numTypes });
  let path = findPathWithoutTarget({ numberOfRows, numberOfColumns, board, numberOfLines });
  while (!path) {
    board = _changePikachuBoard({ currentBoard, numberOfRows, numberOfColumns, numTypes });
    path = findPathWithoutTarget({ numberOfRows, numberOfColumns, board, numberOfLines });
  }
  return { board, path };
}
