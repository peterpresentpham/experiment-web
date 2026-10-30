import { scientific } from '@peter-present/format-number';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';

export default function Scientific() {
  const [value, setValue] = useState('0');
  const [debounceValue] = useDebounceValue(value, 500);

  const result = useMemo(() => {
    return scientific(debounceValue);
  }, [debounceValue]);

  const fnText = useMemo(() => {
    return `scientific(${debounceValue})`;
  }, [debounceValue]);

  return (
    <ElementItem
      id="scientific"
      title={
        <>
          <span className="text-keyword">function</span>{' '}
          <span className="text-name">scientific</span>(<span className="text-params">value</span>:
          string): string
        </>
      }
      description="Formats a number string using standard scientific notation (e.g., 1.23e+5)."
    >
      <p className="my-4 text-lg font-bold">Params</p>
      <ArticleUL className="list-disc">
        <ArticleLI isFirst>
          <span>
            <span className="text-params">value</span> (string)
          </span>
          {': The number string to format.'}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">Returns</p>
      <p>(string): The formatted number string in the specified notation.</p>
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
