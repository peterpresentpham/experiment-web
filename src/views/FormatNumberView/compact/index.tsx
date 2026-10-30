'use client';

import { compact, RoundingMode } from '@peter-present/format-number';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import RoundTypeSelect from 'src/components/format-number/RoundTypeSelect';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';

export default function CompactPage() {
  const [value, setValue] = useState('0');
  const [debounceValue] = useDebounceValue(value, 500);
  const [rounding, setRounding] = useState<RoundingMode>('half');
  const [precision, setPrecision] = useState('0');
  const result = useMemo(() => {
    return compact(debounceValue, {
      rounding,
      precision: precision ? parseInt(precision) : undefined,
    });
  }, [debounceValue, rounding, precision]);

  const fnText = useMemo(() => {
    const result = `compact(${debounceValue}`;
    const params: Array<string> = [];
    if (rounding != 'half') params.push(`rounding: ${rounding}`);
    if (precision) params.push(`precision: ${precision}`);
    return params.length > 0 ? `${result}, { ${params.join(', ')} });` : `${result});`;
  }, [debounceValue, rounding, precision]);
  return (
    <ElementItem
      id="compact"
      title={
        <span>
          <span className="text-keyword">function</span> <span className="text-name">compact</span>(
          <span className="text-params">value</span>:{' '}
          <Link href="/blog/format-number/types#NumberType">
            <span className="font-semibold hover:underline">NumberType</span>
          </Link>
          , <span className="text-params">options</span>:{' '}
          <Link href="/blog/format-number/types#RoundingConfigType">
            <span className="font-semibold hover:underline">RoundingConfigType</span>
          </Link>{' '}
          = {'{}'}): string
        </span>
      }
      description="Formats a number into a short, human-readable string with a suffix (e.g., K, M, B)."
    >
      <p className="my-4 text-lg font-bold">Params</p>
      <ArticleUL className="list-disc">
        <ArticleLI isFirst>
          <span>
            <span className="text-params">value</span> (
            <Link href="/blog/format-number/types#NumberType">
              <span className="font-semibold hover:underline">NumberType</span>
            </Link>
            )
          </span>
          {': The value to be compacted. Can be a number, string, or bigint.'}
        </ArticleLI>
        <ArticleLI>
          <span>
            <span className="text-params">options</span> (
            <Link href="/blog/format-number/types#RoundingConfigType">
              <span className="font-semibold hover:underline">RoundingConfigType</span>
            </Link>
            )
          </span>
          {': Configuration for rounding the compacted value.'}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">Returns</p>
      <p>(string): The compacted number with a suffix as a string.</p>
      <p className="my-4 text-lg font-bold">Example</p>
      <TitleBox
        title="value"
        value={
          <Input
            placeholder="Number"
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
            onChange={(event) => setPrecision(event.target.value)}
            type="number"
            value={precision}
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
