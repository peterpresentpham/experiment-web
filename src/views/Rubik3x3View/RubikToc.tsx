'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from 'src/lib/utils';
import type { TTocChapter } from 'src/services/rubik/book.utils';

type TProps = {
  chapters: Array<TTocChapter>;
  labels: { contents: string; open: string };
};

// A heading counts as "current" once it has scrolled above this line, just under the fixed header.
const ACTIVE_LINE_PX = 120;

/** Id of the last heading that has scrolled past the active line, or the first one. */
function currentId(ids: Array<string>): string {
  let current = ids[0] ?? '';
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element && element.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = id;
  }
  return current;
}

function useActiveId(chapters: Array<TTocChapter>) {
  const [active, setActive] = useState('');

  useEffect(() => {
    const ids = chapters.flatMap((chapter) => [chapter.id, ...chapter.sections.map((s) => s.id)]);
    let frame = 0;
    const update = () => {
      frame = 0;
      setActive(currentId(ids));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [chapters]);

  return active;
}

function TocList({
  chapters,
  active,
  onNavigate,
}: {
  chapters: Array<TTocChapter>;
  active: string;
  onNavigate?: () => void;
}) {
  const activeChapter = chapters.find(
    (chapter) => chapter.id === active || chapter.sections.some((s) => s.id === active)
  )?.id;

  return (
    <ul className="space-y-1 text-sm">
      {chapters.map((chapter) => {
        const open = chapter.id === activeChapter;
        return (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              onClick={onNavigate}
              aria-current={chapter.id === active ? 'location' : undefined}
              className={cn(
                'block rounded-md px-2 py-1 hover:bg-muted',
                open ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}
            >
              {chapter.title}
            </a>
            {open && (
              <ul className="mt-1 mb-2 ml-3 space-y-0.5 border-l pl-2">
                {chapter.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={onNavigate}
                      aria-current={section.id === active ? 'location' : undefined}
                      className={cn(
                        'block rounded-md px-2 py-0.5 text-xs hover:bg-muted',
                        section.id === active
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Table of contents: a sticky side list on wide screens and a collapsible bar under the header on
 * phones. It marks the heading being read and opens the sections of the current chapter only.
 */
export default function RubikToc({ chapters, labels }: TProps) {
  const active = useActiveId(chapters);
  const [open, setOpen] = useState(false);
  const activeTitle =
    chapters.flatMap((chapter) => chapter.sections).find((section) => section.id === active)
      ?.title ?? chapters.find((chapter) => chapter.id === active)?.title;

  return (
    <>
      <nav
        aria-label={labels.contents}
        className="sticky top-(--header-height) z-20 -mx-4 border-b bg-background px-4 lg:hidden"
      >
        <button
          type="button"
          aria-expanded={open}
          aria-label={labels.open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-2 py-2 text-sm font-medium"
        >
          <span className="truncate">
            {labels.contents}
            {activeTitle && (
              <span className="font-normal text-muted-foreground"> · {activeTitle}</span>
            )}
          </span>
          <ChevronDown
            className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
          />
        </button>
        {open && (
          <div className="max-h-[60dvh] overflow-y-auto pb-3">
            <TocList chapters={chapters} active={active} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </nav>

      <nav
        aria-label={labels.contents}
        className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] self-start overflow-y-auto pr-2 lg:block"
      >
        <p className="mb-2 px-2 text-sm font-semibold">{labels.contents}</p>
        <TocList chapters={chapters} active={active} />
      </nav>
    </>
  );
}
