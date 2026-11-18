'use client';

import { CSSProperties } from 'react';
import { Toaster as Sonner, ToasterProps } from 'sonner';
import { useTheme } from 'src/hooks/useTheme';

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as CSSProperties
      }
      {...props}
    />
  );
};
export { Toaster };
