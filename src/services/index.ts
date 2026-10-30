import { Metadata } from 'next';
import { APP_NAME } from 'src/configs/constance';
import { TPosition } from 'src/types/global';

/**
 * Creates a randomly shuffled array of numbers from 0 to range-1 using Fisher-Yates shuffle.
 * @param range - The size of the array to generate
 * @returns A shuffled array of numbers [0, 1, 2, ..., range-1]
 */
export function randomSubGroup(range: number): number[] {
  const _array = Array.from(Array(range).keys(), (key) => key);
  for (let i = range - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [_array[i], _array[j]] = [_array[j], _array[i]];
  }
  return _array;
}

/**
 * Truncates a string to show only the beginning and end with ellipsis in the middle.
 * @param s - The string to format
 * @param frac - Number of characters to show at start and end (default: 3)
 * @returns The formatted string or original if short enough
 */
export function formatText(s: string, frac = 3): string {
  return s.length > frac * 2 + 5 ? `${s.substring(0, frac)}...${s.slice(-frac)}` : s;
}

export function generateAppMetadata(title: string, description?: string): Metadata {
  // Page-level openGraph/twitter replace the layout's objects, so repeat the shared fields.
  const images = ['/opengraph-image'];
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: APP_NAME,
      title: `${title} | ${APP_NAME}`,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${APP_NAME}`, description, images },
  };
}

/**
 * Checks if two positions are equal.
 * @param position1 - First position [row, column]
 * @param position2 - Second position [row, column]
 * @returns True if both positions have the same coordinates
 */
export function isPositionEqual(position1: TPosition, position2: TPosition): boolean {
  return position1[0] === position2[0] && position1[1] === position2[1];
}

/**
 * Checks if a position exists in an array of positions.
 * @param position - The position to search for
 * @param positions - Array of positions to search in
 * @returns True if the position is found in the array
 */
export function isPositionIncludes(position: TPosition, positions: Array<TPosition>): boolean {
  return positions.some((p) => p[0] === position[0] && p[1] === position[1]);
}

/**
 * Delays execution for a specified number of milliseconds.
 * @param milliseconds - The number of milliseconds to wait
 */
export async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Creates a new array with the element at the specified index removed.
 * @param arr - The source array
 * @param index - The index of the element to remove
 * @returns A new array without the element at the specified index
 */
export function removeAtIndex<T>(arr: T[], index: number): T[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Generates a random integer from 0 to len-1.
 * @param len - The upper bound (exclusive)
 * @returns A random integer in the range [0, len)
 */
export function getRandom(len: number): number {
  return Math.floor(Math.random() * len);
}

/**
 * Upper-cases the first character of a string.
 * @param val - The string to format
 */
export function capitalizeFirstLetter(val: string): string {
  return val.charAt(0).toUpperCase() + val.slice(1);
}
