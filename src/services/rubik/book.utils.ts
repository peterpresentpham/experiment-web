import type { TBookChapter, TRubikLevel } from 'src/configs/rubikBook.config';

export type TTocSection = { id: string; title: string; level?: TRubikLevel };
export type TTocChapter = { id: string; title: string; sections: Array<TTocSection> };

type TTitles = {
  chapters: Record<string, string>;
  sections: Record<string, string>;
  /** Titles of the layer-by-layer steps, in order; they back the `lbl-step-N` sections. */
  steps: Array<string>;
};

const STEP_ID = /^lbl-step-(\d+)$/;

/** Title of a section, or `undefined` when the id has no title (a bug the tests catch). */
export function sectionTitle(id: string, titles: TTitles): string | undefined {
  const step = STEP_ID.exec(id);
  return step ? titles.steps[Number(step[1]) - 1] : titles.sections[id];
}

/** The book with every title filled in, ready for the contents list and the headings. */
export function buildToc(book: Array<TBookChapter>, titles: TTitles): Array<TTocChapter> {
  return book.map((chapter) => ({
    id: chapter.id,
    title: titles.chapters[chapter.id] ?? chapter.id,
    sections: chapter.sections.map((section) => ({
      id: section.id,
      title: sectionTitle(section.id, titles) ?? section.id,
      level: section.level,
    })),
  }));
}

/** Every anchor of the book, chapters and sections, in reading order. */
export function bookIds(book: Array<TBookChapter>): Array<string> {
  return book.flatMap((chapter) => [chapter.id, ...chapter.sections.map((s) => s.id)]);
}

/** Turns the ids of a reading path into links; ids the book does not know are dropped. */
export function pathLinks(ids: Array<string>, toc: Array<TTocChapter>) {
  const titles = new Map<string, string>();
  for (const chapter of toc) {
    titles.set(chapter.id, chapter.title);
    for (const section of chapter.sections) titles.set(section.id, section.title);
  }
  return ids.flatMap((id) => (titles.has(id) ? [{ id, title: titles.get(id)! }] : []));
}
