'use client';

import { Check, Copy } from 'lucide-react';
import { ComponentProps, MouseEvent, useState } from 'react';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { cn } from 'src/lib/utils';
import { TIconProps } from 'src/types/global';

interface TProps extends ComponentProps<'button'> {
  copyText: string;
  iconprops?: TIconProps;
}

export default function CopyClipboard({ copyText, iconprops, ...props }: TProps) {
  const [copied, setCopied] = useState(false);
  const { actions } = useMessages(commonMessages);

  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <button aria-label={copied ? actions.copied : actions.copy} {...props} onClick={handleCopy}>
      {copied ? (
        <Check {...iconprops} className={cn('size-4 cursor-pointer', iconprops?.className)} />
      ) : (
        <Copy {...iconprops} className={cn('cursor-pointer', iconprops?.className)} />
      )}
    </button>
  );
}

interface TContainerProps extends ComponentProps<'div'> {
  copyText: string;
}

// Click anywhere on the container to copy; a short "Copied!" overlay confirms it.
export function ContainerClipboard({ copyText, ...props }: TContainerProps) {
  const [copied, setCopied] = useState(false);
  const { actions } = useMessages(commonMessages);

  async function handleCopy(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div
      {...props}
      onClick={handleCopy}
      data-copied-label={`${actions.copied}!`}
      className={cn(copied && 'card-copy-fog', 'cursor-pointer', props.className)}
    >
      {props.children}
    </div>
  );
}
