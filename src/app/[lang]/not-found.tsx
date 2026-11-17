import Link from 'next/link';
import { Button } from 'src/components/shadcn/button';
import { commonMessages } from 'src/i18n/messages/common';
import { getMessages } from 'src/i18n/server';

export default async function NotFound() {
  const { notFound } = await getMessages(commonMessages);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-primary text-sm font-semibold">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{notFound.title}</h1>
      <p className="text-muted-foreground">{notFound.description}</p>
      <Button asChild>
        <Link href="/">{notFound.back}</Link>
      </Button>
    </div>
  );
}
