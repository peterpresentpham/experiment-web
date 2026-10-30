import { ReactNode } from 'react';
import AppHeader from './AppHeader';

type TProps = {
  actions?: ReactNode;
  children: ReactNode;
};

export default function AppShell({ actions, children }: TProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader actions={actions} />
      <main className="flex flex-1 flex-col pt-(--header-height)">{children}</main>
    </div>
  );
}
