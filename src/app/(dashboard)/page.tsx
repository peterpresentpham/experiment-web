import { ArrowUpRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GithubIcon } from 'src/components/icons';
import { Badge } from 'src/components/shadcn/badge';
import { NAV_ITEMS, PORTFOLIO_URL, REPO_URL } from 'src/configs/navigation';

export default function Home() {
  return (
    <div className="container flex flex-col gap-10 md:gap-14">
      <section className="flex max-w-2xl flex-col gap-4 pt-6 md:pt-12">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Experiment <span className="text-primary">Web</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          A playground of small web experiments: board games you can play with a friend, an
          operating-system scheduler you can watch, and a chat app.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm font-medium">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary inline-flex items-center gap-2 transition-colors"
          >
            <GithubIcon className="size-4" /> Source on GitHub
          </a>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
          >
            Portfolio <ExternalLink className="size-3.5" />
          </a>
        </div>
      </section>

      <section aria-labelledby="experiments-heading" className="flex flex-col gap-4">
        <h2 id="experiments-heading" className="text-xl font-semibold tracking-tight">
          Experiments
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group bg-card hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-4 rounded-xl border p-5 shadow-xs transition-all outline-none hover:shadow-md focus-visible:ring-[3px]"
                >
                  <div className="flex items-start justify-between">
                    <span className="bg-accent text-accent-foreground rounded-lg p-2.5">
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="secondary">{item.tag}</Badge>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="flex items-center gap-1 text-base font-semibold">
                      {item.title}
                      <ArrowUpRight className="text-muted-foreground group-hover:text-primary size-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
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
