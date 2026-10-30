import { appendixIndex, THESIS_CLASS } from 'src/configs/thesis.constance';
import {
  TContentType,
  TThesisAlgorithmType,
  TThesisAppendixType,
  TThesisChapterType,
  TThesisCiteIndexType,
  TThesisEquationType,
  TThesisFigureType,
  TThesisProgramType,
  TThesisSectionType,
  TThesisSubsectionType,
  TThesisTableType,
} from 'src/types/thesis.type';

function buildCiteContent(element: HTMLElement, result: { [key: string]: TThesisCiteIndexType }) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.cite}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    result[id] = { id, index: _counter++ };
  }
}

function buildSubsectionContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisSubsectionType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.subsection}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;
    result[id] = { id, title: title || '', index: `${counter}.${_counter++}` };
  }
}

function _buildSectionContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisSectionType },
  subsectionResult: { [key: string]: TThesisSubsectionType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.section}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;
    const _index = `${counter}.${_counter++}`;
    buildSubsectionContent(item, _index, subsectionResult);
    result[id] = { id, title: title || '', index: _index };
  }
}

function buildFigureContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisFigureType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.figure}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;
    result[id] = { id, title: title || '', index: `${counter}.${_counter++}` };
  }
}

function buildProgramContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisProgramType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.program}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;
    result[id] = { id, title: title || '', index: `${counter}.${_counter++}` };
  }
}

function buildTableContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisTableType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.table}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;
    result[id] = { id, title: title || '', index: `${counter}.${_counter++}` };
  }
}

function buildAlgorithmContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisAlgorithmType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.algorithm}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;
    result[id] = { id, title: title || '', index: `${counter}.${_counter++}` };
  }
}

function buildEquationContent(
  element: Element,
  counter: string | number,
  result: { [key: string]: TThesisEquationType }
) {
  const items = element.querySelectorAll(`.${THESIS_CLASS.equation}`);
  let _counter = 1;
  for (const item of items) {
    const id = item.id;
    result[id] = { id, index: `${counter}.${_counter++}` };
  }
}

function buildAppendixContent(
  container: HTMLElement,
  sections: { [key: string]: TThesisSectionType },
  subsections: { [key: string]: TThesisSubsectionType },
  figures: { [key: string]: TThesisFigureType },
  equations: { [key: string]: TThesisEquationType },
  programs: { [key: string]: TThesisProgramType },
  tables: { [key: string]: TThesisTableType },
  algorithms: { [key: string]: TThesisAlgorithmType }
) {
  const elements = container.querySelectorAll(`.${THESIS_CLASS.appendix}`);
  const appendixes: { [key: string]: TThesisAppendixType } = {};
  let counter = 0;
  for (const element of elements) {
    const id = element.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;

    _buildSectionContent(element, appendixIndex[counter], sections, subsections);
    buildFigureContent(element, appendixIndex[counter], figures);
    buildEquationContent(element, appendixIndex[counter], equations);
    buildProgramContent(element, appendixIndex[counter], programs);
    buildTableContent(element, appendixIndex[counter], tables);
    buildAlgorithmContent(element, appendixIndex[counter], algorithms);
    appendixes[id] = { id, title: title || '', index: appendixIndex[counter++] };
  }
  return { appendixes };
}

function buildChapterContent(container: HTMLElement): TContentType {
  const elements = container.querySelectorAll(`.${THESIS_CLASS.chapter}`);
  const chapters: { [key: string]: TThesisChapterType } = {};
  const sections: { [key: string]: TThesisSectionType } = {};
  const subsections: { [key: string]: TThesisSubsectionType } = {};
  const figures: { [key: string]: TThesisFigureType } = {};
  const equations: { [key: string]: TThesisEquationType } = {};
  const cites: { [key: string]: TThesisCiteIndexType } = {};
  const programs: { [key: string]: TThesisProgramType } = {};
  const tables: { [key: string]: TThesisTableType } = {};
  const algorithms: { [key: string]: TThesisAlgorithmType } = {};
  let counter = 1;
  for (const element of elements) {
    const id = element.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;

    _buildSectionContent(element, counter, sections, subsections);
    buildFigureContent(element, counter, figures);
    buildEquationContent(element, counter, equations);
    buildProgramContent(element, counter, programs);
    buildTableContent(element, counter, tables);
    buildAlgorithmContent(element, counter, algorithms);
    chapters[id] = { id, title: title || '', index: counter++ };
  }
  const { appendixes } = buildAppendixContent(
    container,
    sections,
    subsections,
    figures,
    equations,
    programs,
    tables,
    algorithms
  );
  buildCiteContent(container, cites);
  return {
    chapters,
    sections,
    subsections,
    figures,
    equations,
    cites,
    programs,
    tables,
    algorithms,
    appendixes,
  };
}

function buildSectionContent(container: HTMLElement): TContentType {
  const elements = container.querySelectorAll(`.${THESIS_CLASS.section}`);
  const sections: { [key: string]: TThesisSectionType } = {};
  const subsections: { [key: string]: TThesisSubsectionType } = {};
  const figures: { [key: string]: TThesisFigureType } = {};
  const equations: { [key: string]: TThesisEquationType } = {};
  const cites: { [key: string]: TThesisCiteIndexType } = {};
  const programs: { [key: string]: TThesisProgramType } = {};
  const tables: { [key: string]: TThesisTableType } = {};
  const algorithms: { [key: string]: TThesisAlgorithmType } = {};
  let counter = 1;
  for (const element of elements) {
    const id = element.id;
    const titleComponent = element.querySelector(`#${id}_title`);
    const title = titleComponent?.textContent;

    buildSubsectionContent(element, counter, subsections);
    buildFigureContent(element, counter, figures);
    buildEquationContent(element, counter, equations);
    buildProgramContent(element, counter, programs);
    buildTableContent(element, counter, tables);
    buildAlgorithmContent(element, counter, algorithms);
    sections[id] = { id, title: title || '', index: counter++ };
  }
  const { appendixes } = buildAppendixContent(
    container,
    sections,
    subsections,
    figures,
    equations,
    programs,
    tables,
    algorithms
  );
  buildCiteContent(container, cites);
  return {
    chapters: {},
    sections,
    subsections,
    figures,
    equations,
    cites,
    programs,
    tables,
    algorithms,
    appendixes,
  };
}

export function buildContent(containerId: string, firstLevel: 'chapter' | 'section') {
  const container = document.getElementById(containerId);
  if (container) {
    return firstLevel == 'chapter'
      ? buildChapterContent(container)
      : buildSectionContent(container);
  }
}
