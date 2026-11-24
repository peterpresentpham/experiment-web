import { CHESS_LEVELS } from 'src/configs/chessGuide.config';
import { chessMessages } from 'src/i18n/messages/chess';
import { getMessages } from 'src/i18n/server';
import ChessTabs, { TChessPanel } from './ChessTabs';
import LevelPanel from './LevelPanel';

// Same order as `chessMessages.sources`.
const SOURCE_URLS = [
  'https://handbook.fide.com/chapter/E012023',
  'https://lichess.org/learn',
  'https://en.wikipedia.org/wiki/Rules_of_chess',
  'https://en.wikipedia.org/wiki/Chess_tactics',
  'https://github.com/jhlywa/chess.js',
];

export default async function GuideView({ level }: { level?: string }) {
  const t = await getMessages(chessMessages);
  const panels: Array<TChessPanel> = CHESS_LEVELS.map((value) => ({
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

      <ChessTabs panels={panels} defaultLevel={level} />

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
