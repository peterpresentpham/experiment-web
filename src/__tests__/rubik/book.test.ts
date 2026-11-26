import {
  LBL_STEP_COUNT,
  RUBIK_BOOK,
  RUBIK_LEVELS,
  RUBIK_PATHS,
} from 'src/configs/rubikBook.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { LOCALES } from 'src/i18n/config';
import { rubikBookMessages } from 'src/i18n/messages/rubikBook';
import { bookIds, buildToc, pathLinks, sectionTitle } from 'src/services/rubik/book.utils';
import { describe, expect, it } from 'vitest';

function titlesOf(locale: (typeof LOCALES)[number]) {
  const { chapters, sections } = rubikBookMessages[locale];
  return {
    chapters,
    sections,
    steps: RUBIK_GUIDE[locale].beginnerSteps.map((step) => step.title),
  };
}

describe('rubik book structure', () => {
  const ids = bookIds(RUBIK_BOOK);

  it('has unique anchors', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has one layer-by-layer section per beginner step', () => {
    for (const locale of LOCALES) {
      expect(RUBIK_GUIDE[locale].beginnerSteps).toHaveLength(LBL_STEP_COUNT);
    }
  });

  it.each(LOCALES)('titles every chapter and section in %s', (locale) => {
    const titles = titlesOf(locale);
    for (const chapter of RUBIK_BOOK) {
      expect(titles.chapters[chapter.id], `chapter ${chapter.id}`).toBeTruthy();
      for (const section of chapter.sections) {
        expect(sectionTitle(section.id, titles), `section ${section.id}`).toBeTruthy();
      }
    }
  });

  it.each(LOCALES)('has no title without a place in the book in %s', (locale) => {
    const { chapters, sections } = rubikBookMessages[locale];
    const known = new Set(ids);
    for (const id of [...Object.keys(chapters), ...Object.keys(sections)]) {
      expect(known.has(id), `title of unknown id ${id}`).toBe(true);
    }
  });

  it('only points the reading paths at ids that exist', () => {
    const known = new Set(ids);
    for (const level of RUBIK_LEVELS) {
      expect(RUBIK_PATHS[level].length).toBeGreaterThan(0);
      for (const id of RUBIK_PATHS[level]) expect(known.has(id), `${level}: ${id}`).toBe(true);
    }
  });
});

describe('buildToc', () => {
  it('fills in titles, the step titles and the levels', () => {
    const toc = buildToc(RUBIK_BOOK, titlesOf('en'));
    const lbl = toc.find((chapter) => chapter.id === 'lbl')!;
    expect(lbl.title).toBe(rubikBookMessages.en.chapters.lbl);
    expect(lbl.sections[0]).toMatchObject({
      id: 'lbl-step-1',
      title: RUBIK_GUIDE.en.beginnerSteps[0].title,
      level: 'beginner',
    });
  });

  it('turns a path into links and drops unknown ids', () => {
    const toc = buildToc(RUBIK_BOOK, titlesOf('en'));
    const links = pathLinks(['basics', 'cross-direct', 'nope'], toc);
    expect(links.map((link) => link.id)).toEqual(['basics', 'cross-direct']);
    expect(links[1].title).toBe(rubikBookMessages.en.sections['cross-direct']);
  });
});
