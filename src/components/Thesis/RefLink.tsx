import Link from 'next/link';
import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TThesisObjectModeType } from 'src/types/thesis.type';
import { cn } from 'src/lib/utils';
import { capitalizeFirstLetter } from 'src/services';
import IndexLabel from './IndexLabel';

interface TProps {
  toId: string;
  mode?: TThesisObjectModeType;
  className?: string;
}

export default function RefLink({ toId, mode, className }: TProps) {
  const _mode = mode ?? 'figure';
  const _id = `${_mode}_${toId}`;

  return (
    <Link href={`#${_id}`} className={cn(THESIS_CLASS.ref, className)}>
      {_mode != 'cite' ? (
        <>
          {capitalizeFirstLetter(_mode)} <IndexLabel id={_id} mode={_mode} />
        </>
      ) : (
        <>
          [<IndexLabel id={_id} mode={_mode} />]
        </>
      )}
    </Link>
  );
}
