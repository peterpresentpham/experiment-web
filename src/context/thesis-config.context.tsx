'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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

  return (
    <ThesisConfigContext.Provider value={state}>
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

const SLICE_BY_MODE: Record<TThesisObjectModeType, keyof TContentType> = {
  chapter: 'chapters',
  section: 'sections',
  subsection: 'subsections',
  figure: 'figures',
  equation: 'equations',
  program: 'programs',
  table: 'tables',
  algorithm: 'algorithms',
  cite: 'cites',
  appendix: 'appendixes',
  // These pages have no numbered objects of their own; lookups fall back to figures.
  acknowledgement: 'figures',
  abstract: 'figures',
  reference: 'figures',
};

/** Numbering info of one thesis object (figure, table, ...); defaults to figures. */
export function useThesisObject<T extends TThesisObjectType>(
  id: string,
  mode: TThesisObjectModeType = 'figure'
): T | undefined {
  const state = useThesisConfigContext();
  return state[SLICE_BY_MODE[mode]][id] as T | undefined;
}
