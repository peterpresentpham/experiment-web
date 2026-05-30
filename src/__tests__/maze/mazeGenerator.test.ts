import { generateMaze } from 'src/structure/maze/mazeGenerator';
import { CELL } from 'src/types/maze.type';
import { describe, expect, it } from 'vitest';

describe('generateMaze', () => {
  it('should return a maze with the correct dimensions (odd enforced)', () => {
    const maze = generateMaze({ rows: 10, cols: 10 });
    expect(maze.length).toBe(11); // 10 → 11 (odd)
    expect(maze[0].length).toBe(11);
  });

  it('should return a maze with the correct dimensions when already odd', () => {
    const maze = generateMaze({ rows: 11, cols: 15 });
    expect(maze.length).toBe(11);
    expect(maze[0].length).toBe(15);
  });

  it('should throw for dimensions smaller than 3x3', () => {
    expect(() => generateMaze({ rows: 2, cols: 2 })).toThrow();
  });

  it('should have all borders as walls', () => {
    const maze = generateMaze({ rows: 9, cols: 9 });
    const rows = maze.length;
    const cols = maze[0].length;

    // Top and bottom borders
    for (let c = 0; c < cols; c++) {
      expect(maze[0][c]).toBe(CELL.WALL);
      expect(maze[rows - 1][c]).toBe(CELL.WALL);
    }

    // Left and right borders
    for (let r = 0; r < rows; r++) {
      expect(maze[r][0]).toBe(CELL.WALL);
      expect(maze[r][cols - 1]).toBe(CELL.WALL);
    }
  });

  it('should have at least some path cells', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });
    const pathCount = maze.flat().filter((cell) => cell === CELL.PATH).length;
    expect(pathCount).toBeGreaterThan(0);
  });

  it('should have at least one path cell at an odd coordinate', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });
    let foundOddPath = false;
    for (let r = 1; r < maze.length; r += 2) {
      for (let c = 1; c < maze[0].length; c += 2) {
        if (maze[r][c] === CELL.PATH) {
          foundOddPath = true;
        }
      }
    }
    expect(foundOddPath).toBe(true);
  });

  it('should produce different mazes on successive calls', () => {
    const maze1 = generateMaze({ rows: 11, cols: 11 });
    const maze2 = generateMaze({ rows: 11, cols: 11 });

    const flat1 = maze1.flat().join(',');
    const flat2 = maze2.flat().join(',');
    // Very unlikely to be identical (randomness)
    expect(flat1).not.toBe(flat2);
  });

  it('should produce a fully connected maze (all path cells reachable from any path cell)', () => {
    const maze = generateMaze({ rows: 11, cols: 11 });

    // Find all path cells
    const pathCells: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[0].length; c++) {
        if (maze[r][c] === CELL.PATH) {
          pathCells.push({ row: r, col: c });
        }
      }
    }

    expect(pathCells.length).toBeGreaterThan(0);

    // BFS from first path cell to count reachable path cells
    const visited = new Set<string>();
    const queue: Array<{ row: number; col: number }> = [pathCells[0]];
    visited.add(`${pathCells[0].row},${pathCells[0].col}`);

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (queue.length > 0) {
      const { row, col } = queue.shift()!;
      for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        const key = `${nr},${nc}`;
        if (
          nr >= 0 &&
          nr < maze.length &&
          nc >= 0 &&
          nc < maze[0].length &&
          !visited.has(key) &&
          maze[nr][nc] === CELL.PATH
        ) {
          visited.add(key);
          queue.push({ row: nr, col: nc });
        }
      }
    }

    // All path cells should be reachable
    expect(visited.size).toBe(pathCells.length);
  });
});
