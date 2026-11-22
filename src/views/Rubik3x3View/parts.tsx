import { ReactNode } from 'react';
import { ContainerClipboard } from 'src/components/CopyClipboard';
import CubeIso from 'src/components/rubik/CubeIso';
import CubeTop from 'src/components/rubik/CubeTop';
import { AlgType, CubeImage } from 'src/configs/rubikGuide.config';
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

export function AlgRow({ name, alg, note, image, mask }: AlgType) {
  return (
    <div className="mt-4 flex items-center gap-4">
      {image && <CubePicture image={image} size={image.kind === 'iso' ? 90 : 80} />}
      <div className="min-w-0">
        <p className="text-sm font-semibold">{name}</p>
        <div className="mt-1">
          <AlgText alg={alg} />
        </div>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
        <Alg3DToggle alg={alg} mask={mask ?? image?.mask} />
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
  note,
}: {
  title: string;
  subtitle?: string;
  image: CubeImage;
  algs: Array<string>;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
      <div className="flex w-full items-baseline justify-between gap-2">
        <p className="font-bold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <CubePicture image={image} size={96} />
      <div className="flex w-full flex-col items-center gap-1">
        {algs.map((a, i) => (
          <AlgText key={a} alg={a} main={i === 0} />
        ))}
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
