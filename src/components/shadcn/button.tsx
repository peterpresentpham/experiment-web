'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';
import { cn } from 'src/lib/utils';
import { soundtrack } from 'src/services/soundtrack';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';
import ClockLoader from '../ClockLoader';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 shrink-0 focus-visible:ring-ring focus-visible:ring-[3px] aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30',
        outline: 'border bg-card hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type TProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    sound?: TSound;
    isSound?: boolean;
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
  };

function Button(params: TProps) {
  const {
    className,
    variant,
    size,
    sound = TSound.CLICK,
    isSound = useConfigStore.getState().isSound,
    asChild = false,
    isLoading = false,
    loadingText,
    ...props
  } = params;
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      type="button"
      {...props}
      onClick={(event) => {
        if (props?.onClick) props.onClick(event);
        soundtrack.play({ type: sound, isEnabled: isSound });
      }}
    >
      {asChild || !isLoading ? (
        props.children
      ) : (
        <>
          <ClockLoader color="currentColor" />
          {loadingText}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
