import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_TOPICS } from 'src/configs/blog.config';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages(blogMessages);
  return generateAppMetadata(meta.title, meta.description);
}

export default async function Blog() {
  const { title, intro, topics } = await getMessages(blogMessages);

  return (
    <div className="container flex flex-col gap-6 py-6 md:py-10">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{intro}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {BLOG_TOPICS.map((topic) => (
          <li key={topic.href}>
            <Link
              href={topic.href}
              className="bg-card hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors outline-none focus-visible:ring-[3px]"
            >
              <h2 className="text-lg font-semibold">{topics[topic.id].title}</h2>
              <p className="text-muted-foreground text-sm">{topics[topic.id].description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
