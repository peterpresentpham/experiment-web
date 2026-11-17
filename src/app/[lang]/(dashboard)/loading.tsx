import ClockLoader from 'src/components/ClockLoader';
import { commonMessages } from 'src/i18n/messages/common';
import { getMessages } from 'src/i18n/server';

export default async function Loading() {
  const { loading } = await getMessages(commonMessages);

  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label={loading}>
      <ClockLoader size={28} />
    </div>
  );
}
