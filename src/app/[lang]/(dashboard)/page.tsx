import { ArrowUpRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GithubIcon } from 'src/components/icons';
import { Badge } from 'src/components/shadcn/badge';
import { PORTFOLIO_URL, REPO_URL, VISIBLE_NAV_ITEMS } from 'src/configs/navigation';
import { commonMessages } from 'src/i18n/messages/common';
import { getMessages } from 'src/i18n/server';

export default async function Home() {
  const { home, nav } = await getMessages(commonMessages);

  return (
    <div className="container flex flex-col gap-10 md:gap-14">
      <section className="flex max-w-2xl flex-col gap-4 pt-6 md:pt-12">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Experiment <span className="text-primary">Web</span>
        </h1>
        <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{home.intro}</p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm font-medium">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <GithubIcon className="size-4" /> {home.source}
          </a>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            {home.portfolio} <ExternalLink className="size-3.5" />
          </a>
        </div>
      </section>

      <section aria-labelledby="experiments-heading" className="flex flex-col gap-4">
        <h2 id="experiments-heading" className="text-xl font-semibold tracking-tight">
          {home.experiments}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VISIBLE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const text = nav[item.id];

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs transition-all outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-lg bg-accent p-2.5 text-accent-foreground">
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="secondary">{text.tag}</Badge>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="flex items-center gap-1 text-base font-semibold">
                      {text.title}
                      <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {text.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
