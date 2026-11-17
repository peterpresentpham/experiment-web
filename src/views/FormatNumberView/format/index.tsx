'use client';

import { FN, RoundingMode } from '@peter-present/format-number';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import ElementItem from 'src/components/format-number/ElementItem';
import RoundTypeSelect from 'src/components/format-number/RoundTypeSelect';
import { Input } from 'src/components/shadcn/input';
import { Toggle } from 'src/components/shadcn/toggle';
import { useDebounceValue } from 'src/hooks/useDebounce';
import { useMessages } from 'src/i18n/client';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';

export default function FormatPage() {
  const t = useMessages(formatNumberMessages);
  const [value, setValue] = useState('1234.567');
  const [debounceValue] = useDebounceValue(value, 500);
  const [rounding, setRounding] = useState<RoundingMode>('half');
  const [precision, setPrecision] = useState('2');
  const [prefix, setPrefix] = useState('$');
  const [suffix, setSuffix] = useState('');
  const [isCompact, setIsCompact] = useState(false);

  const result = useMemo(() => {
    let formatter = FN(debounceValue).round({
      rounding,
      precision: precision ? parseInt(precision) : undefined,
    });
    if (isCompact) formatter = formatter.compact();
    if (prefix) formatter = formatter.prefix(prefix);
    if (suffix) formatter = formatter.suffix(suffix);
    return formatter.toNumber();
  }, [debounceValue, rounding, precision, prefix, suffix, isCompact]);

  const fnCode = useMemo(() => {
    let code = `FN('${debounceValue}')`;
    if (rounding !== 'half' || (precision && precision !== '0')) {
      const opts: string[] = [];
      if (rounding !== 'half') opts.push(`rounding: '${rounding}'`);
      if (precision && precision !== '0') opts.push(`precision: ${precision}`);
      code += `.round({ ${opts.join(', ')} })`;
    }
    if (isCompact) code += '.compact()';
    if (prefix) code += `.prefix('${prefix}')`;
    if (suffix) code += `.suffix('${suffix}')`;
    code += '.toNumber();';
    return code;
  }, [debounceValue, rounding, precision, prefix, suffix, isCompact]);

  return (
    <ElementItem
      id="fn"
      title={
        <>
          <span className="text-keyword">function</span> <span className="text-name">FN</span>(
          <span className="text-params">value</span>:{' '}
          <Link href="/blog/format-number/types#NumberType">
            <span className="font-semibold hover:underline">NumberType</span>
          </Link>
          ):{' '}
          <Link href="/blog/format-number/types#FNType">
            <span className="font-semibold hover:underline">FNType</span>
          </Link>
        </>
      }
      description={t.fn.FN.description}
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
          {`: ${t.fn.FN.params.value}`}
        </ArticleLI>
      </ArticleUL>

      <p className="my-4 text-lg font-bold">{t.methods}</p>
      <ArticleUL className="list-disc text-sm">
        <ArticleLI isFirst>
          <code className="text-blue-400">.round(options)</code>: {t.fnMethods.round}
        </ArticleLI>
        <ArticleLI>
          <code className="text-blue-400">.compact()</code>: {t.fnMethods.compact}
        </ArticleLI>
        <ArticleLI>
          <code className="text-blue-400">.prefix(symbol)</code>: {t.fnMethods.prefix}
        </ArticleLI>
        <ArticleLI>
          <code className="text-blue-400">.suffix(symbol)</code>: {t.fnMethods.suffix}
        </ArticleLI>
        <ArticleLI>
          <code className="text-blue-400">.toNumber()</code>: {t.fnMethods.toNumber}
        </ArticleLI>
      </ArticleUL>
      <p className="my-4 text-lg font-bold">{t.returns}</p>
      <p>
        (
        <Link href="/blog/format-number/types#FNType">
          <span className="font-semibold hover:underline">FNType</span>
        </Link>
        ): {t.fn.FN.returns}
      </p>
      <p className="my-4 text-lg font-bold">{t.example}</p>
      <TitleBox
        title="value"
        value={
          <Input
            placeholder={t.numberPlaceholder}
            onChange={(event) => setValue(event.target.value)}
            value={value}
          />
        }
      />
      <TitleBox
        title="rounding"
        value={<RoundTypeSelect mode={rounding} setMode={setRounding} />}
      />
      <TitleBox
        title="precision"
        value={
          <Input
            className="mt-2"
            placeholder="precision"
            onChange={(event) => setPrecision(event.target.value)}
            type="number"
            value={precision}
          />
        }
      />
      <TitleBox
        title="isCompact"
        value={
          <Toggle
            pressed={isCompact}
            onPressedChange={setIsCompact}
            variant="outline"
            className="mt-2"
          >
            {isCompact ? t.on : t.off}
          </Toggle>
        }
      />
      <TitleBox
        title="prefix"
        value={
          <Input
            className="mt-2"
            placeholder="prefix"
            onChange={(event) => setPrefix(event.target.value)}
            value={prefix}
          />
        }
      />
      <TitleBox
        title="suffix"
        value={
          <Input
            className="mt-2"
            placeholder="suffix"
            onChange={(event) => setSuffix(event.target.value)}
            value={suffix}
          />
        }
      />
      <div className="bg-muted group border-border relative mt-2 rounded-sm border p-4">
        <CopyClipboard
          copyText={fnCode}
          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
          iconprops={{ className: 'size-4' }}
        />
        <code className="block font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {fnCode}
        </code>
        <p>{t.result(result)}</p>
      </div>
    </ElementItem>
  );
}
