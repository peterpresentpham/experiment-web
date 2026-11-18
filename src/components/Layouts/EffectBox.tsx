'use client';

import { MotionConfig } from 'motion/react';
import { ReactNode, useEffect } from 'react';
import { useTheme } from 'src/hooks/useTheme';
import { applyTheme } from 'src/lib/theme';

interface TProps {
  children: ReactNode;
}

export default function EffectBox({ children }: TProps) {
  const { resolvedTheme } = useTheme();

  // Keeps the `dark` class in sync when the OS scheme or another tab changes the theme.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
