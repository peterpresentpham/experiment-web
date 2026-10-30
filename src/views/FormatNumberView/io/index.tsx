'use client';

import ParseNumPage from './ParseNumPage';
import ZeroPage from './ZeroPage';

export default function IOPage() {
  return (
    <div>
      <ParseNumPage />
      <ZeroPage mode="trailing" />
      <ZeroPage mode="leading" />
      <ZeroPage mode="unnecessary" />
    </div>
  );
}
