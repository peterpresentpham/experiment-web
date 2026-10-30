'use client';

import Image from 'next/image';
import { useState } from 'react';
import CopyClipboard from 'src/components/CopyClipboard';
import { Separator } from 'src/components/shadcn/separator';
import { ToggleGroup, ToggleGroupItem } from 'src/components/shadcn/toggle-group';
import { IMAGES } from 'src/configs/images';

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
    cli: 'pnpm create @peter-present/format-number',
  },
  bun: {
    id: 'bun',
    img: IMAGES.cli.bun,
    title: 'Bun',
    cli: 'bun add @peter-present/format-number',
  },
};

export default function GettingStartedPage() {
  const [cli, setCli] = useState<CliType>('npm');

  return (
    <div>
      <p className="text-2xl font-bold">Getting Started</p>
      <p className="mt-2">
        {
          'A lightweight, zero-dependency JavaScript/TypeScript library for precise number formatting. Designed for financial applications, crypto dashboards, and scientific data where precision is paramount.'
        }
      </p>
      <p>
        Unlike standard libraries that rely on floating-point math, the library uses internal
        string-based arithmetic to handle numbers of any size (including{' '}
        <span className="font-semibold">string</span>, <span className="font-semibold">number</span>
        , and <span className="font-semibold">bigint</span>) without losing a single decimal point.
      </p>
      <p className="mt-5 text-lg font-bold">Installation</p>
      <Separator />
      <div className="bg-secondary rounded-2xl">
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
                  <div className="bg-destructive absolute right-1.5 bottom-0 left-1.5 h-0.5" />
                )}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <div className="border-border mx-3 flex items-center justify-between border-t">
          <p className="text-xl">{configs[cli].cli}</p>
          <CopyClipboard copyText={configs[cli].cli} iconprops={{ className: 'size-3.5' }} />
        </div>
      </div>
    </div>
  );
}
