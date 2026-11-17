'use client';

import { ComponentProps } from 'react';
import PikachuConfigDialog from 'src/components/AppDialog/PikachuConfigDialog';
import PikachuInstructionDialog from 'src/components/AppDialog/PikachuInstructionDialog';
import GameToolbar from 'src/components/games/GameToolbar';
import { Badge } from 'src/components/shadcn/badge';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { pikachuMessages } from 'src/i18n/messages/pikachu';
import { getRoundTransform } from 'src/services/pikachu/round.utils';
import { usePikachuSend } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TSound } from 'src/types/global';
import { PikachuMachineEvent } from 'src/types/pikachu.type';

export default function HeaderConfig(props: ComponentProps<'div'>) {
  const { metadata } = usePikachuStore();
  const send = usePikachuSend();
  const text = useMessages(pikachuMessages);
  const { actions } = useMessages(commonMessages);

  const transformTitle = text.transforms[getRoundTransform(metadata)];
  const roundLabel =
    metadata.gameType != 'randomBoard'
      ? text.round(metadata.round, transformTitle)
      : text.randomType(transformTitle);

  return (
    <GameToolbar
      {...props}
      title={text.title}
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
            {text.hint}
          </Button>
          <Button
            size="sm"
            variant="outline"
            sound={TSound.SUCCESS}
            onClick={() => send({ type: PikachuMachineEvent.CHANGE })}
          >
            {text.changeBoard}
          </Button>
          <Button
            size="sm"
            sound={TSound.SUCCESS}
            onClick={() => send({ type: PikachuMachineEvent.CREATE, mode: 'newGame' })}
          >
            {actions.newGame}
          </Button>
        </>
      }
    />
  );
}
