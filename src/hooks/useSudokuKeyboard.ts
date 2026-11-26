import { useEffect } from 'react';
import { useSudokuStore } from 'src/states/sudoku.state';

/** Keyboard play: digits, arrows, Backspace/Delete, N for notes, H for a hint, Ctrl/Cmd+Z undo. */
export default function useSudokuKeyboard() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [role="dialog"]')) return;
      const { fn } = useSudokuStore.getState();
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) fn.redo();
        else fn.undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault();
        fn.redo();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (/^[1-9]$/.test(key)) fn.input(Number(key));
      else if (key === 'backspace' || key === 'delete' || key === '0') fn.erase();
      else if (key === 'n') fn.toggleNoteMode();
      else if (key === 'h') fn.requestHint();
      else if (key === 'arrowup') fn.moveSelection(-1, 0);
      else if (key === 'arrowdown') fn.moveSelection(1, 0);
      else if (key === 'arrowleft') fn.moveSelection(0, -1);
      else if (key === 'arrowright') fn.moveSelection(0, 1);
      else return;
      event.preventDefault();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
