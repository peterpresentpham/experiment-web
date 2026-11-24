import LazyChessPlayer from 'src/components/chess/LazyChessPlayer';
import { CHESS_EXAMPLES, CHESS_SECTIONS, TChessLevel } from 'src/configs/chessGuide.config';
import { chessMessages } from 'src/i18n/messages/chess';
import { getMessages } from 'src/i18n/server';
import { Bullets, Callout, H2, H3, P } from './parts';

/** The sections of one level, each followed by its 3D examples. */
export default async function LevelPanel({ level }: { level: TChessLevel }) {
  const t = await getMessages(chessMessages);
  const labels = { ...t.player };

  return (
    <div>
      {CHESS_SECTIONS[level].map(({ id, examples }) => {
        const section = t.sections[id];
        return (
          <section key={id}>
            <H2 id={id}>{section.title}</H2>
            {section.body.map((text) => (
              <P key={text}>{text}</P>
            ))}
            {section.bullets && <Bullets items={section.bullets} />}
            {section.tip && <Callout title={section.tip.title}>{section.tip.text}</Callout>}
            {examples.map((exampleId) => (
              <div key={exampleId} className="mt-2">
                <H3>{t.examples[exampleId].title}</H3>
                <P className="mb-3 max-w-2xl">{t.examples[exampleId].caption}</P>
                <LazyChessPlayer example={CHESS_EXAMPLES[exampleId]} labels={labels} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
