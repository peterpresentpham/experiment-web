'use client';

import { useThesisObject } from 'src/context/thesis-config.context';
import { TThesisObjectModeType } from 'src/types/thesis.type';

interface IndexLabelProps {
  id: string;
  mode: TThesisObjectModeType;
  /** Text to prepend before the index, e.g. "Chapter ", "Figure " */
  prefix?: string;
  /** Text to append after the index, e.g. ". ", ": " */
  suffix?: string;
}

/**
 * Minimal client component that subscribes only to the specific index value.
 * Renders nothing if no index is available.
 * This is the ONLY part that needs 'use client' in the entire parent component.
 *
 * Props are serializable (strings only) - safe to pass from Server Components.
 */
export default function IndexLabel({ id, mode, prefix = '', suffix = '' }: IndexLabelProps) {
  const index = useThesisObject(id, mode)?.index;
  if (!index) return null;

  return <>{`${prefix}${index}${suffix}`}</>;
}
