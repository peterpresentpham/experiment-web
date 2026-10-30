import { ReactNode } from 'react';
import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TDivProps } from 'src/types/global';
import { cn } from 'src/lib/utils';
import IndexLabel from './IndexLabel';

interface TProps extends TDivProps {
  id: string;
  title: string;
  prefix?: string;
  children: ReactNode;
}

export default function ChapterBox({ id, title, prefix = 'Chapter', children, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`chapter_${id}`}
      className={cn(THESIS_CLASS.chapter, 'mt-4', props.className)}
    >
      <p id={`chapter_${id}_title`} className="text-center text-[20px] font-semibold uppercase">
        <IndexLabel id={`chapter_${id}`} mode="chapter" prefix={`${prefix} `} suffix=". " />
        {title}
      </p>
      {children}
    </div>
  );
}
