/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { APP_NAME } from 'src/configs/constance';
import { TPositionType } from 'src/types/global';
import { USER_ROLE } from 'src/types/papp.type';

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param hex - The hexadecimal string to convert (must have even length)
 * @returns A Uint8Array containing the converted bytes
 * @throws Error if the hex string has odd length
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Gets the current Unix timestamp in seconds.
 * @returns The current timestamp in seconds since Unix epoch
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

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

export function generateAppMetadata(title: string): Metadata {
  return { title: `${APP_NAME} | ${title}`, openGraph: { title: `${APP_NAME} | ${title}` } };
}

/**
 * Checks if two positions are equal.
 * @param position1 - First position [row, column]
 * @param position2 - Second position [row, column]
 * @returns True if both positions have the same coordinates
 */
export function isPositionEqual(position1: TPositionType, position2: TPositionType): boolean {
  return position1[0] === position2[0] && position1[1] === position2[1];
}

/**
 * Checks if a position exists in an array of positions.
 * @param position - The position to search for
 * @param positions - Array of positions to search in
 * @returns True if the position is found in the array
 */
export function isPositionIncludes(
  position: TPositionType,
  positions: Array<TPositionType>
): boolean {
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

export function getAxiosError(error: any) {
  let message = error?.response?.data?.message;
  if (typeof message == 'string') return message;
  message = error?.response?.data;
  if (typeof message == 'string') return message;
  message = error?.message;
  if (typeof message == 'string') return message;
  return undefined;
}

export function getUserRole(role?: USER_ROLE) {
  switch (role) {
    case USER_ROLE.ADMIN:
      return 'Admin';
    case USER_ROLE.USER:
      return 'User';
    default:
      return 'Unknown';
  }
}
