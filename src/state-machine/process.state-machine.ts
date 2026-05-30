'use client';

import { createActorContext } from '@xstate/react';
import { useProcessStore } from 'src/states/process.state';
import { ProcessMachineEvent, ProcessMachineStateType } from 'src/types/process.type';
import { assign, cancel, setup } from 'xstate';
import {
  clearAction,
  initializeProcessesAction,
  loadProcessContextEntry,
  resetAction,
} from './process.utils';
import { runProcessAction, runProcessEntry, runProcessGuard } from './process.utils/run.utils';
import { saveProcessContextEntry } from './process.utils/save.utils';
import { scheduleProcessesEntry, scheduleProcessGuard } from './process.utils/schedule.utils';
import { TProcessContextType, TProcessEventType } from './process.utils/type.utils';

const processMachine = setup({
  types: { events: {} as TProcessEventType, context: {} as TProcessContextType },
  delays: {
    INTERVAL: ({ context }) => context.interval,
  },
}).createMachine({
  id: 'process-machine',
  initial: ProcessMachineStateType.INITIAL,
  context: {
    interval: 1000,
    counter: 0,
    newQueue: undefined,
    waitingQueue: undefined,
    readyQueue: undefined,
    currentProcess: undefined,
    monitorData: [],
    metricsData: {},
  },
  states: {
    [ProcessMachineStateType.INITIAL]: {
      on: {
        [ProcessMachineEvent.INITIALIZE]: {
          target: ProcessMachineStateType.SCHEDULING,
          actions: assign(({ event }) => {
            return initializeProcessesAction(event);
          }),
        },
        [ProcessMachineEvent.SET_METADATA]: {
          actions: assign(({ event }) => {
            return { interval: event.interval };
          }),
        },
      },
    },
    [ProcessMachineStateType.SCHEDULING]: {
      entry: assign(({ context }) => {
        return scheduleProcessesEntry(context);
      }),
      always: [
        {
          target: ProcessMachineStateType.CONTEXT_LOADING,
          guard: ({ context }) => {
            return scheduleProcessGuard(context);
          },
        },
        { target: ProcessMachineStateType.RUNNING },
      ],
    },
    [ProcessMachineStateType.CONTEXT_LOADING]: {
      entry: assign(({ context }) => {
        return loadProcessContextEntry(context);
      }),
      always: [
        {
          target: ProcessMachineStateType.RUNNING,
          guard: ({ context }) => {
            return runProcessGuard(context);
          },
        },
        {
          target: ProcessMachineStateType.TERMINATED,
          guard: ({ context }) => !context.currentProcess,
        },
      ],
    },
    [ProcessMachineStateType.RUNNING]: {
      entry: assign(({ context }) => {
        return runProcessEntry(context);
      }),
      exit: cancel('INTERVAL'),
      always: [
        {
          target: ProcessMachineStateType.CONTEXT_LOADING,
          guard: ({ context }) => !context.currentProcess && !context.readyQueue?.isEmpty(),
        },
      ],
      after: {
        INTERVAL: {
          target: ProcessMachineStateType.CONTEXT_SAVING,
          actions: assign(({ context }) => {
            return runProcessAction(context);
          }),
        },
      },
    },
    [ProcessMachineStateType.CONTEXT_SAVING]: {
      entry: assign(({ context }) => {
        return saveProcessContextEntry(context);
      }),
      always: { target: ProcessMachineStateType.SCHEDULING },
    },
    [ProcessMachineStateType.TERMINATED]: {
      entry: () => {
        const fn = useProcessStore.getState().fn;
        fn.setMetadata({ status: 'ended' });
      },
      on: {
        [ProcessMachineEvent.INITIALIZE]: {
          target: ProcessMachineStateType.SCHEDULING,
          actions: assign(({ event }) => {
            return initializeProcessesAction(event);
          }),
        },
      },
    },
  },
  on: {
    [ProcessMachineEvent.RESET]: {
      target: `.${ProcessMachineStateType.INITIAL}`,
      actions: assign(() => {
        return resetAction();
      }),
    },
    [ProcessMachineEvent.CLEAR]: {
      target: `.${ProcessMachineStateType.INITIAL}`,
      actions: assign(() => {
        return clearAction();
      }),
    },
  },
});

export const ProcessMachineContext = createActorContext(processMachine);

export function useProcessStateMachine() {
  const actorRef = ProcessMachineContext.useActorRef();
  const state = ProcessMachineContext.useSelector((s) => s);

  return { state, send: actorRef.send };
}

export function useProcessMonitorData() {
  return ProcessMachineContext.useSelector((s) => s.context.monitorData);
}
