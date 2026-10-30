export type TThesisSameChapterType = 'acknowledgement' | 'abstract' | 'reference' | 'appendix';

export type TThesisObjectModeType =
  | TThesisSameChapterType
  | 'chapter'
  | 'section'
  | 'subsection'
  | 'figure'
  | 'equation'
  | 'cite'
  | 'program'
  | 'table'
  | 'algorithm';
export type TThesisObjectType = { id: string; title: string; index: number | string };
export type TThesisChapterType = TThesisObjectType;
export type TThesisSectionType = TThesisObjectType;
export type TThesisSubsectionType = TThesisObjectType;
export type TThesisFigureType = TThesisObjectType;
export type TThesisEquationType = Omit<TThesisObjectType, 'title'>;
export type TThesisProgramType = TThesisObjectType;
export type TThesisTableType = TThesisObjectType;
export type TThesisAlgorithmType = TThesisObjectType;
export type TThesisAppendixType = TThesisObjectType;
export type TThesisCiteIndexType = { id: string; index: number | string };
export type TThesisCiteType = {
  id: string;
  author: string;
  title: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  year?: number | string;
  DOI?: string;
  keywords?: string;
  url?: string;
};

export type TTableOfContentType = Array<{
  id: string;
  title: string;
  index: number | string;
  type: TThesisObjectModeType;
  content: TTableOfContentType;
}>;

export type TContentType = {
  chapters: { [key: string]: TThesisChapterType };
  sections: { [key: string]: TThesisSectionType };
  subsections: { [key: string]: TThesisSubsectionType };
  figures: { [key: string]: TThesisFigureType };
  equations: { [key: string]: TThesisEquationType };
  cites: { [key: string]: TThesisCiteIndexType };
  programs: { [key: string]: TThesisProgramType };
  tables: { [key: string]: TThesisTableType };
  algorithms: { [key: string]: TThesisAlgorithmType };
  appendixes: { [key: string]: TThesisAppendixType };
};
