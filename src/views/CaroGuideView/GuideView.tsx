import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { CARO_LEVELS } from 'src/configs/caroGuide.config';
import { caroGuideMessages } from 'src/i18n/messages/caroGuide';
import { getMessages } from 'src/i18n/server';
import CaroGuideTabs, { TCaroGuidePanel } from './CaroGuideTabs';
import LevelPanel from './LevelPanel';

// Same order as `caroGuideMessages.sources`.
const SOURCE_URLS = [
  'https://en.wikipedia.org/wiki/Gomoku',
  'https://vi.wikipedia.org/wiki/C%E1%BB%9D_caro',
  'https://project.dke.maastrichtuniversity.nl/games/files/phd/SearchingForSolutions.pdf',
  'https://gomocup.org',
  'https://github.com/dhbloo/rapfi',
];

export default async function GuideView({ level }: { level?: string }) {
  const t = await getMessages(caroGuideMessages);
  const panels: Array<TCaroGuidePanel> = CARO_LEVELS.map((value) => ({
    value,
    ...t.levels[value],
    content: <LevelPanel level={value} />,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-3xl leading-relaxed">{t.intro}</p>
      <p className="mt-3 max-w-3xl rounded-md border bg-muted/40 p-3 text-sm leading-relaxed">
        {t.howTo}
      </p>
      <Link
        href="/caro"
        className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        <Gamepad2 className="size-4" />
        {t.playLink}
      </Link>

      <CaroGuideTabs panels={panels} defaultLevel={level} />

      <section className="mt-16 border-t pt-4 text-sm">
        <p className="font-semibold">{t.sourcesTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          {SOURCE_URLS.map((href, i) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noreferrer" className="underline">
                {t.sources[i]}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
