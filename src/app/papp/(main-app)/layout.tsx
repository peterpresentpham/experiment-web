import { ReactNode } from 'react';
import PAppLayout from 'src/components/Layouts/PAppLayout';
import ChatProvider from 'src/context/papp/chat.context';

type TProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: TProps) {
  return (
    <PAppLayout>
      <ChatProvider>{children}</ChatProvider>
    </PAppLayout>
  );
}
