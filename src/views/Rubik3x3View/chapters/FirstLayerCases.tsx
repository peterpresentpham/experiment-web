import { TFirstLayerCase } from 'src/configs/rubikFirstLayer.config';
import { CardGrid, CaseCard } from '../parts';

export type TCaseText = Record<string, { title: string; note: string }>;

/** Cards for first-layer cases: picture, main algorithm, the other options and a note. */
export function FirstLayerCaseGrid({
  cases,
  text,
}: {
  cases: Array<TFirstLayerCase>;
  text: TCaseText;
}) {
  return (
    <CardGrid>
      {cases.map((c) => (
        <CaseCard
          key={c.id}
          title={text[c.id].title}
          image={c.image}
          algs={[c.algs[0]]}
          sources={[c.sources[0]]}
          options={c.algs.slice(1).map((alg, i) => ({ alg, source: c.sources[i + 1] }))}
          note={text[c.id].note}
        />
      ))}
    </CardGrid>
  );
}
