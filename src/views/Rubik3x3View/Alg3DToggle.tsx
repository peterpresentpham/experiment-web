'use client';

import { Box } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { blogMessages } from 'src/i18n/messages/blog';
import type { MaskName } from 'src/lib/cube/render';

// cubing.js touches `window` and custom elements, so the player never renders on the server.
const Cube3DPlayer = dynamic(() => import('src/components/rubik/Cube3DPlayer'), { ssr: false });

type TProps = { alg: string; mask?: MaskName };

/** "Watch in 3D" button under an algorithm; opens a 3D cube that plays it. */
export default function Alg3DToggle({ alg, mask }: TProps) {
  const { player } = useMessages(blogMessages).rubik;
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
        <Box className="size-4" />
        {open ? player.hide : player.show}
      </Button>
      {open && <Cube3DPlayer alg={alg} mask={mask} className="mt-2" labels={player} />}
    </div>
  );
}
