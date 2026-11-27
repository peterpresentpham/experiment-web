'use client';

import { ReactNode, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/shadcn/tabs';

export type TCaroGuidePanel = { value: string; label: string; hint: string; content: ReactNode };

/** Level tabs. The active tab is mirrored to `?level=` so links can point at a level. */
export default function CaroGuideTabs({
  panels,
  defaultLevel,
}: {
  panels: Array<TCaroGuidePanel>;
  defaultLevel?: string;
}) {
  const initial = panels.some((p) => p.value === defaultLevel) ? defaultLevel! : panels[0].value;
  const [value, setValue] = useState(initial);

  function onChange(next: string) {
    setValue(next);
    const url = new URL(window.location.href);
    url.searchParams.set('level', next);
    window.history.replaceState(null, '', url);
  }

  return (
    <Tabs value={value} onValueChange={onChange} className="mt-6">
      <TabsList className="sticky top-0 z-10 h-auto w-full flex-wrap justify-start gap-1 border bg-background sm:w-fit">
        {panels.map((p) => (
          <TabsTrigger
            key={p.value}
            value={p.value}
            className="flex-col items-start px-3 py-1.5 data-[state=active]:bg-muted sm:px-4 sm:py-2"
          >
            <span className="text-sm sm:text-base">{p.label}</span>
            {/* The tab bar stays on screen while reading: on phones it keeps to the labels. */}
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
              {p.hint}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((p) => (
        <TabsContent key={p.value} value={p.value}>
          {p.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
