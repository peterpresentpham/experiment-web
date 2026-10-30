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

export default function SectionBox({ id, title, children, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`section_${id}`}
      className={cn(THESIS_CLASS.section, 'mt-5', props.className)}
    >
      <p id={`section_${id}_title`} className="text-[20px] font-medium">
        <IndexLabel id={`section_${id}`} mode="section" suffix=" " />
        {title}
      </p>
      {children}
    </div>
  );
}

export function SubsectionBox({ id, title, children, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`subsection_${id}`}
      className={cn(THESIS_CLASS.subsection, 'mt-4', props.className)}
    >
      <p id={`subsection_${id}_title`} className="text-[20px] font-medium">
        <IndexLabel id={`subsection_${id}`} mode="subsection" suffix=" " />
        {title}
      </p>
      {children}
    </div>
  );
}
