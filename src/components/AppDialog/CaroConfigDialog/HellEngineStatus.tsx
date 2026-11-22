'use client';

import { LoaderCircle } from 'lucide-react';
import { Badge } from 'src/components/shadcn/badge';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { TCaroEngineLoad, TCaroHellEngines } from 'src/types/caro.type';

const VARIANTS = { loading: 'info', ready: 'success', failed: 'warning' } as const;
const NAMES: Record<keyof TCaroHellEngines, string> = { rapfi: 'Rapfi', tengen: 'Tengen' };

// Live loading state of the hell level's engines, updated by the machine worker as each one
// finishes; hidden until the level has started loading them.
export default function HellEngineStatus() {
  const engines = useCaroExperienceStore((state) => state.hellEngines);
  const { config: text } = useMessages(caroMessages);
  if (!engines) return null;

  const status = (load: TCaroEngineLoad) => text.engines[load];
  return (
    <div className="flex w-full flex-wrap items-center gap-2 text-sm" aria-live="polite">
      <span className="text-muted-foreground">{text.engines.label}:</span>
      {(Object.keys(NAMES) as Array<keyof TCaroHellEngines>).map((name) => (
        <Badge key={name} variant={VARIANTS[engines[name]]} className="gap-1">
          {engines[name] == 'loading' && <LoaderCircle size={12} className="animate-spin" />}
          {NAMES[name]} · {status(engines[name])}
        </Badge>
      ))}
      {engines.rapfi == 'loading' && engines.tengen == 'ready' && (
        <span className="w-full text-muted-foreground">{text.engines.tengenMeanwhile}</span>
      )}
    </div>
  );
}
