'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { NAV_ITEMS } from 'src/configs/navigation';
import { cn } from 'src/lib/utils';
import IconButton from '../buttons/IconButton';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../shadcn/sheet';

type TProps = {
  actions?: ReactNode;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppHeader({ actions }: TProps) {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 fixed top-0 z-50 h-(--header-height) w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="Experiment Web home"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="bg-primary size-2.5 rounded-full" aria-hidden />
            Experiment Web
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <Sheet>
            <SheetTrigger asChild>
              <IconButton aria-label="Open menu" className="md:hidden">
                <Menu size={20} />
              </IconButton>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigate between experiments</SheetDescription>
              <nav aria-label="Mobile" className="flex flex-col gap-1">
                {[{ title: 'Home', href: '/', icon: null }, ...NAV_ITEMS].map((item) => {
                  const active =
                    item.href === '/' ? pathname === '/' : isActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        {Icon ? <Icon size={18} /> : <span className="size-[18px]" />}
                        {item.title}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
