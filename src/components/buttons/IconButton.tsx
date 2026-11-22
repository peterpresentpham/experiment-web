import { ComponentProps } from 'react';
import { cn } from 'src/lib/utils';

type TProps = Omit<ComponentProps<'button'>, 'aria-label'> & {
  'aria-label': string;
};

export default function IconButton({ className, type = 'button', ...props }: TProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        'inline-flex aspect-square cursor-pointer items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    />
  );
}
