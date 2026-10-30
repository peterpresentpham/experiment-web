import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_TOPICS } from 'src/configs/blog.config';
import { generateAppMetadata } from 'src/services';

export const metadata: Metadata = generateAppMetadata(
  'Blog',
  'Notes on zero-knowledge proofs, account abstraction and a number formatting library.'
);

export default function Blog() {
  return (
    <div className="container flex flex-col gap-6 py-6 md:py-10">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">
          Long-form writing and library documentation moved over from my old blog.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {BLOG_TOPICS.map((topic) => (
          <li key={topic.href}>
            <Link
              href={topic.href}
              className="bg-card hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors outline-none focus-visible:ring-[3px]"
            >
              <h2 className="text-lg font-semibold">{topic.title}</h2>
              <p className="text-muted-foreground text-sm">{topic.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
