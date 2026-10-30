import ClockLoader from 'src/components/ClockLoader';

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading">
      <ClockLoader size={28} />
    </div>
  );
}
