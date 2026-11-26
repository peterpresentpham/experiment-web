import { ReactNode } from 'react';
import { ContainerClipboard } from 'src/components/CopyClipboard';
import CubeIso from 'src/components/rubik/CubeIso';
import CubeTop from 'src/components/rubik/CubeTop';
import { ALG_SOURCES, TAlgOption, TAlgSource } from 'src/configs/rubikAlgOptions.config';
import { AlgType, CubeImage } from 'src/configs/rubikGuide.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { applyAlg, caseFromAlg, solvedCube } from 'src/lib/cube/cube';
import { cn } from 'src/lib/utils';
import Alg3DToggle from './Alg3DToggle';

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-20 border-b pb-2 text-2xl font-bold sm:text-3xl">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 mb-2 text-xl font-semibold">{children}</h3>;
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-3 leading-relaxed', className)}>{children}</p>;
}

export function Bullets({ items }: { items: Array<ReactNode> }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 rounded-md border bg-muted/40 p-4">
      <p className="font-semibold">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function cubeState(image: CubeImage) {
  const base = image.alg
    ? caseFromAlg(image.alg, image.setup)
    : applyAlg(solvedCube(), image.setup ?? '');
  return image.view ? applyAlg(base, image.view) : base;
}

export function CubePicture({ image, size }: { image: CubeImage; size?: number }) {
  const state = cubeState(image);
  const picture =
    image.kind === 'iso' ? (
      <CubeIso state={state} mask={image.mask} size={size ?? 110} title={image.caption} />
    ) : (
      <CubeTop
        state={state}
        mask={image.mask}
        arrows={image.arrows}
        size={size ?? 100}
        title={image.caption}
      />
    );
  return (
    <figure className="flex w-fit flex-col items-center gap-1">
      {picture}
      {image.caption && (
        <figcaption className="max-w-40 text-center text-xs text-muted-foreground">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function AlgText({ alg, main = true }: { alg: string; main?: boolean }) {
  return (
    <ContainerClipboard
      className={cn('w-fit border border-border px-2 py-1', !main && 'opacity-80')}
      copyText={alg}
    >
      <p className={cn('font-mono font-semibold', main ? 'text-lg' : 'text-sm')}>{alg}</p>
    </ContainerClipboard>
  );
}

const TEXT = defineMessages<{ derived: string }>({
  en: { derived: 'Worked out here, checked in simulation' },
  vi: { derived: 'Tự suy ra, đã kiểm bằng mô phỏng' },
});

/** Link to where an algorithm was found. */
export async function SourceTag({ source }: { source: TAlgSource }) {
  if (source === 'derived') {
    const t = TEXT[await getLocale()];
    return <span className="text-xs text-muted-foreground">{t.derived}</span>;
  }
  const { name, url } = ALG_SOURCES[source];
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-muted-foreground underline"
    >
      {name}
    </a>
  );
}

/** Extra algorithms for one case, each with its source and note. */
export async function AlgOptionList({ options }: { options: Array<TAlgOption> }) {
  const locale = await getLocale();
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {options.map((o) => (
        <li key={o.alg} className="flex flex-col gap-0.5">
          <AlgText alg={o.alg} main={false} />
          <span className="flex flex-wrap items-baseline gap-2">
            <SourceTag source={o.source} />
            {o.note && <span className="text-xs text-muted-foreground">{o.note[locale]}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AlgRow({
  name,
  alg,
  note,
  image,
  mask,
  options,
  sources,
}: AlgType & { options?: Array<TAlgOption>; sources?: Array<TAlgSource> }) {
  return (
    <div className="mt-4 flex items-center gap-4">
      {image && <CubePicture image={image} size={image.kind === 'iso' ? 90 : 80} />}
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-2 text-sm font-semibold">
          {name}
          {sources?.map((source) => (
            <SourceTag key={source} source={source} />
          ))}
        </p>
        <div className="mt-1">
          <AlgText alg={alg} />
        </div>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
        <Alg3DToggle alg={alg} mask={mask ?? image?.mask} />
        {options && options.length > 0 && <AlgOptionList options={options} />}
      </div>
    </div>
  );
}

/** Card used by OLL / PLL grids: diagram, title, main algorithm and alternatives. */
export function CaseCard({
  title,
  subtitle,
  image,
  algs,
  options,
  sources,
  note,
}: {
  title: string;
  subtitle?: string;
  /** Where the main algorithms come from, when not from the CubeSkills sheets. */
  sources?: Array<TAlgSource>;
  image: CubeImage;
  algs: Array<string>;
  /** Further algorithms for the same case, shown with their source. */
  options?: Array<TAlgOption>;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
      <div className="flex w-full items-baseline justify-between gap-2">
        <p className="font-bold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <CubePicture image={image} size={96} />
      {sources && (
        <p className="flex flex-wrap justify-center gap-2">
          {sources.map((source) => (
            <SourceTag key={source} source={source} />
          ))}
        </p>
      )}
      <div className="flex w-full flex-col items-center gap-1">
        {algs.map((a, i) => (
          <AlgText key={a} alg={a} main={i === 0} />
        ))}
        {options && options.length > 0 && <AlgOptionList options={options} />}
      </div>
      {note && <p className="text-center text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
