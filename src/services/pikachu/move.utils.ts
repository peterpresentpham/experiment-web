import Queue from 'src/structure/Queue';
import { TPosition } from 'src/types/global';
import { TFindPath, TFindPathWithoutTarget } from 'src/types/pikachu.type';
import { isPositionEqual } from '..';

function reconstructPath(
  parent: (number[] | null)[][][],
  end: TPosition,
  endDir: number,
  start: TPosition
): TPosition[] {
  const path: TPosition[] = [];
  let [x, y] = end;
  let d = endDir;

  while (x !== start[0] || y !== start[1]) {
    path.push([x, y]);
    const p = parent[x][y][d];
    if (!p) break;
    const [px, py, pd] = p;
    x = px;
    y = py;
    d = pd;
  }

  path.push(start);
  path.reverse();
  return path;
}

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function findPath(params: TFindPath): Array<TPosition> | undefined {
  const { numberOfRows, numberOfColumns, board, sourcePiece, targetPiece, numberOfLines } = params;
  const [ax, ay] = sourcePiece;
  const [bx, by] = targetPiece;
  if (isPositionEqual(sourcePiece, targetPiece) || board[ax][ay] != board[bx][by]) return undefined;

  const parent: (number[] | null)[][][] = Array.from({ length: numberOfRows + 2 }, () =>
    Array.from({ length: numberOfColumns + 2 }, () => Array(4).fill(null))
  );
  const visited: boolean[][][] = Array.from({ length: numberOfRows + 2 }, () =>
    Array.from({ length: numberOfColumns + 2 }, () => Array(4).fill(false))
  );
  const queue = new Queue<[number, number, number, number]>(); // [row, column, direction, turn]
  for (let d = 0; d < 4; d++) {
    queue.enqueue([ax, ay, d, 0]);
    visited[ax][ay][d] = true;
  }
  while (!queue.isEmpty()) {
    const [x, y, d, turns] = queue.dequeue();
    const [dx, dy] = directions[d];
    let nx = x + dx;
    let ny = y + dy;

    // Continue moving in the same direction
    while (
      nx >= 0 &&
      nx <= numberOfRows + 1 &&
      ny >= 0 &&
      ny <= numberOfColumns + 1 &&
      (board[nx][ny] === 0 || (nx === bx && ny === by))
    ) {
      // Reached target B
      if (nx === bx && ny === by) {
        const path = reconstructPath(parent, [x, y], d, sourcePiece);
        path.push([nx, ny]);
        return path;
      }
      // Try all 4 directions
      for (let nd = 0; nd < 4; nd++) {
        const nturns = turns + (nd !== d ? 1 : 0);
        if (nturns <= numberOfLines && !visited[nx][ny][nd]) {
          visited[nx][ny][nd] = true;
          parent[nx][ny][nd] = [x, y, d];
          queue.enqueue([nx, ny, nd, nturns]);
        }
      }
      nx += dx;
      ny += dy;
    }
  }
  return undefined;
}

function _findPathWithoutTarget(
  params: Omit<TFindPath, 'targetPiece'>
): Array<TPosition> | undefined {
  const { numberOfRows, numberOfColumns, board, sourcePiece, numberOfLines } = params;
  const [ax, ay] = sourcePiece;
  const parent: (number[] | null)[][][] = Array.from({ length: numberOfRows + 2 }, () =>
    Array.from({ length: numberOfColumns + 2 }, () => Array(4).fill(null))
  );
  const visited: boolean[][][] = Array.from({ length: numberOfRows + 2 }, () =>
    Array.from({ length: numberOfColumns + 2 }, () => Array(4).fill(false))
  );
  const queue = new Queue<[number, number, number, number]>(); // [row, column, direction, turn]
  for (let d = 0; d < 4; d++) {
    queue.enqueue([ax, ay, d, 0]);
    visited[ax][ay][d] = true;
  }
  while (!queue.isEmpty()) {
    const [x, y, d, turns] = queue.dequeue();
    const [dx, dy] = directions[d];
    let nx = x + dx;
    let ny = y + dy;

    // Continue moving in the same direction
    while (
      nx >= 0 &&
      nx <= numberOfRows + 1 &&
      ny >= 0 &&
      ny <= numberOfColumns + 1 &&
      (board[nx][ny] === 0 || (board[nx][ny] == board[ax][ay] && (nx != ax || ny != ay)))
    ) {
      if (board[nx][ny] == board[ax][ay] && (nx != ax || ny != ay)) {
        const path = reconstructPath(parent, [x, y], d, sourcePiece);
        path.push([nx, ny]);
        return path;
      }

      // Try all 4 directions
      for (let nd = 0; nd < 4; nd++) {
        const nturns = turns + (nd !== d ? 1 : 0);
        if (nturns <= numberOfLines && !visited[nx][ny][nd]) {
          visited[nx][ny][nd] = true;
          parent[nx][ny][nd] = [x, y, d];
          queue.enqueue([nx, ny, nd, nturns]);
        }
      }

      nx += dx;
      ny += dy;
    }
  }
  return undefined;
}

export function findPathWithoutTarget(params: TFindPathWithoutTarget) {
  const { numberOfRows, numberOfColumns, board, numberOfLines } = params;
  let counter = 0;
  for (let i = 1; i <= numberOfRows; i++) {
    for (let j = 1; j <= numberOfColumns; j++) {
      if (board[i][j] > 0) {
        counter++;
        const path = _findPathWithoutTarget({
          numberOfRows,
          numberOfColumns,
          board,
          sourcePiece: [i, j],
          numberOfLines,
        });
        if (path) return path;
      }
    }
  }
  if (counter > 0) return null;
  return undefined;
}
