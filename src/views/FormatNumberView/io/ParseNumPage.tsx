/* eslint-disable react/no-unescaped-entities */
import { parseNum } from '@peter-present/format-number';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import { Input } from 'src/components/shadcn/input';
import { useDebounceValue } from 'src/hooks/useDebounce';

export default function ParseNumPage() {
  const [value, setValue] = useState('0');
  const [debounceValue] = useDebounceValue(value, 500);

  const result = useMemo(() => {
    return parseNum(debounceValue);
  }, [debounceValue]);

  const fnText = useMemo(() => {
    return `parseNum(${debounceValue})`;
  }, [debounceValue]);

  return (
    <ElementItem
      id="parseNum"
      title={
        <>
          <span className="text-keyword">function</span> <span className="text-name">parseNum</span>
          (<span className="text-params">value</span>:{' '}
          <Link href="/blog/format-number/types#NumberType">
            <span className="font-semibold hover:underline">NumberType</span>
          </Link>
          , <span className="text-params">options</span>:{' '}
          <Link href="/blog/format-number/types#ParseNumberParamsType">
            <span className="font-semibold hover:underline">ParseNumberParamsType</span> = {'{}'}
          </Link>
          ): string
        </>
      }
      description="Parses various input formats into a standard decimal string. Supports currencies ($€£¥), commas, underscores, scientific notation (e+), and custom subscript notation."
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
          {': The input value to parse. Can be a number, string, or bigint.'}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">Returns</p>
      <p>(string): A standardized decimal string (e.g., "1234.56").</p>
      <p className="my-4 text-lg font-bold">Example</p>
      <TitleBox
        title="value"
        value={
          <Input
            placeholder="Number"
            onChange={(event) => setValue(event.target.value)}
            value={value}
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
