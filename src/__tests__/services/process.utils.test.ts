import { parseImportedProcesses, resetRuntimeFields } from 'src/services/process.utils';
import { ProcessStatusType } from 'src/types/process.type';
import { describe, expect, it } from 'vitest';

describe('/services/process.utils.ts', () => {
  it('resetRuntimeFields clears simulation progress', () => {
    const fields = resetRuntimeFields({
      blockTasks: [{ arrivalTime: 1, executionTime: 2, runtime: 2 }],
    });
    expect(fields).toEqual({
      runtime: 0,
      state: ProcessStatusType.NEW,
      currentBlockTaskIndex: 0,
      readyPriority: -1,
      waitingPriority: -1,
      beginAt: -1,
      endAt: -1,
      blockTasks: [{ arrivalTime: 1, executionTime: 2, runtime: 0 }],
    });
    expect(resetRuntimeFields({})).not.toHaveProperty('blockTasks');
  });

  it('parseImportedProcesses accepts an object keyed by pid', () => {
    const result = parseImportedProcesses({
      a: { arrivalTime: 0, executionTime: 5, runtime: 3, state: 'terminated' },
    });
    expect(result.a).toMatchObject({
      pid: 'a',
      arrivalTime: 0,
      executionTime: 5,
      runtime: 0,
      state: ProcessStatusType.NEW,
    });
  });

  it('parseImportedProcesses accepts an array and numbers the processes', () => {
    const result = parseImportedProcesses([
      { pid: 'p1', arrivalTime: 0, executionTime: 1 },
      { pid: 'p2', arrivalTime: 2, executionTime: 3, index: 7 },
    ]);
    expect(result.p1.index).toBe(1);
    expect(result.p2.index).toBe(7);
  });

  it('parseImportedProcesses ignores non-object input', () => {
    expect(parseImportedProcesses(42)).toEqual({});
    expect(parseImportedProcesses(null)).toEqual({});
  });
});
