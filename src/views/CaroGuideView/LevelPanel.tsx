import { CARO_EXAMPLES, CARO_SECTIONS, TCaroLevel } from 'src/configs/caroGuide.config';
import { caroGuideMessages } from 'src/i18n/messages/caroGuide';
import { getMessages } from 'src/i18n/server';
import CaroGuideBoard from './CaroGuideBoard';
import { Bullets, Callout, H2, H3, P } from './parts';

/** The sections of one level, each followed by its example boards. */
export default async function LevelPanel({ level }: { level: TCaroLevel }) {
  const t = await getMessages(caroGuideMessages);

  return (
    <div>
      {CARO_SECTIONS[level].map(({ id, examples }) => {
        const section = t.sections[id];
        return (
          <section key={id}>
            <H2 id={id}>{section.title}</H2>
            {section.body.map((text) => (
              <P key={text} className="max-w-3xl">
                {text}
              </P>
            ))}
            {section.bullets && <Bullets items={section.bullets} />}
            {section.tip && <Callout title={section.tip.title}>{section.tip.text}</Callout>}
            {examples.length > 0 && (
              <div className="mt-2 grid gap-x-8 md:grid-cols-2">
                {examples.map((exampleId) => (
                  <div key={exampleId}>
                    <H3>{t.examples[exampleId].title}</H3>
                    <P className="mb-3 max-w-md">{t.examples[exampleId].caption}</P>
                    <CaroGuideBoard example={CARO_EXAMPLES[exampleId]} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
