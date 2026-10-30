import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TDivProps } from 'src/types/global';
import { cn } from 'src/lib/utils';
import { AppArticle } from '../box/ArticleBox';
import IndexLabel from './IndexLabel';

interface TProps extends TDivProps {
  id: string;
  title: string;
  algorithm: string;
}

export default function AlgorithmBox({ id, title, algorithm, ...props }: TProps) {
  return (
    <div
      {...props}
      id={`algorithm_${id}`}
      className={cn(THESIS_CLASS.algorithm, 'mt-4 flex flex-col items-center', props.className)}
    >
      <AppArticle isMath>{`\\(${algorithm}\\)`}</AppArticle>
      <p id={`algorithm_${id}_title`} className="text-[14px]">
        <IndexLabel id={`algorithm_${id}`} mode="algorithm" prefix="Algorithm " suffix=". " />
        {title}
      </p>
    </div>
  );
}
