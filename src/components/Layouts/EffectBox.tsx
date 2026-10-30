'use client';

import { MotionConfig } from 'motion/react';
import { ReactNode } from 'react';

interface TProps {
  children: ReactNode;
}

export default function EffectBox({ children }: TProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
