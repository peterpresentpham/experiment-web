import { CELL, TMaze, TMazeConfig } from 'src/types/maze.type';

/**
 * Ensure rows and cols are odd numbers (required for recursive backtracking).
 */
function ensureOdd(value: number): number {
  return value % 2 === 0 ? value + 1 : value;
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

type TDir = [number, number];

const DIRECTIONS: TDir[] = [
  [-2, 0], // up
  [2, 0], // down
  [0, -2], // left
  [0, 2], // right
];

/**
 * Carve a path at (row, col) and recursively carve in random directions.
 */
function carve(maze: TMaze, row: number, col: number): void {
  const rows = maze.length;
  const cols = maze[0].length;

  const shuffled = shuffleArray([...DIRECTIONS]);

  for (const [dr, dc] of shuffled) {
    const nr = row + dr;
    const nc = col + dc;

    // Check if the cell two steps away is within bounds and is a wall
    if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === CELL.WALL) {
      // Carve the wall between current cell and target cell
      maze[row + dr / 2][col + dc / 2] = CELL.PATH;
      // Carve the target cell
      maze[nr][nc] = CELL.PATH;
      // Recursively carve from target cell
      carve(maze, nr, nc);
    }
  }
}

/**
 * Generate a maze using Recursive Backtracking algorithm.
 *
 * @param config - Maze configuration (rows and cols will be forced to odd numbers)
 * @returns A 2D maze matrix where CELL.WALL (1) = wall, CELL.PATH (0) = path
 */
export function generateMaze(config: TMazeConfig): TMaze {
  if (config.rows < 3 || config.cols < 3) {
    throw new Error('Maze dimensions must be at least 3x3');
  }

  const rows = ensureOdd(config.rows);
  const cols = ensureOdd(config.cols);

  // Step 1: Initialize maze with all walls
  const maze: TMaze = Array.from({ length: rows }, () => Array(cols).fill(CELL.WALL));

  // Step 2: Choose a random odd starting cell
  const startRow = 1 + 2 * Math.floor(Math.random() * ((rows - 1) / 2));
  const startCol = 1 + 2 * Math.floor(Math.random() * ((cols - 1) / 2));

  // Step 3: Carve the starting cell
  maze[startRow][startCol] = CELL.PATH;

  // Step 4: Recursively carve paths
  carve(maze, startRow, startCol);

  return maze;
}
