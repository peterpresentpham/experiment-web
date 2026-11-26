'use client';

import { Search } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { Input } from 'src/components/shadcn/input';
import { cn } from 'src/lib/utils';
import { filterCases, TCaseKind, TCaseSet, TSearchableCase } from 'src/services/rubik/search.utils';

export type TBrowserItem = TSearchableCase & { node: ReactNode };

export type TBrowserLabels = {
  placeholder: string;
  hint: string;
  kinds: Record<'all' | TCaseKind, string>;
  sets: Record<TCaseSet, string>;
  /** Contains `{count}`, replaced by the number of cases found. */
  results: string;
  empty: string;
  clear: string;
};

type TProps = {
  items: Array<TBrowserItem>;
  labels: TBrowserLabels;
  initialQuery: string;
  initialKind?: TCaseKind;
};

const KINDS: Array<TCaseKind> = ['oll', 'pll', 'f2l'];

/** Search box, filters and the matching case cards. The cards come ready-made from the server. */
export default function AlgorithmBrowser({ items, labels, initialQuery, initialKind }: TProps) {
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<'all' | TCaseKind>(initialKind ?? 'all');
  const [set, setSet] = useState<TCaseSet>('full');

  // Mirrored to the URL so a search or filter can be linked.
  function remember(nextQuery: string, nextKind: 'all' | TCaseKind) {
    const url = new URL(window.location.href);
    if (nextQuery) url.searchParams.set('q', nextQuery);
    else url.searchParams.delete('q');
    if (nextKind !== 'all') url.searchParams.set('type', nextKind);
    else url.searchParams.delete('type');
    window.history.replaceState(null, '', url);
  }

  function changeQuery(next: string) {
    setQuery(next);
    remember(next, kind);
  }

  function changeKind(next: 'all' | TCaseKind) {
    setKind(next);
    remember(query, next);
  }

  const found = filterCases(items, { query, kinds: kind === 'all' ? [] : [kind], set });
  const countOf = (value: TCaseKind) => items.filter((item) => item.kind === value).length;

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          className="pl-9"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{labels.hint}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(['all', ...KINDS] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={kind === value ? 'default' : 'outline'}
            aria-pressed={kind === value}
            onClick={() => changeKind(value)}
          >
            {labels.kinds[value]}
            <span className="opacity-70">{value === 'all' ? items.length : countOf(value)}</span>
          </Button>
        ))}
        <span className="mx-1 hidden h-5 border-l sm:block" />
        {(['full', 'core'] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={set === value ? 'secondary' : 'ghost'}
            aria-pressed={set === value}
            onClick={() => setSet(value)}
          >
            {labels.sets[value]}
          </Button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {labels.results.replace('{count}', String(found.length))}
      </p>

      {found.length === 0 ? (
        <div className="mt-4 rounded-md border p-4 text-sm">
          <p>{labels.empty}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setQuery('');
              setKind('all');
              setSet('full');
              remember('', 'all');
            }}
          >
            {labels.clear}
          </Button>
        </div>
      ) : (
        <div
          className={cn('mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}
        >
          {found.map((item) => (
            <div key={item.key}>{item.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}
