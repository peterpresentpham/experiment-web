import Image, { ImageProps } from 'next/image';
import { ReactNode } from 'react';
import { THESIS_CLASS } from 'src/configs/thesis.constance';
import { TDivProps } from 'src/types/global';
import { cn } from 'src/lib/utils';
import IndexLabel from './IndexLabel';

interface TProps extends Omit<ImageProps, 'title'> {
  id: string;
  title: ReactNode;
  divProps?: TDivProps;
  containerProps?: TDivProps;
  mode?: 'center' | 'start';
}

export default function FigureBox({ id, title, divProps, containerProps, mode, ...props }: TProps) {
  const realMode = mode == 'start' ? 'start' : 'center';

  return (
    <div
      {...divProps}
      id={`figure_${id}`}
      className={cn(
        THESIS_CLASS.figure,
        'mt-4 flex flex-col',
        realMode == 'center' && 'items-center',
        divProps?.className
      )}
    >
      <Image
        {...props}
        width={600}
        height={800}
        sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, 40vw"
        className={cn('h-auto w-[80%] sm:w-[60%] md:w-[40%]', props.className)}
      />
      <div
        {...containerProps}
        id={`figure_${id}_title`}
        className={cn('flex gap-1 text-[14px]', containerProps?.className)}
      >
        <IndexLabel id={`figure_${id}`} mode="figure" prefix="Figure " suffix=": " />
        {title}
      </div>
    </div>
  );
}
