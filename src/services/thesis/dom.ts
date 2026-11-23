import { THESIS_CLASS } from 'src/configs/thesis.constance';

/**
 * The title of the thesis object `id` (its `${id}_title` element), without the number shown in
 * front of it: once the numbers are shown, a title read as is would repeat them.
 *
 * Found by id rather than a `#id` selector, which breaks on ids with spaces or dots.
 */
export function readTitle(id: string) {
  const element = document.getElementById(`${id}_title`);
  if (!element) return '';
  const copy = element.cloneNode(true) as Element;
  for (const label of copy.querySelectorAll(`.${THESIS_CLASS.indexLabel}`)) label.remove();
  return copy.textContent?.trim() ?? '';
}

/** Elements of `className` under `container` that are not inside an appendix. */
export function outsideAppendixes(container: Element, className: string) {
  return [...container.querySelectorAll(`.${className}`)].filter(
    (element) => !element.closest(`.${THESIS_CLASS.appendix}`)
  );
}
