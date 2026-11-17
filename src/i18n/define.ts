import { TLocale } from './config';

export type TLocalized<T> = Record<TLocale, T>;

/**
 * Declares the messages of one feature in every locale. The English object defines the shape and
 * the Vietnamese one must match it exactly, so a missing translation fails type checking.
 */
export function defineMessages<T>(messages: { en: T; vi: NoInfer<T> }): TLocalized<T> {
  return messages;
}
