import { CELL, TCell, TMaze } from 'src/types/maze.type';

/**
 * Check if a cell is within maze bounds.
 */
function isInBounds(maze: TMaze, cell: TCell): boolean {
  return cell.row >= 0 && cell.row < maze.length && cell.col >= 0 && cell.col < maze[0].length;
}

/**
 * Check if a cell is a valid path (not a wall).
 */
function isPath(maze: TMaze, cell: TCell): boolean {
  return isInBounds(maze, cell) && maze[cell.row][cell.col] === CELL.PATH;
}

/**
 * Convert a cell to a string key for map lookups.
 */
function cellKey(cell: TCell): string {
  return `${cell.row},${cell.col}`;
}

const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

/**
 * Check if a cell is within maze bounds.
 */
function isCellInBounds(maze: TMaze, cell: TCell): boolean {
  return isInBounds(maze, cell);
}

/**
 * Ensure start and end cells are passable (not walls).
 * If a cell is a wall, it will be carved into a path.
 * Returns a new maze (does not mutate the original).
 */
export function ensureStartEndArePath(maze: TMaze, start: TCell, end: TCell): TMaze {
  const copy = maze.map((row) => [...row]);

  if (isInBounds(maze, start)) {
    copy[start.row][start.col] = CELL.PATH;
  }
  if (isInBounds(maze, end)) {
    copy[end.row][end.col] = CELL.PATH;
  }

  return copy;
}

/**
 * Validate that the maze and start/end cells are usable.
 *
 * @returns An error string if invalid, or null if valid.
 */
export function validateMazeInput(maze: TMaze, start: TCell, end: TCell): string | null {
  if (!maze || maze.length === 0 || maze[0].length === 0) {
    return 'Maze is empty.';
  }

  if (!isCellInBounds(maze, start)) {
    return 'Start position is out of maze bounds.';
  }

  if (!isCellInBounds(maze, end)) {
    return 'End position is out of maze bounds.';
  }

  if (start.row === end.row && start.col === end.col) {
    return 'Start and end positions must be different.';
  }

  return null;
}

/**
 * Solve a maze using Breadth-First Search (BFS).
 * Returns an array of cells from start to end (inclusive), or null if no path exists.
 */
export function solveMazeBFS(maze: TMaze, start: TCell, end: TCell): TCell[] | null {
  const validationError = validateMazeInput(maze, start, end);
  if (validationError) {
    return null;
  }

  // Ensure start and end are passable
  const workingMaze = ensureStartEndArePath(maze, start, end);

  if (!isPath(workingMaze, start) || !isPath(workingMaze, end)) {
    return null;
  }

  const visited = new Set<string>();
  const parentMap = new Map<string, TCell | null>();
  const queue: TCell[] = [start];

  visited.add(cellKey(start));
  parentMap.set(cellKey(start), null);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Reached the end
    if (current.row === end.row && current.col === end.col) {
      return reconstructPath(parentMap, end);
    }

    for (const [dr, dc] of DIRECTIONS) {
      const neighbor: TCell = { row: current.row + dr, col: current.col + dc };
      const key = cellKey(neighbor);

      if (!visited.has(key) && isPath(workingMaze, neighbor)) {
        visited.add(key);
        parentMap.set(key, current);
        queue.push(neighbor);
      }
    }
  }

  // No path found
  return null;
}

/**
 * Reconstruct the path from the parent map.
 */
function reconstructPath(parentMap: Map<string, TCell | null>, end: TCell): TCell[] {
  const path: TCell[] = [];
  let current: TCell | null = end;

  while (current !== null) {
    path.unshift(current);
    const key = cellKey(current);
    current = parentMap.get(key) ?? null;
  }

  return path;
}

/**
 * Find all reachable cells from a starting point using flood-fill (BFS).
 * Useful for highlighting to the user which cells are accessible.
 */
export function findAllReachableCells(maze: TMaze, start: TCell): TCell[] {
  if (!isInBounds(maze, start)) return [];

  const workingMaze = ensureStartEndArePath(maze, start, start);

  if (!isPath(workingMaze, start)) return [];

  const visited = new Set<string>();
  const reachable: TCell[] = [];
  const queue: TCell[] = [start];

  visited.add(cellKey(start));

  while (queue.length > 0) {
    const current = queue.shift()!;
    reachable.push(current);

    for (const [dr, dc] of DIRECTIONS) {
      const neighbor: TCell = { row: current.row + dr, col: current.col + dc };
      const key = cellKey(neighbor);

      if (!visited.has(key) && isPath(workingMaze, neighbor)) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return reachable;
}
