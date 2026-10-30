'use client';

import { MathJaxContext } from 'better-react-mathjax';
import { ReactNode } from 'react';
import { mathJaxConfig } from 'src/configs/thesis.constance';

interface TProps {
  children: ReactNode;
}

export default function MathJaxProvider({ children }: TProps) {
  return (
    <MathJaxContext
      version={2}
      config={mathJaxConfig}
      onStartup={(mathJax) => (mathJax.Hub.processSectionDelay = 0)}
    >
      {children}
    </MathJaxContext>
  );
}
