'use client';

import { ComponentProps } from 'react';
import PikachuConfigDialog from 'src/components/AppDialog/PikachuConfigDialog';
import PikachuInstructionDialog from 'src/components/AppDialog/PikachuInstructionDialog';
import GameToolbar from 'src/components/games/GameToolbar';
import { Badge } from 'src/components/shadcn/badge';
import { Button } from 'src/components/shadcn/button';
import { pikachuTransformConfig } from 'src/configs/pikachu.constance';
import { usePikachuSend } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TSound } from 'src/types/global';
import { PikachuMachineEvent } from 'src/types/pikachu.type';

export default function HeaderConfig(props: ComponentProps<'div'>) {
  const {
    metadata: { round, roundList, randomRoundListIndex, gameType },
  } = usePikachuStore();
  const send = usePikachuSend();

  const roundLabel =
    gameType != 'randomBoard'
      ? `Round ${round} · ${pikachuTransformConfig[roundList[round - 1]].title}`
      : `Type · ${pikachuTransformConfig[roundList[randomRoundListIndex]]?.title || '--'}`;

  return (
    <GameToolbar
      {...props}
      title="Pikachu"
      status={
        <Badge variant="secondary" role="status">
          {roundLabel}
        </Badge>
      }
      tools={
        <>
          <PikachuConfigDialog />
          <PikachuInstructionDialog />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => send({ type: PikachuMachineEvent.SHOW_HINT })}
          >
            Hint
          </Button>
          <Button
            size="sm"
            variant="outline"
            sound={TSound.SUCCESS}
            onClick={() => send({ type: PikachuMachineEvent.CHANGE })}
          >
            Change board
          </Button>
          <Button
            size="sm"
            sound={TSound.SUCCESS}
            onClick={() => send({ type: PikachuMachineEvent.CREATE, mode: 'newGame' })}
          >
            New game
          </Button>
        </>
      }
    />
  );
}
