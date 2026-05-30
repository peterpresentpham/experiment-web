import { generateMaze } from 'src/structure/maze/mazeGenerator';
import {
  ensureStartEndArePath,
  findAllReachableCells,
  solveMazeBFS,
  validateMazeInput,
} from 'src/structure/maze/mazeSolver';
import { CELL, TCell } from 'src/types/maze.type';
import { describe, expect, it } from 'vitest';

describe('validateMazeInput', () => {
  const maze = generateMaze({ rows: 9, cols: 9 });

  it('should return null for valid input', () => {
    const error = validateMazeInput(maze, { row: 1, col: 1 }, { row: 7, col: 7 });
    expect(error).toBeNull();
  });

  it('should return error when start is out of bounds', () => {
    const error = validateMazeInput(maze, { row: -1, col: 1 }, { row: 7, col: 7 });
    expect(error).toBe('Start position is out of maze bounds.');
  });

  it('should return error when end is out of bounds', () => {
    const error = validateMazeInput(maze, { row: 1, col: 1 }, { row: 100, col: 100 });
    expect(error).toBe('End position is out of maze bounds.');
  });

  it('should return error when start equals end', () => {
    const error = validateMazeInput(maze, { row: 1, col: 1 }, { row: 1, col: 1 });
    expect(error).toBe('Start and end positions must be different.');
  });

  it('should return error for empty maze', () => {
    const error = validateMazeInput([], { row: 1, col: 1 }, { row: 7, col: 7 });
    expect(error).toBe('Maze is empty.');
  });
});

describe('ensureStartEndArePath', () => {
  it('should carve start and end cells if they are walls', () => {
    const maze = generateMaze({ rows: 9, cols: 9 });
    // Pick a wall cell
    const wallPos: TCell = { row: 0, col: 0 }; // border is always wall
    const result = ensureStartEndArePath(maze, wallPos, { row: 1, col: 1 });
    expect(result[0][0]).toBe(CELL.PATH);
    expect(result[1][1]).toBe(CELL.PATH);
  });

  it('should not mutate the original maze', () => {
    const maze = generateMaze({ rows: 9, cols: 9 });
    const original = maze.map((row) => [...row]);
    ensureStartEndArePath(maze, { row: 0, col: 0 }, { row: 1, col: 1 });
    expect(maze).toEqual(original);
  });
});

describe('solveMazeBFS', () => {
  it('should find a path in a valid maze', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });
    const path = solveMazeBFS(maze, { row: 1, col: 1 }, { row: 9, col: 9 });
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
  });

  it('should return path starting and ending at the correct cells', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });
    const start: TCell = { row: 1, col: 1 };
    const end: TCell = { row: 9, col: 9 };
    const path = solveMazeBFS(maze, start, end);

    expect(path).not.toBeNull();
    expect(path![0].row).toBe(start.row);
    expect(path![0].col).toBe(start.col);
    expect(path![path!.length - 1].row).toBe(end.row);
    expect(path![path!.length - 1].col).toBe(end.col);
  });

  it('should return a path where every step is adjacent', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });
    const start: TCell = { row: 1, col: 1 };
    const end: TCell = { row: 9, col: 9 };
    const path = solveMazeBFS(maze, start, end);

    expect(path).not.toBeNull();

    for (let i = 1; i < path!.length; i++) {
      const dr = Math.abs(path![i].row - path![i - 1].row);
      const dc = Math.abs(path![i].col - path![i - 1].col);
      // Must be exactly 1 step away in one direction
      expect((dr === 1 && dc === 0) || (dr === 0 && dc === 1)).toBe(true);
    }
  });

  it('should return the shortest path (BFS property)', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });
    const start: TCell = { row: 1, col: 1 };
    const end: TCell = { row: 9, col: 9 };
    const path = solveMazeBFS(maze, start, end);

    expect(path).not.toBeNull();

    // Verify no duplicates (BFS shortest path shouldn't revisit cells)
    const seen = new Set<string>();
    for (const cell of path!) {
      const key = `${cell.row},${cell.col}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('should return null when start and end are the same', () => {
    const maze = generateMaze({ rows: 9, cols: 9 });
    const path = solveMazeBFS(maze, { row: 1, col: 1 }, { row: 1, col: 1 });
    expect(path).toBeNull();
  });

  it('should return null when start is out of bounds', () => {
    const maze = generateMaze({ rows: 9, cols: 9 });
    const path = solveMazeBFS(maze, { row: -1, col: 1 }, { row: 7, col: 7 });
    expect(path).toBeNull();
  });
});

describe('findAllReachableCells', () => {
  it('should return all path cells when called from any path cell', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });

    // Count total path cells
    const totalPathCells = maze.flat().filter((c) => c === CELL.PATH).length;

    const reachable = findAllReachableCells(maze, { row: 1, col: 1 });
    expect(reachable.length).toBe(totalPathCells);
  });

  it('should return empty array for out-of-bounds start', () => {
    const maze = generateMaze({ rows: 9, cols: 9 });
    const reachable = findAllReachableCells(maze, { row: -1, col: -1 });
    expect(reachable).toEqual([]);
  });
});
