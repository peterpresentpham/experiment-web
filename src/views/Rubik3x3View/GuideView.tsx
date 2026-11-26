import { rubikBookMessages } from 'src/i18n/messages/rubikBook';
import { getLocale } from 'src/i18n/server';
import BasicsChapter from './chapters/BasicsChapter';
import CrossChapter from './chapters/CrossChapter';
import F2lChapter from './chapters/F2lChapter';
import { getBookToc } from './chapters/headings';
import LblChapter from './chapters/LblChapter';
import OllChapter from './chapters/OllChapter';
import PathChapter from './chapters/PathChapter';
import PlanChapter from './chapters/PlanChapter';
import PllChapter from './chapters/PllChapter';
import SkillsChapter from './chapters/SkillsChapter';
import RubikToc from './RubikToc';

/** The Rubik guide as one book: contents on the side, chapters in reading order. */
export default async function GuideView() {
  const { title, contents, contentsOpen } = rubikBookMessages[await getLocale()];
  const toc = await getBookToc();

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <div className="mt-4 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <RubikToc chapters={toc} labels={{ contents, open: contentsOpen }} />
        <article className="min-w-0 pb-16">
          <PathChapter />
          <BasicsChapter />
          <LblChapter />
          <CrossChapter />
          <F2lChapter />
          <OllChapter />
          <PllChapter />
          <SkillsChapter />
          <PlanChapter />
        </article>
      </div>
    </div>
  );
}
