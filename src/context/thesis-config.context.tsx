'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import TableOfContent from 'src/components/Thesis/TableOfContent';
import { TContentType, TThesisObjectModeType, TThesisObjectType } from 'src/types/thesis.type';
import { buildContent } from 'src/services/thesis/index-system';

const defaultContent: TContentType = {
  chapters: {},
  sections: {},
  subsections: {},
  figures: {},
  equations: {},
  cites: {},
  programs: {},
  tables: {},
  algorithms: {},
  appendixes: {},
};

const ThesisConfigContext = createContext<TContentType>(defaultContent);

interface TProps {
  id: string;
  firstLevel: 'chapter' | 'section';
  isTableOfContents?: boolean;
  children: ReactNode;
}

export default function ThesisConfigProvider({
  id,
  firstLevel,
  isTableOfContents = true,
  children,
}: TProps) {
  const [state, setState] = useState<TContentType>(defaultContent);

  useEffect(() => {
    // Slightly defer DOM query to avoid layout shift
    const timer = requestAnimationFrame(() => {
      const result = buildContent(id, firstLevel);
      if (result) setState(result);
    });
    return () => cancelAnimationFrame(timer);
  }, [firstLevel, id]);

  const contextData = useMemo<TContentType>(() => {
    return state;
  }, [state]);

  return (
    <ThesisConfigContext.Provider value={contextData}>
      {isTableOfContents ? (
        <TableOfContent id={id} firstLevel={firstLevel}>
          <div id={id}>{children}</div>
        </TableOfContent>
      ) : (
        <div id={id}>{children}</div>
      )}
    </ThesisConfigContext.Provider>
  );
}

export function useThesisConfigContext() {
  return useContext(ThesisConfigContext);
}

/**
 * Optimized hook that uses individual selectors to minimize re-renders.
 * Each component only re-renders when its specific slice of state changes.
 */
export function useThesisObject<T extends TThesisObjectType>(
  id: string,
  mode?: TThesisObjectModeType
): T | undefined {
  const state = useThesisConfigContext();

  // Select only the relevant slice of state based on mode
  const selector = useCallback(
    (s: TContentType) => {
      if (mode == 'chapter') return s.chapters;
      else if (mode == 'section') return s.sections;
      else if (mode == 'subsection') return s.subsections;
      else if (mode == 'equation') return s.equations;
      else if (mode == 'program') return s.programs;
      else if (mode == 'table') return s.tables;
      else if (mode == 'algorithm') return s.algorithms;
      else if (mode == 'cite') return s.cites;
      else if (mode == 'appendix') return s.appendixes;
      return s.figures;
    },
    [mode]
  );

  const selectedSlice = selector(state);

  // Compare only the specific key ID to prevent re-renders when other keys change
  const prevRef = useRef<T | undefined>(undefined);
  const currentValue = useMemo(() => selectedSlice[id] as T | undefined, [selectedSlice, id]);

  // Only update ref if value actually changed (reference comparison)
  if (currentValue !== prevRef.current) {
    prevRef.current = currentValue;
  }

  return prevRef.current;
}
