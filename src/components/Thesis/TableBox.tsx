import { ReactNode } from 'react';
import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TDivProps } from 'src/types/global';
import { cn } from 'src/lib/utils';
import IndexLabel from './IndexLabel';

interface TProps extends TDivProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function TableBox({ id, title, children, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`table_${id}`}
      className={cn(THESIS_CLASS.table, 'mt-4 flex flex-col items-center', props.className)}
    >
      {children}
      <p id={`table_${id}_title`} className="text-[14px]">
        <IndexLabel id={`table_${id}`} mode="table" prefix="Table " suffix=". " />
        {title}
      </p>
    </div>
  );
}
