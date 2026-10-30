import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TDivProps } from 'src/types/global';
import { cn } from 'src/lib/utils';
import CodeBlock, { CodeBlockProps } from '../box/CodeBlock';
import IndexLabel from './IndexLabel';

interface TProps extends TDivProps {
  id: string;
  title: string;
  code: CodeBlockProps;
}

export default function ProgramBox({ id, title, code, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`program_${id}`}
      className={cn(THESIS_CLASS.program, 'mt-4 flex flex-col items-center', props.className)}
    >
      <CodeBlock {...code} />
      <p id={`program_${id}_title`} className="text-[14px]">
        <IndexLabel id={`program_${id}`} mode="program" prefix="Program " suffix=": " />
        {title}
      </p>
    </div>
  );
}
