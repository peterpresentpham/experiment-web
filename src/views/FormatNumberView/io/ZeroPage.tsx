/* eslint-disable quotes */
import {
  clearLeadingZero,
  clearTrailingZero,
  clearUnnecessaryZero,
} from '@peter-present/format-number';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';

type ModeType = 'leading' | 'trailing' | 'unnecessary';

interface TProps {
  mode: 'leading' | 'trailing' | 'unnecessary';
}

const configs: {
  [key in ModeType]: { fn: (value: string) => string; title: string; description: string };
} = {
  leading: {
    fn: clearLeadingZero,
    title: 'clearLeadingZero',
    description: "Removes leading zeros from a string (e.g., '005' -> '5').",
  },
  trailing: {
    fn: clearTrailingZero,
    title: 'clearTrailingZero',
    description: "Removes trailing zeros from a decimal string (e.g., '1.500' -> '1.5').",
  },
  unnecessary: {
    fn: clearUnnecessaryZero,
    title: 'clearUnnecessaryZero',
    description: 'Removes redundant leading and trailing zeros from a number string.',
  },
};

export default function ZeroPage({ mode }: TProps) {
  const [value, setValue] = useState('0');
  const [debounceValue] = useDebounceValue(value, 500);

  const result = useMemo(() => {
    return configs[mode].fn(debounceValue);
  }, [debounceValue, mode]);

  const fnText = useMemo(() => {
    return `${configs[mode].title}(${debounceValue})`;
  }, [debounceValue, mode]);

  return (
    <ElementItem
      id={`${configs[mode].title}`}
      title={
        <>
          <span className="text-keyword">function</span>{' '}
          <span className="text-name">clearLeadingZero</span>(
          <span className="text-params">value</span>: string): string
        </>
      }
      description={configs[mode].description}
    >
      <p className="my-4 text-lg font-bold">Params</p>
      <ArticleUL className="list-disc">
        <ArticleLI isFirst>
          <span>
            <span className="text-params">value</span>: string
          </span>
          {': The number string to clean.'}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">Return</p>
      <p>(string): The cleaned number string.</p>
      <p className="my-4 text-lg font-bold">Example</p>
      <TitleBox
        title="value"
        value={
          <Input
            placeholder="Number"
            onChange={(event) => setValue(event.target.value)}
            value={value}
            type="number"
          />
        }
      />
      <div className="bg-muted relative mt-2 min-h-20 rounded-sm p-2">
        <CopyClipboard
          copyText={fnText}
          className="absolute top-2 right-2"
          iconprops={{ className: 'size-4' }}
        />
        <p>{fnText}</p>
        <p>{`Result: ${result}`}</p>
      </div>
    </ElementItem>
  );
}
