import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { generateAppMetadata } from 'src/services';

export const metadata: Metadata = generateAppMetadata(
  'Account Abstraction Wallet with Social Recovery based on Zero-Knowledge Proof',
  'Master thesis on an account abstraction wallet with social recovery using zero-knowledge proofs.'
);

const MasterThesisView = dynamic(() => import('src/views/MasterThesisView'), {
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Loading thesis...</p>
    </div>
  ),
});

export default function MasterThesis() {
  return (
    <div className="container py-4">
      <CssBreadcrumbs
        className="mb-4"
        configs={[
          { label: 'Home', link: '/' },
          { label: 'Blog', link: '/blog' },
          { label: 'Master Thesis' },
        ]}
      />
      <MasterThesisView />
    </div>
  );
}
