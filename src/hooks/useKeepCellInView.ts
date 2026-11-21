import { RefObject, useEffect } from 'react';

/**
 * For a board larger than its scroll container: scrolls the cell at `location` into view, or the
 * board's centre when there is no move yet. Cells are `cellSize` px with 1 px gaps, so a cell's
 * position follows from its index without measuring the DOM.
 */
export default function useKeepCellInView(
  scrollRef: RefObject<HTMLDivElement | null>,
  cellSize: number,
  boardSize: number,
  location: number | undefined
) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || cellSize <= 0) return;
    const fits =
      container.scrollWidth <= container.clientWidth &&
      container.scrollHeight <= container.clientHeight;
    if (fits) return;

    const center = Math.floor(boardSize / 2) * boardSize + Math.floor(boardSize / 2);
    const target = location ?? center;
    const step = cellSize + 1;
    const left = (target % boardSize) * step;
    const top = Math.floor(target / boardSize) * step;
    const isVisible = (start: number, scroll: number, view: number) =>
      start >= scroll && start + step <= scroll + view;

    if (
      location != undefined &&
      isVisible(left, container.scrollLeft, container.clientWidth) &&
      isVisible(top, container.scrollTop, container.clientHeight)
    )
      return;
    container.scrollTo({
      left: left + step / 2 - container.clientWidth / 2,
      top: top + step / 2 - container.clientHeight / 2,
      behavior: location == undefined ? 'auto' : 'smooth',
    });
  }, [scrollRef, cellSize, boardSize, location]);
}
