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

export default function AppendixBox({ id, title, children, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`appendix_${id}`}
      className={cn(THESIS_CLASS.appendix, 'mt-4', props.className)}
    >
      <p id={`appendix_${id}_title`} className="text-center text-[20px] font-semibold uppercase">
        <IndexLabel id={`appendix_${id}`} mode="appendix" suffix=". " />
        {title}
      </p>
      {children}
    </div>
  );
}
