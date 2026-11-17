import { ComponentProps } from 'react';
import CaroConfigDialog from 'src/components/AppDialog/CaroConfigDialog';
import CaroConnectionDialog from 'src/components/AppDialog/CaroConnectionDialog';
import CaroInstructionDialog from 'src/components/AppDialog/CaroInstructionDialog';
import CaroMessengerDialog from 'src/components/AppDialog/CaroMessengerDialog';
import TitleBox from 'src/components/box/TitleBox';
import GameStatus from 'src/components/games/GameStatus';
import GameToolbar from 'src/components/games/GameToolbar';
import { Button } from 'src/components/shadcn/button';
import { useCaroStateContext } from 'src/context/caro-state.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { commonMessages } from 'src/i18n/messages/common';
import { useCaroStore } from 'src/states/caro.state';

export default function HeaderConfig(props: ComponentProps<'div'>) {
  const turn = useCaroStore((state) => state.turn);
  const stepCount = useCaroStore((state) => state.stepsOrder.length);
  const numberOfBlindError = useCaroStore((state) => state.numberOfBlindError);
  const gameType = useCaroStore((state) => state.metadata.gameType);
  const {
    shouldDisableBoard,
    playerText,
    isOver,
    fn: { undo, reset },
  } = useCaroStateContext();
  const text = useMessages(caroMessages);
  const { actions } = useMessages(commonMessages);

  return (
    <GameToolbar
      {...props}
      title={text.title}
      status={<GameStatus text={playerText} turn={turn} isOver={isOver} />}
      tools={
        <>
          <CaroConfigDialog />
          <CaroInstructionDialog />
          <CaroConnectionDialog />
          <CaroMessengerDialog />
        </>
      }
      actions={
        !isOver ? (
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={stepCount <= 1 || shouldDisableBoard}
          >
            {actions.undo}
          </Button>
        ) : (
          <Button size="sm" onClick={() => reset()}>
            {actions.newGame}
          </Button>
        )
      }
    >
      {gameType == 'blind' && (
        <div className="flex flex-wrap items-center gap-4">
          <TitleBox
            title={text.blindErrors(1)}
            value={numberOfBlindError[0]}
            titleProps={{ className: 'text-player-1' }}
            valueProps={{ className: 'text-destructive' }}
          />
          <TitleBox
            title={text.blindErrors(2)}
            value={numberOfBlindError[1]}
            titleProps={{ className: 'text-player-2' }}
            valueProps={{ className: 'text-destructive' }}
          />
        </div>
      )}
    </GameToolbar>
  );
}
