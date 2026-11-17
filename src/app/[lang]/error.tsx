'use client';

import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';

type TProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: TProps) {
  const { error } = useMessages(commonMessages);

  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-3xl font-semibold tracking-tight">{error.title}</h1>
      <p className="text-muted-foreground">{error.description}</p>
      <Button onClick={reset}>{error.retry}</Button>
    </div>
  );
}
