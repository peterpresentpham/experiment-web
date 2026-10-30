// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ListEmpty } from 'src/components/box/Empty';
import IconButton from 'src/components/buttons/IconButton';
import GameStatus from 'src/components/games/GameStatus';

afterEach(cleanup);

describe('IconButton', () => {
  it('renders a real button with an accessible name', () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Open settings" onClick={onClick}>
        <span>i</span>
      </IconButton>
    );
    const button = screen.getByRole('button', { name: 'Open settings' });
    expect(button.getAttribute('type')).toBe('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ListEmpty', () => {
  it('shows title, description and action', () => {
    render(<ListEmpty title="Nothing here" description="Add one" action={<button>Add</button>} />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Add one')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
  });
});

describe('GameStatus', () => {
  it('announces the status text politely', () => {
    render(<GameStatus text="Player 1 turn" turn={0} />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Player 1 turn');
  });
});
