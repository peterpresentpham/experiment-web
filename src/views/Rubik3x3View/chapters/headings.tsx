import { cache, ReactNode } from 'react';
import { Badge } from 'src/components/shadcn/badge';
import { RUBIK_BOOK, TRubikLevel } from 'src/configs/rubikBook.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { rubikBookMessages } from 'src/i18n/messages/rubikBook';
import { getLocale } from 'src/i18n/server';
import { buildToc } from 'src/services/rubik/book.utils';
import { H2, H3 } from '../parts';

/** The book with titles in the current language. Cached so every heading shares one build. */
export const getBookToc = cache(async () => {
  const locale = await getLocale();
  const { chapters, sections } = rubikBookMessages[locale];
  const steps = RUBIK_GUIDE[locale].beginnerSteps.map((step) => step.title);
  return buildToc(RUBIK_BOOK, { chapters, sections, steps });
});

const BADGE_VARIANT = { beginner: 'success', intermediate: 'info', advanced: 'warning' } as const;

export async function LevelBadge({ level }: { level: TRubikLevel }) {
  const { levels } = rubikBookMessages[await getLocale()];
  return <Badge variant={BADGE_VARIANT[level]}>{levels[level].label}</Badge>;
}

/** Chapter title, taken from the same table as the contents list. */
export async function ChapterHeading({ id }: { id: string }) {
  const chapter = (await getBookToc()).find((entry) => entry.id === id);
  return <H2 id={id}>{chapter?.title ?? id}</H2>;
}

/** Section title with its level badge, taken from the same table as the contents list. */
export async function SectionHeading({ id, children }: { id: string; children?: ReactNode }) {
  const section = (await getBookToc()).flatMap((entry) => entry.sections).find((s) => s.id === id);
  return (
    <H3 id={id}>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {children ?? section?.title ?? id}
        {section?.level && <LevelBadge level={section.level} />}
      </span>
    </H3>
  );
}
