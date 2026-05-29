'use client';

import { createActorContext } from '@xstate/react';
import {
  PikachuMachineEvent,
  PikachuMachineState,
  TPikachuContext,
  TPikachuEvent,
} from 'src/types/pikachu.type';
import { assign, setup } from 'xstate';
import { changeBoardAction, move } from './pikachu.utils/board.utils';
import { createPikachuAction } from './pikachu.utils/create.utils';

const pikachuMachine = setup({
  types: { events: {} as TPikachuEvent, context: {} as TPikachuContext },
  actions: {
    scheduleResetSelection: ({ context, self }) => {
      if (context.selectedPath.length === 0) return;

      setTimeout(() => {
        self.send({ type: PikachuMachineEvent.RESET_SELECTION });
      }, 300);
    },
  },
}).createMachine({
  id: 'process-machine',
  initial: PikachuMachineState.INITIAL,
  context: {
    position: undefined,
    selectedPath: [],
    randomCounter: 1,
    hintRunning: false,
  },
  states: {
    [PikachuMachineState.INITIAL]: {
      on: {
        [PikachuMachineEvent.CREATE]: {
          target: PikachuMachineState.PLAYING,
          actions: assign(({ event }) => {
            return createPikachuAction(event);
          }),
        },
        [PikachuMachineEvent.LOAD_SAVE_GAME]: {
          target: PikachuMachineState.PLAYING,
        },
      },
    },
    [PikachuMachineState.PLAYING]: {
      on: {
        [PikachuMachineEvent.CREATE]: {
          target: PikachuMachineState.PLAYING,
          actions: assign(({ event }) => {
            return createPikachuAction(event);
          }),
        },
        [PikachuMachineEvent.MOVE]: {
          actions: [
            assign(({ context, event, self: { send } }) => {
              return move(context, event, send);
            }),
            'scheduleResetSelection',
          ],
        },
        [PikachuMachineEvent.RESET_SELECTION]: {
          actions: assign(() => {
            return { position: undefined, selectedPath: [] };
          }),
        },
        [PikachuMachineEvent.CHANGE]: {
          actions: assign(() => {
            return changeBoardAction();
          }),
        },
        [PikachuMachineEvent.OUT_OF_MOVE]: {
          target: PikachuMachineState.OUT_OF_MOVE,
        },
        [PikachuMachineEvent.SHOW_HINT]: {
          actions: assign(({ context }) => {
            return { hintRunning: !context.hintRunning };
          }),
        },
        [PikachuMachineEvent.WIN]: {
          target: PikachuMachineState.INITIAL,
        },
      },
    },
    [PikachuMachineState.OUT_OF_MOVE]: {
      on: {
        [PikachuMachineEvent.CHANGE]: {
          target: PikachuMachineState.PLAYING,
          actions: assign(() => {
            return changeBoardAction();
          }),
        },
      },
    },
    [PikachuMachineState.ENDED]: {},
  },
});

export const PikachuMachineContext = createActorContext(pikachuMachine);

export function usePikachuStateMachine() {
  const actorRef = PikachuMachineContext.useActorRef();
  const state = PikachuMachineContext.useSelector((s) => s);

  return { state, send: actorRef.send };
}
