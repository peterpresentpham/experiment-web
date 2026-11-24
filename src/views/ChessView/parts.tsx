import { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

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
      <div className="mt-1 leading-relaxed">{children}</div>
    </div>
  );
}
