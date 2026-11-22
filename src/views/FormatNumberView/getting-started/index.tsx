'use client';

import Image from 'next/image';
import { useState } from 'react';
import CopyClipboard from 'src/components/CopyClipboard';
import { Separator } from 'src/components/shadcn/separator';
import { ToggleGroup, ToggleGroupItem } from 'src/components/shadcn/toggle-group';
import { IMAGES } from 'src/configs/images';
import { useMessages } from 'src/i18n/client';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';

type CliType = 'npm' | 'yarn' | 'pnpm' | 'bun';

const configs: { [id in CliType]: { id: CliType; img: string; title: string; cli: string } } = {
  npm: {
    id: 'npm',
    img: IMAGES.cli.npm,
    title: 'npm',
    cli: 'npm install @peter-present/format-number',
  },
  yarn: {
    id: 'yarn',
    img: IMAGES.cli.yarn,
    title: 'Yarn',
    cli: 'yarn add @peter-present/format-number',
  },
  pnpm: {
    id: 'pnpm',
    img: IMAGES.cli.pnpm,
    title: 'pnpm',
    cli: 'pnpm add @peter-present/format-number',
  },
  bun: {
    id: 'bun',
    img: IMAGES.cli.bun,
    title: 'Bun',
    cli: 'bun add @peter-present/format-number',
  },
};

export default function GettingStartedPage() {
  const t = useMessages(formatNumberMessages);
  const [cli, setCli] = useState<CliType>('npm');

  return (
    <div>
      <p className="text-2xl font-bold">{t.gettingStarted.title}</p>
      <p className="mt-2">{t.gettingStarted.intro}</p>
      <p>{t.gettingStarted.arithmetic}</p>
      <p className="mt-5 text-lg font-bold">{t.gettingStarted.installation}</p>
      <Separator />
      <div className="rounded-2xl bg-secondary">
        <ToggleGroup className="mt-2" type="single">
          {Object.values(configs).map((config) => {
            return (
              <ToggleGroupItem
                key={config.id}
                value={config.id}
                onClick={() => setCli(config.id)}
                className="relative"
              >
                <Image src={config.img} alt={config.title} width={12} height={12} />
                <p>{config.title}</p>
                {cli == config.id && (
                  <div className="absolute right-1.5 bottom-0 left-1.5 h-0.5 bg-destructive" />
                )}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <div className="mx-3 flex items-center justify-between border-t border-border">
          <p className="text-xl">{configs[cli].cli}</p>
          <CopyClipboard copyText={configs[cli].cli} iconprops={{ className: 'size-3.5' }} />
        </div>
      </div>
    </div>
  );
}
