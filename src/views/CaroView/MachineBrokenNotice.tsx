'use client';

import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { useCaroStore } from 'src/states/caro.state';

// Shown when the machine still could not move after its worker was restarted and the page
// reloaded once (src/services/caro-machine/recovery.ts): a further automatic reload could loop.
export default function MachineBrokenNotice() {
  const isBroken = useCaroExperienceStore((state) => state.isMachineBroken);
  const isMachineMode = useCaroStore((state) => state.metadata.playMode == 'machine');
  const { status } = useMessages(caroMessages);
  if (!isBroken || !isMachineMode) return null;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
    >
      <span className="flex-1">{status.machineBroken}</span>
      <Button size="sm" variant="outline" onClick={() => location.reload()}>
        {status.reload}
      </Button>
    </div>
  );
}
