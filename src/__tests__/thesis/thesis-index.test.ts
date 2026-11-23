// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { buildContent } from 'src/services/thesis/index-system';
import { buildTableOfContent } from 'src/services/thesis/table-of-content';

const C = THESIS_CLASS;

/** A thesis object as the Thesis boxes render it: a title element, its number in a label. */
function box(kind: keyof typeof C, id: string, title: string, children = '', label = '') {
  return `<div id="${id}" class="${C[kind]}"><p id="${id}_title">${
    label ? `<span class="${C.indexLabel}">${label}</span>` : ''
  }${title}</p>${children}</div>`;
}

function mount(html: string) {
  document.body.innerHTML = `<div id="thesis">${html}</div>`;
}

afterEach(() => {
  document.body.innerHTML = '';
});

const THESIS = [
  box(
    'chapter',
    'chapter_one',
    'Introduction',
    box('section', 'section_motivation', 'Motivation', box('figure', 'figure_chain', 'Chain'))
  ),
  box('chapter', 'chapter_two', 'Background', box('table', 'table_costs', 'Costs')),
  box(
    'appendix',
    'appendix_a',
    'Circuits',
    box('section', 'section_a circuit', 'A circuit', box('figure', 'figure_compiler', 'Compiler'))
  ),
].join('');

describe('thesis table of contents', () => {
  it('lists the figures and tables of appendixes too, numbered by appendix', () => {
    mount(THESIS);
    const { figures, tables } = buildTableOfContent('thesis', 'chapter');
    expect(figures.flat().map(({ id, index }) => [id, index])).toEqual([
      ['figure_chain', '1.1'],
      ['figure_compiler', 'A.1'],
    ]);
    expect(tables.flat().map(({ id, index }) => [id, index])).toEqual([['table_costs', '2.1']]);
  });

  it('reads titles without the number shown in front of them', () => {
    mount(
      box(
        'chapter',
        'chapter_one',
        'Introduction',
        box('figure', 'figure_chain', 'Chain', '', 'Figure 1.1: ')
      )
    );
    const { content, figures } = buildTableOfContent('thesis', 'chapter');
    expect(content[0].title).toBe('Introduction');
    expect(figures[0][0].title).toBe('Chain');
  });

  it('keeps appendix sections out of the top-level sections', () => {
    mount(
      box('section', 'section_intro', 'Intro') +
        box('appendix', 'appendix_a', 'Extra', box('section', 'section_more', 'More'))
    );
    expect(buildTableOfContent('thesis', 'section').content.map((item) => item.id)).toEqual([
      'section_intro',
    ]);
  });
});

describe('thesis numbering', () => {
  it('finds titles of ids a CSS selector cannot name', () => {
    mount(THESIS);
    const content = buildContent('thesis', 'chapter')!;
    expect(content.sections['section_a circuit']).toEqual({
      id: 'section_a circuit',
      title: 'A circuit',
      index: 'A.1',
    });
    expect(content.figures.figure_compiler.index).toBe('A.1');
  });

  it('numbers appendix sections only within the appendix in the section layout', () => {
    mount(
      box('section', 'section_intro', 'Intro') +
        box('appendix', 'appendix_a', 'Extra', box('section', 'section_more', 'More'))
    );
    const { sections } = buildContent('thesis', 'section')!;
    expect(sections.section_intro.index).toBe(1);
    expect(sections.section_more.index).toBe('A.1');
  });
});
