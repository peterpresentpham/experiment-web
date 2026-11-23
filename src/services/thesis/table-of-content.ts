import { appendixIndex, THESIS_CLASS } from 'src/configs/thesis.constance';
import {
  TTableOfContentType,
  TThesisAppendixType,
  TThesisFigureType,
  TThesisObjectType,
  TThesisTableType,
} from 'src/types/thesis.type';
import { outsideAppendixes, readTitle } from './dom';
import { buildListOfObjects } from './list-of-objects';

function buildSubsectionTableOfContent(elements: Iterable<Element>): TTableOfContentType {
  const result: TTableOfContentType = [];
  let counter = 1;
  for (const element of elements) {
    const id = element.id;
    const title = readTitle(id);
    result.push({ id, title: title || '', index: counter++, type: 'subsection', content: [] });
  }
  return result;
}

function buildSectionTableOfContent(elements: Iterable<Element>): TTableOfContentType {
  const result: TTableOfContentType = [];
  let counter = 1;
  for (const element of elements) {
    const id = element.id;
    const title = readTitle(id);
    const subsectionElements = element.querySelectorAll(`.${THESIS_CLASS.subsection}`);
    const subsections = buildSubsectionTableOfContent(subsectionElements);
    result.push({
      id,
      title: title || '',
      index: counter++,
      type: 'section',
      content: subsections,
    });
  }
  return result;
}

function buildChapterTableOfContent(elements: Iterable<Element>): TTableOfContentType {
  const result: TTableOfContentType = [];
  let counter = 1;
  for (const element of elements) {
    const id = element.id;
    const title = readTitle(id);
    const sectionElements = element.querySelectorAll(`.${THESIS_CLASS.section}`);
    const sections = buildSectionTableOfContent(sectionElements);
    result.push({ id, title: title || '', index: counter++, type: 'chapter', content: sections });
  }
  return result;
}

function buildSameChapterContent(container: HTMLElement) {
  const appendixes = container.querySelectorAll(`.${THESIS_CLASS.appendix}`);
  const appendixResult: Array<TThesisAppendixType> = [];
  let counter = 0;
  for (const appendix of appendixes) {
    const id = appendix.id;
    const title = readTitle(id);
    appendixResult.push({ id, title: title || '', index: appendixIndex[counter++] });
  }
  const abstract = container.querySelector(`.${THESIS_CLASS.abstract}`);
  const acknowledge = container.querySelector(`.${THESIS_CLASS.acknowledgement}`);
  const reference = container.querySelector(`.${THESIS_CLASS.reference}`);
  return {
    appendixes: appendixResult,
    abstract: Boolean(abstract),
    acknowledge: Boolean(acknowledge),
    reference: Boolean(reference),
  };
}

export function buildTableOfContent(containerId: string, firstLevel: 'chapter' | 'section') {
  const container = document.getElementById(containerId);
  let content: TTableOfContentType = [];
  let figures: Array<Array<TThesisFigureType>> = [];
  let tables: Array<Array<TThesisTableType>> = [];
  let _result: {
    appendixes: Array<TThesisObjectType>;
    abstract: boolean;
    acknowledge: boolean;
    reference: boolean;
  } = {
    appendixes: [],
    abstract: false,
    acknowledge: false,
    reference: false,
  };
  if (container) {
    _result = buildSameChapterContent(container);
    const elements =
      firstLevel == 'chapter'
        ? [...container.querySelectorAll(`.${THESIS_CLASS.chapter}`)]
        : outsideAppendixes(container, THESIS_CLASS.section);
    content =
      firstLevel == 'chapter'
        ? buildChapterTableOfContent(elements)
        : buildSectionTableOfContent(elements);
    // Appendixes number their figures and tables A.1, B.1, ... (as the index system does).
    const groups = [
      ...elements.map((element, index) => ({ element, prefix: String(index + 1) })),
      ...[...container.querySelectorAll(`.${THESIS_CLASS.appendix}`)].map((element, index) => ({
        element,
        prefix: appendixIndex[index],
      })),
    ];
    figures = buildListOfObjects(groups, THESIS_CLASS.figure);
    tables = buildListOfObjects(groups, THESIS_CLASS.table);
  }
  return { content, figures, tables, ..._result };
}
