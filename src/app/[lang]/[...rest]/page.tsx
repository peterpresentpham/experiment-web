import { notFound } from 'next/navigation';

// Unknown paths still get the localized 404 from `[lang]/not-found.tsx`, which a top-level
// `app/not-found.tsx` could not provide because the root layout lives under `[lang]`.
export default function CatchAll() {
  notFound();
}
