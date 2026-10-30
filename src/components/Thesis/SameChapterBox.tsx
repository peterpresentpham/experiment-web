import { ReactNode } from 'react';
import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TDivProps } from 'src/types/global';
import { TThesisSameChapterType } from 'src/types/thesis.type';
import { cn } from 'src/lib/utils';

const configs: { [key in TThesisSameChapterType]: { class: string; title: string } } = {
  acknowledgement: { class: THESIS_CLASS.acknowledgement, title: 'Acknowledgement' },
  abstract: { class: THESIS_CLASS.abstract, title: 'Abstract' },
  reference: { class: THESIS_CLASS.reference, title: 'References' },
  appendix: { class: THESIS_CLASS.sameChapterAppendix, title: 'Appendix' },
};

interface TProps extends TDivProps {
  id: string;
  mode: TThesisSameChapterType;
  children: ReactNode;
}

export default function SameChapterBox({ id, mode, children, ...props }: TProps) {
  const config = configs[mode];

  return (
    <div {...props} id={id} className={cn(config.class, 'mt-4', props.className)}>
      <p id={`${id}_title`} className="text-center text-[20px] font-semibold">
        {config.title}
      </p>
      {children}
    </div>
  );
}
