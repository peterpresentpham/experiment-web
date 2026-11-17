import { subscript } from '@peter-present/format-number';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';
import { useMessages } from 'src/i18n/client';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';

export default function Subscript() {
  const t = useMessages(formatNumberMessages);
  const [value, setValue] = useState('0');
  const [debounceValue] = useDebounceValue(value, 500);

  const result = useMemo(() => {
    return subscript(debounceValue);
  }, [debounceValue]);

  const fnText = useMemo(() => {
    return `subscript(${debounceValue})`;
  }, [debounceValue]);

  return (
    <ElementItem
      id="subscript"
      title={
        <>
          <span className="text-keyword">function</span>{' '}
          <span className="text-name">subscript</span>(<span className="text-params">value</span>:
          string): string
        </>
      }
      description={t.fn.subscript.description}
    >
      <p className="my-4 text-lg font-bold">{t.params}</p>
      <ArticleUL className="list-disc">
        <ArticleLI isFirst>
          <span>
            <span className="text-params">value</span> (string)
          </span>
          {`: ${t.fn.subscript.params.value}`}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">{t.returns}</p>
      <p>{t.fn.subscript.returns}</p>
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
      <div className="bg-muted relative mt-2 min-h-20 rounded-sm p-2">
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
