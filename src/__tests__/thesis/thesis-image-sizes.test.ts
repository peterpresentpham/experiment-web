import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { IMAGES } from 'src/configs/images';
import { THESIS_IMAGE_SIZES } from 'src/configs/thesis-image-sizes';

/** Width and height from a PNG's header. */
function pngSize(path: string) {
  const bytes = readFileSync(join(process.cwd(), 'public', path));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function paths(value: unknown): Array<string> {
  if (typeof value == 'string') return [value];
  return Object.values(value as object).flatMap(paths);
}

describe('thesis image sizes', () => {
  it('has the real size of every thesis figure', () => {
    const images = paths(IMAGES.master);
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) expect(THESIS_IMAGE_SIZES[image], image).toEqual(pngSize(image));
  });
});
