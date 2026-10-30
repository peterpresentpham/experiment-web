import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TThesisFigureType, TThesisTableType } from 'src/types/thesis.type';

export function buildListOfFigures(elements: NodeListOf<Element>) {
  let elementCounter = 1;
  const result: Array<Array<TThesisFigureType>> = [];
  for (const element of elements) {
    const items = element.querySelectorAll(`.${THESIS_CLASS.figure}`);
    let figureCounter = 1;
    const _result: Array<TThesisFigureType> = [];
    for (const item of items) {
      const id = item.id;
      const titleComponent = element.querySelector(`#${id}_title`);
      const title = titleComponent?.textContent;
      _result.push({ id, title: title || '', index: `${elementCounter}.${figureCounter++}` });
    }
    elementCounter++;
    result.push(_result);
  }
  return result;
}

export function buildListOfTables(elements: NodeListOf<Element>) {
  let elementCounter = 1;
  const result: Array<Array<TThesisTableType>> = [];
  for (const element of elements) {
    const items = element.querySelectorAll(`.${THESIS_CLASS.table}`);
    let figureCounter = 1;
    const _result: Array<TThesisTableType> = [];
    for (const item of items) {
      const id = item.id;
      const titleComponent = element.querySelector(`#${id}_title`);
      const title = titleComponent?.textContent;
      _result.push({ id, title: title || '', index: `${elementCounter}.${figureCounter++}` });
    }
    elementCounter++;
    result.push(_result);
  }
  return result;
}
