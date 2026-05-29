'use client';

import { ComponentProps } from 'react';
import PikachuConfigDialog from 'src/components/AppDialog/PikachuConfigDialog';
import PikachuInstructionDialog from 'src/components/AppDialog/PikachuInstructionDialog';
import RoutingGameDialog from 'src/components/AppDialog/RoutingGameDialog';
import { Button } from 'src/components/shadcn/button';
import { pikachuTransformConfig } from 'src/configs/pikachu.constance';
import { cn } from 'src/lib/utils';
import { usePikachuStateMachine } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TSound } from 'src/types/global';
import { PikachuMachineEvent } from 'src/types/pikachu.type';

export default function HeaderConfig(props: ComponentProps<'div'>) {
  const {
    metadata: { round, roundList, randomRoundListIndex, gameType },
  } = usePikachuStore();
  const { send } = usePikachuStateMachine();

  function onNewGame() {
    send({ type: PikachuMachineEvent.CREATE, mode: 'newGame' });
  }

  function onChangeBoard() {
    send({ type: PikachuMachineEvent.CHANGE });
  }

  return (
    <div {...props} className={cn('w-full', props.className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-300/25 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase dark:bg-amber-300/15 dark:text-amber-200">
            Pikachu Arcade
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-100/90">
            Match & Clear
          </span>
        </div>
        {gameType != 'randomBoard' ? (
          <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
            Round {round} · {pikachuTransformConfig[roundList[round - 1]].title}
          </span>
        ) : (
          <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
            Type · {pikachuTransformConfig[roundList[randomRoundListIndex]]?.title || '--'}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RoutingGameDialog game="pikachu" />
        <PikachuConfigDialog />
        <PikachuInstructionDialog />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          onClick={onNewGame}
          className="bg-amber-400 text-slate-950 shadow-[0_10px_24px_rgba(251,191,36,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
          sound={TSound.SUCCESS}
        >
          New game
        </Button>
        <Button
          variant="outline"
          onClick={onChangeBoard}
          className="border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/8"
          sound={TSound.SUCCESS}
        >
          Change board
        </Button>
        <Button onClick={() => send({ type: PikachuMachineEvent.SHOW_HINT })}>Hint</Button>
      </div>
    </div>
  );
}
