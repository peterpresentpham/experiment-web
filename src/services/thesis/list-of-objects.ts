import { TThesisFigureType, TThesisTableType } from 'src/types/thesis.type';
import { readTitle } from './dom';

/**
 * The figures (or tables) of each chapter or appendix, numbered `${prefix}.1`, `${prefix}.2`, ...
 * within it, for the lists of figures and tables. Groups without any are left out.
 */
export function buildListOfObjects(
  groups: Array<{ element: Element; prefix: string }>,
  className: string
): Array<Array<TThesisFigureType | TThesisTableType>> {
  return groups
    .map(({ element, prefix }) =>
      [...element.querySelectorAll(`.${className}`)].map((item, index) => ({
        id: item.id,
        title: readTitle(item.id),
        index: `${prefix}.${index + 1}`,
      }))
    )
    .filter((objects) => objects.length > 0);
}
