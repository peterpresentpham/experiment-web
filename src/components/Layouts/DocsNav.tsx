'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'src/lib/utils';

type TProps = {
  title: string;
  items: Array<{ title: string; href: string }>;
};

// Side menu on desktop, scrollable chip row on mobile.
export default function DocsNav({ title, items }: TProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={title} className="lg:sticky lg:top-20 lg:h-fit lg:w-52 lg:shrink-0">
      <p className="text-muted-foreground mb-2 hidden text-xs font-semibold tracking-wide uppercase lg:block">
        {title}
      </p>
      <ul className="scroll-hidden flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
