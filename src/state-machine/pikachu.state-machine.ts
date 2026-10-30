'use client';

import { createActorContext } from '@xstate/react';
import { soundtrack } from 'src/services/soundtrack';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPosition, TSound } from 'src/types/global';
import {
  PikachuMachineEvent,
  PikachuMachineState,
  TPikachuContext,
  TPikachuEvent,
} from 'src/types/pikachu.type';
import { and, assign, setup } from 'xstate';
import {
  changeBoard,
  commitMatchResult,
  computeMatchResult,
  notifyOutOfMove,
  notifyWin,
  resolveMove,
  TMoveResolution,
} from './pikachu.utils/board.utils';
import { createPikachuBoard } from './pikachu.utils/create.utils';

// How long the connecting path stays visible before the pair is removed.
export const PATH_DISPLAY_MS = 200;

const clearSelection = { position: undefined, selectedPath: [], matchedPair: undefined };

function resolve(context: TPikachuContext, event: TPikachuEvent): TMoveResolution {
  if (event.type !== PikachuMachineEvent.MOVE) return { type: 'ignore' };
  return resolveMove(context, event.position);
}

const pikachuMachine = setup({
  types: { events: {} as TPikachuEvent, context: {} as TPikachuContext },
  guards: {
    isSelect: ({ context, event }) => resolve(context, event).type === 'select',
    isDeselect: ({ context, event }) => resolve(context, event).type === 'deselect',
    isInvalid: ({ context, event }) => resolve(context, event).type === 'invalid',
    isMatch: ({ context, event }) => resolve(context, event).type === 'match',
    isCleared: ({ context }) => context.matchResult?.outcome === 'cleared',
    isOutOfMove: ({ context }) => context.matchResult?.outcome === 'outOfMove',
    isRandomMode: () => usePikachuStore.getState().metadata.gameType === 'randomBoard',
  },
  actions: {
    playSound: (_, params: { sound: TSound }) => {
      soundtrack.play({ type: params.sound });
    },
    createBoard: ({ event }) => {
      if (event.type === PikachuMachineEvent.CREATE) createPikachuBoard(event);
    },
    createNextRound: () => createPikachuBoard({ mode: 'nextRound' }),
    changeBoard: () => changeBoard(),
    notifyOutOfMove: () => notifyOutOfMove(),
    notifyWin: () => notifyWin(),
    selectPiece: assign(({ event }) => {
      if (event.type !== PikachuMachineEvent.MOVE) return {};
      return { position: event.position };
    }),
    deselectPiece: assign({ position: undefined }),
    resetSelection: assign(clearSelection),
    startMatch: assign(({ context, event }) => {
      const resolution = resolve(context, event);
      if (resolution.type !== 'match' || !context.position) return {};
      const { path } = resolution;
      const matchedPair: [TPosition, TPosition] = [context.position, path[path.length - 1]];
      return { selectedPath: path, matchedPair };
    }),
    computeMatch: assign(({ context }) => ({ matchResult: computeMatchResult(context) })),
    commitMatch: ({ context }) => commitMatchResult(context.matchResult),
    finishMatch: assign(({ context }) => ({
      ...clearSelection,
      hintRunning: false,
      randomCounter: context.matchResult?.randomCounter ?? context.randomCounter,
    })),
    clearMatchResult: assign({ matchResult: undefined }),
    toggleHint: assign(({ context }) => ({ hintRunning: !context.hintRunning })),
  },
}).createMachine({
  id: 'pikachu-machine',
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
          actions: ['createBoard', 'resetSelection'],
        },
        [PikachuMachineEvent.LOAD_SAVE_GAME]: { target: PikachuMachineState.PLAYING },
      },
    },
    [PikachuMachineState.PLAYING]: {
      on: {
        [PikachuMachineEvent.CREATE]: {
          target: PikachuMachineState.PLAYING,
          actions: ['createBoard', 'resetSelection'],
        },
        [PikachuMachineEvent.CHANGE]: { actions: ['changeBoard', 'resetSelection'] },
        [PikachuMachineEvent.SHOW_HINT]: { actions: 'toggleHint' },
        [PikachuMachineEvent.MOVE]: [
          {
            guard: 'isMatch',
            target: PikachuMachineState.MATCHED,
            actions: ['startMatch', { type: 'playSound', params: { sound: TSound.MOVE } }],
          },
          {
            guard: 'isSelect',
            actions: ['selectPiece', { type: 'playSound', params: { sound: TSound.CLICK } }],
          },
          {
            guard: 'isDeselect',
            actions: ['deselectPiece', { type: 'playSound', params: { sound: TSound.CLICK } }],
          },
          {
            guard: 'isInvalid',
            actions: ['resetSelection', { type: 'playSound', params: { sound: TSound.ERROR } }],
          },
        ],
      },
    },
    // Input is ignored while the path is shown; new game / change board still cancel the timer.
    [PikachuMachineState.MATCHED]: {
      after: {
        [PATH_DISPLAY_MS]: {
          target: PikachuMachineState.RESOLVING,
          actions: ['computeMatch', 'commitMatch', 'finishMatch'],
        },
      },
      on: {
        [PikachuMachineEvent.CREATE]: {
          target: PikachuMachineState.PLAYING,
          actions: ['createBoard', 'resetSelection'],
        },
        [PikachuMachineEvent.CHANGE]: {
          target: PikachuMachineState.PLAYING,
          actions: ['changeBoard', 'resetSelection'],
        },
      },
    },
    [PikachuMachineState.RESOLVING]: {
      exit: 'clearMatchResult',
      always: [
        {
          guard: 'isOutOfMove',
          target: PikachuMachineState.OUT_OF_MOVE,
          actions: 'notifyOutOfMove',
        },
        {
          guard: and(['isCleared', 'isRandomMode']),
          target: PikachuMachineState.INITIAL,
          actions: 'notifyWin',
        },
        {
          guard: 'isCleared',
          target: PikachuMachineState.PLAYING,
          actions: 'createNextRound',
        },
        { target: PikachuMachineState.PLAYING },
      ],
    },
    [PikachuMachineState.OUT_OF_MOVE]: {
      on: {
        [PikachuMachineEvent.CHANGE]: {
          target: PikachuMachineState.PLAYING,
          actions: ['changeBoard', 'resetSelection'],
        },
        [PikachuMachineEvent.CREATE]: {
          target: PikachuMachineState.PLAYING,
          actions: ['createBoard', 'resetSelection'],
        },
      },
    },
  },
});

export const PikachuMachineContext = createActorContext(pikachuMachine);

export function usePikachuSend() {
  return PikachuMachineContext.useActorRef().send;
}

export { pikachuMachine };
