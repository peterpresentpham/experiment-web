import { ReactNode } from 'react';
import GlobalConfigDialog from 'src/components/AppDialog/GlobalConfigDialog';
import AppShell from 'src/components/Layouts/AppShell';

type TProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: TProps) {
  return <AppShell actions={<GlobalConfigDialog />}>{children}</AppShell>;
}
