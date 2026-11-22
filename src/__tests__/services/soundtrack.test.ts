import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SOUND_EFFECTS } from 'src/services/soundtrack';
import { TSound } from 'src/types/global';

describe('sound effects', () => {
  it('has a file in public/ for every effect', () => {
    for (const [type, { src }] of Object.entries(SOUND_EFFECTS))
      expect(existsSync(join(process.cwd(), 'public', src)), `${type}: ${src}`).toBe(true);
  });

  it('covers every sound except the background music', () => {
    const effects = Object.values(TSound).filter((type) => type != TSound.BACKGROUND);
    expect(Object.keys(SOUND_EFFECTS).sort()).toEqual([...effects].sort());
  });
});
