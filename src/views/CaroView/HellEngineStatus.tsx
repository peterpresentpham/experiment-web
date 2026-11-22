'use client';

import { Cpu, LoaderCircle } from 'lucide-react';
import { Badge } from 'src/components/shadcn/badge';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { useCaroStore } from 'src/states/caro.state';
import { TCaroHellEngines } from 'src/types/caro.type';

type TEngineState = 'loading' | 'loadingRapfi' | 'rapfi' | 'tengen' | 'none';

/** Which engine the hell level plays with right now: Tengen stands in while Rapfi loads. */
export function hellEngineState({ rapfi, tengen }: TCaroHellEngines): TEngineState {
  if (rapfi == 'ready') return 'rapfi';
  if (rapfi == 'loading') return tengen == 'ready' ? 'loadingRapfi' : 'loading';
  if (tengen == 'ready') return 'tengen';
  return tengen == 'loading' ? 'loading' : 'none';
}

const VARIANTS = {
  loading: 'info',
  loadingRapfi: 'info',
  rapfi: 'success',
  tengen: 'warning',
  none: 'warning',
} as const;

// The hell level's engine, live: the machine worker reports each engine as it finishes loading.
// Shown only in a game against the hell level, once it has started loading its engines.
export default function HellEngineStatus() {
  const engines = useCaroExperienceStore((state) => state.hellEngines);
  const isHell = useCaroStore(
    ({ metadata }) =>
      metadata.playMode == 'machine' && metadata.machineLevel == 'hell' && metadata.size != 3
  );
  const { config: text } = useMessages(caroMessages);
  if (!engines || !isHell) return null;

  const state = hellEngineState(engines);
  const isLoading = state == 'loading' || state == 'loadingRapfi';
  return (
    <Badge
      variant={VARIANTS[state]}
      title={text.engines.detail[state]}
      aria-label={text.engines.detail[state]}
      aria-live="polite"
      className="h-7 shrink-0 gap-1.5"
    >
      {isLoading ? (
        <LoaderCircle size={14} aria-hidden className="animate-spin" />
      ) : (
        <Cpu size={14} aria-hidden />
      )}
      {text.engines[state]}
    </Badge>
  );
}
