import { scientific } from '@peter-present/format-number';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';
import { useMessages } from 'src/i18n/client';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';

export default function Scientific() {
  const t = useMessages(formatNumberMessages);
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
      description={t.fn.scientific.description}
    >
      <p className="my-4 text-lg font-bold">{t.params}</p>
      <ArticleUL className="list-disc">
        <ArticleLI isFirst>
          <span>
            <span className="text-params">value</span> (string)
          </span>
          {`: ${t.fn.scientific.params.value}`}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">{t.returns}</p>
      <p>{t.fn.scientific.returns}</p>
      <p className="my-4 text-lg font-bold">{t.example}</p>
      <TitleBox
        title="value"
        value={
          <Input
            placeholder={t.numberPlaceholder}
            onChange={(event) => setValue(event.target.value)}
            value={value}
            type="number"
          />
        }
      />
      <div className="relative mt-2 min-h-20 rounded-sm bg-muted p-2">
        <CopyClipboard
          copyText={fnText}
          className="absolute top-2 right-2"
          iconprops={{ className: 'size-4' }}
        />
        <p>{fnText}</p>
        <p>{t.result(result)}</p>
      </div>
    </ElementItem>
  );
}
