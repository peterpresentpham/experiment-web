'use client';

import { Button } from 'src/components/shadcn/button';

type TProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: TProps) {
  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
