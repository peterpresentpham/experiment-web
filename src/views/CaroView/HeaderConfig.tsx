import { ComponentProps } from 'react';
import CaroConfigDialog from 'src/components/AppDialog/CaroConfigDialog';
import CaroConnectionDialog from 'src/components/AppDialog/CaroConnectionDialog';
import CaroInstructionDialog from 'src/components/AppDialog/CaroInstructionDialog';
import CaroMessengerDialog from 'src/components/AppDialog/CaroMessengerDialog';
import GameStatus from 'src/components/games/GameStatus';
import GameToolbar from 'src/components/games/GameToolbar';
import { Button } from 'src/components/shadcn/button';
import { useCaroStateContext } from 'src/context/caro-state.context';
import { useMessages } from 'src/i18n/client';
import { cn } from 'src/lib/utils';
import { caroMessages } from 'src/i18n/messages/caro';
import { commonMessages } from 'src/i18n/messages/common';
import { useCaroStore } from 'src/states/caro.state';
import CaroGameInfo from './CaroGameInfo';
import HellEngineStatus from './HellEngineStatus';
import { TSound } from 'src/types/global';

export default function HeaderConfig(props: ComponentProps<'div'>) {
  const turn = useCaroStore((state) => state.turn);
  const stepCount = useCaroStore((state) => state.stepsOrder.length);
  const numberOfBlindError = useCaroStore((state) => state.numberOfBlindError);
  const gameType = useCaroStore((state) => state.metadata.gameType);
  const machineThinking = useCaroStore(
    (state) => state.metadata.playMode == 'machine' && state.turn == state.metadata.machineTurn
  );
  const {
    shouldDisableBoard,
    playerText,
    shortText,
    isOver,
    fn: { undo, reset },
  } = useCaroStateContext();
  const text = useMessages(caroMessages);
  const { actions } = useMessages(commonMessages);

  return (
    <GameToolbar
      {...props}
      title={text.title}
      status={
        <>
          <GameStatus
            text={playerText}
            label={shortText}
            isOver={isOver}
            marker={
              // The piece of the side to move, as drawn on the board.
              <span
                aria-hidden
                className={cn(
                  'text-base leading-none font-bold',
                  turn == 0 ? 'text-player-1' : 'text-player-2',
                  machineThinking && 'animate-pulse'
                )}
              >
                {turn == 0 ? 'x' : 'o'}
              </span>
            }
          />
          <HellEngineStatus />
          {/* Wide screens: in the title row, so the header is one row and the board grows. */}
          <CaroGameInfo className="hidden lg:flex" />
        </>
      }
      tools={
        <>
          <CaroConfigDialog />
          <CaroInstructionDialog />
          <CaroConnectionDialog />
          <CaroMessengerDialog />
        </>
      }
      actions={
        <>
          {!isOver && (
            <Button
              size="sm"
              variant="outline"
              sound={TSound.UNDO}
              onClick={undo}
              disabled={stepCount <= 1 || shouldDisableBoard}
            >
              {actions.undo}
            </Button>
          )}
          {/* Always reachable; highlighted once the game is over. */}
          <Button size="sm" variant={isOver ? 'default' : 'outline'} onClick={() => reset()}>
            {actions.newGame}
          </Button>
        </>
      }
    >
      <CaroGameInfo className="w-full lg:hidden" />
      {gameType == 'blind' && (
        <div className="flex flex-wrap items-center gap-2">
          {([0, 1] as const).map((player) => (
            <span
              key={player}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm"
            >
              <span
                aria-hidden
                className={cn('size-2.5 rounded-full', player == 0 ? 'bg-player-1' : 'bg-player-2')}
              />
              {text.blindErrors(player + 1)}
              <span className="font-semibold text-destructive tabular-nums">
                {numberOfBlindError[player]}
              </span>
            </span>
          ))}
        </div>
      )}
    </GameToolbar>
  );
}
