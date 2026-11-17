'use client';

import { ReactNode, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/shadcn/tabs';

export type RubikPanel = { value: string; label: string; hint: string; content: ReactNode };

/** Level tabs. The active tab is mirrored to `?level=` so links can point at a level. */
export default function RubikTabs({
  panels,
  defaultLevel,
}: {
  panels: Array<RubikPanel>;
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
      <TabsList className="bg-background sticky top-0 z-10 h-auto w-full flex-wrap justify-start gap-1 border sm:w-fit">
        {panels.map((p) => (
          <TabsTrigger
            key={p.value}
            value={p.value}
            className="data-[state=active]:bg-muted flex-col items-start px-4 py-2"
          >
            <span className="text-base">{p.label}</span>
            <span className="text-muted-foreground text-xs font-normal">{p.hint}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((p) => (
        <TabsContent
          key={p.value}
          value={p.value}
          forceMount
          className="data-[state=inactive]:hidden"
        >
          {p.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
