'use client';

import { round, RoundingMode } from '@peter-present/format-number';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import RoundTypeSelect from 'src/components/format-number/RoundTypeSelect';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';
import { useMessages } from 'src/i18n/client';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';

export default function RoundPage() {
  const t = useMessages(formatNumberMessages);
  const [value, setValue] = useState('0');
  const [debounceValue] = useDebounceValue(value, 500);
  const [rounding, setRounding] = useState<RoundingMode>('half');
  const [precision, setPrecision] = useState(0);

  const result = useMemo(() => {
    return round(debounceValue, { rounding, precision });
  }, [debounceValue, rounding, precision]);

  const fnText = useMemo(() => {
    const result = `round(${debounceValue}`;
    const params: Array<string> = [];
    if (rounding != 'half') params.push(`rounding: ${rounding}`);
    if (precision > 0) params.push(`precision: ${precision}`);
    return params.length > 0 ? `${result}, { ${params.join(', ')} });` : `${result});`;
  }, [debounceValue, rounding, precision]);

  return (
    <ElementItem
      id="round"
      title={
        <>
          <span className="text-keyword">function</span> <span className="text-name">round</span>(
          <span className="text-params">value</span>:{' '}
          <Link href="/blog/format-number/types#NumberType">
            <span className="font-semibold hover:underline">NumberType</span>
          </Link>
          , <span className="text-params">options</span>:{' '}
          <Link href="/blog/format-number/types#RoundingConfigType">
            <span className="font-semibold hover:underline">RoundingConfigType</span> = {'{}'}
          </Link>
          ): string
        </>
      }
      description={t.fn.round.description}
    >
      <p className="my-4 text-lg font-bold">{t.params}</p>
      <ArticleUL className="list-disc">
        <ArticleLI isFirst>
          <span>
            <span className="text-params">value</span> (
            <Link href="/blog/format-number/types#NumberType">
              <span className="font-semibold hover:underline">NumberType</span>
            </Link>
            )
          </span>
          {`: ${t.fn.round.params.value}`}
        </ArticleLI>
        <ArticleLI>
          <span>
            <span className="text-params">options</span> (
            <Link href="/blog/format-number/types#RoundingConfigType">
              <span className="font-semibold hover:underline">RoundingConfigType</span>
            </Link>
            )
          </span>
          {`: ${t.fn.round.params.options}`}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">{t.returns}</p>
      <p>{t.fn.round.returns}</p>
      <p className="my-4 text-lg font-bold">{t.example}</p>
      <TitleBox
        title="value"
        value={
          <Input
            placeholder={t.numberPlaceholder}
            onChange={(event) => setValue(event.target.value)}
            type="number"
            value={value}
          />
        }
      />
      <TitleBox title="mode" value={<RoundTypeSelect mode={rounding} setMode={setRounding} />} />
      <TitleBox
        className="mt-2"
        title="precision"
        value={
          <Input
            className="w-fit"
            placeholder="precision"
            onChange={(event) => setPrecision(parseInt(event.target.value || '0'))}
            type="number"
            value={precision}
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
