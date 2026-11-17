'use client';

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { cn } from 'src/lib/utils';
import { Button, buttonVariants } from './button';

function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  const { ui } = useMessages(commonMessages);
  return (
    <nav
      role="navigation"
      aria-label={ui.pagination}
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ComponentProps<typeof Button>, 'size'> &
  ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }), className)}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  const { ui } = useMessages(commonMessages);
  return (
    <PaginationLink
      aria-label={ui.previousPage}
      size="default"
      className={cn('cursor-pointer gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{ui.previous}</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  const { ui } = useMessages(commonMessages);
  return (
    <PaginationLink
      aria-label={ui.nextPage}
      size="default"
      className={cn('cursor-pointer gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">{ui.next}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  const { ui } = useMessages(commonMessages);
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{ui.morePages}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
