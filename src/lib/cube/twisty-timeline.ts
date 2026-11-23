/** Where each move starts and ends on the timeline, in ms. */
export type TMoveTimes = { starts: Array<number>; ends: Array<number> };

/** The move about to play, or playing, at `timestamp`: the count of moves already finished. */
export function nextMoveIndex(times: TMoveTimes, timestamp: number) {
  return times.ends.filter((end) => end <= timestamp + 0.5).length;
}

/**
 * Where a step in `direction` starts from. In the middle of a move (a step pressed while one
 * plays), that move first finishes (forwards) or is undone (backwards), so no press is lost.
 */
export function stepOrigin(times: TMoveTimes, timestamp: number, direction: 1 | -1) {
  const index = nextMoveIndex(times, timestamp);
  const start = times.starts[index];
  if (start == undefined || timestamp <= start + 0.5) return timestamp;
  return direction == 1 ? times.ends[index] : start;
}
