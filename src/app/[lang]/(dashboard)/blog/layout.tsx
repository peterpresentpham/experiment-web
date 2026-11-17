import { ReactNode } from 'react';
import MathJaxProvider from 'src/components/MathJaxProvider';

type TProps = {
  children: ReactNode;
};

export default function BlogLayout({ children }: TProps) {
  return <MathJaxProvider>{children}</MathJaxProvider>;
}
