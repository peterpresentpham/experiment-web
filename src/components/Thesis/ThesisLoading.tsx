'use client';

import { useMessages } from 'src/i18n/client';
import { blogMessages } from 'src/i18n/messages/blog';

// `next/dynamic` loading callbacks cannot be async, so the localized text comes from a Client Component.
export default function ThesisLoading() {
  const { thesis } = useMessages(blogMessages);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">{thesis.loading}</p>
    </div>
  );
}
