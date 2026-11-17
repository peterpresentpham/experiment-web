/* eslint-disable react/no-unescaped-entities */
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import ElementItem from 'src/components/format-number/ElementItem';
import { formatNumberMessages } from 'src/i18n/messages/formatNumber';
import { getMessages } from 'src/i18n/server';

export default async function TypesPage() {
  const { types: t } = await getMessages(formatNumberMessages);

  return (
    <div>
      <ElementItem
        id="NumberType"
        title={
          <span>
            <span className="text-keyword">type</span> <span className="text-name">NumberType</span>{' '}
            = number | string | bigint
          </span>
        }
        description={t.NumberType}
      />
      <ElementItem
        id="RoundingMode"
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">RoundingMode</span> = 'half' | 'up' | 'down' | 'banker' |
            'truncate'
          </>
        }
        description={t.RoundingMode}
      >
        <ArticleUL className="list-disc">
          {(['half', 'up', 'down', 'truncate', 'banker'] as const).map((mode, index) => (
            <ArticleLI key={mode} isFirst={index == 0}>
              <span className="text-params">{mode}</span>: {t.roundingModes[mode]}
            </ArticleLI>
          ))}
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="NotationMode"
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">NotationMode</span> = 'subscript' | 'scientific'
          </>
        }
        description={t.NotationMode}
      />
      <ElementItem
        id="SignType"
        title={
          <>
            <span className="text-keyword">type</span> <span className="text-name">SignType</span> =
            '-' | ''
          </>
        }
        description={t.SignType}
      />
      <ElementItem
        id="RoundingConfigType"
        description={t.RoundingConfigType}
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">RoundingConfigType</span> <span>{' = Partial<{ '}</span>
            <span className="text-params">rounding</span>
            <span>{': RoundingMode; '}</span>
            <span className="text-params">precision</span>
            <span>{': number; }>'}</span>
          </>
        }
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-params">rounding</span>: {t.rounding}
          </ArticleLI>
          <ArticleLI>
            <span className="text-params">precision</span>: {t.precision}
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="NumberConfigType"
        description={t.NumberConfigType}
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">NumberConfigType</span> <span>{' = Partial<{ '}</span>
            <span className="text-params">prefix</span>
            <span>{': string; '}</span>
            <span className="text-params">suffix</span>
            <span>{': string; '}</span>
            <span className="text-params">notation</span>
            <span>{': NotationMode; }>'}</span>
          </>
        }
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-params">prefix</span>: {t.prefix}
          </ArticleLI>
          <ArticleLI>
            <span className="text-params">suffix</span>: {t.suffix}
          </ArticleLI>
          <ArticleLI>
            <span className="text-params">notation</span>: {t.notation}
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="ObjectNumberType"
        description={t.ObjectNumberType}
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">ObjectNumberType</span>{' '}
            <span>{' = { sign: SignType; value: string } & NumberConfigType & Partial<{ '}</span>
            <span className="text-params">compactedSymbol</span>
            <span>{': string; }>'}</span>
          </>
        }
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-params">compactedSymbol</span>: {t.compactedSymbol}
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="FormattingConfigType"
        description={t.FormattingConfigType}
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">FormattingConfigType</span>{' '}
            <span>{' = RoundingConfigType & NumberConfigType & Partial<{ '}</span>
            <span className="text-params">isCompact</span>
            <span>{': boolean; }>'}</span>
          </>
        }
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-params">isCompact</span>: {t.isCompact}
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="FNType"
        title={
          <div>
            <span className="text-keyword">type</span> <span className="text-name">FNType</span>{' '}
            <span>{'= {'}</span>
            <div className="ml-4">
              <span className="text-name">round</span>(options?:{' '}
              <span className="text-name">RoundingConfigType</span>):{' '}
              <span className="text-name">FNType</span>;
            </div>
            <div className="ml-4">
              <span className="text-name">compact</span>(options?:{' '}
              <span className="text-name">RoundingConfigType</span>):{' '}
              <span className="text-name">FNType</span>;
            </div>
            <div className="ml-4">
              <span className="text-name">notation</span>(mode?:{' '}
              <span className="text-name">NotationMode</span>):{' '}
              <span className="text-name">FNType</span>;
            </div>
            <div className="ml-4">
              <span className="text-name">prefix</span>(symbol: string):{' '}
              <span className="text-name">FNType</span>;
            </div>
            <div className="ml-4">
              <span className="text-name">suffix</span>(symbol: string):{' '}
              <span className="text-name">FNType</span>;
            </div>
            <div className="ml-4">
              <span className="text-name">toNumber</span>(): string;
            </div>
            <div className="ml-4">
              <span className="text-name">toObject</span>():{' '}
              <span className="text-name">ObjectNumberType</span>;
            </div>
            <div>{'};'}</div>
          </div>
        }
        description={t.FNType}
      >
        <ArticleUL className="list-disc">
          {(
            ['round', 'compact', 'notation', 'prefix', 'suffix', 'toNumber', 'toObject'] as const
          ).map((member, index) => (
            <ArticleLI key={member} isFirst={index == 0}>
              <span className="text-name">{member}</span>: {t.fnMembers[member]}
            </ArticleLI>
          ))}
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="ParseNumberParamsType"
        title={
          <>
            <span className="text-keyword">type</span>{' '}
            <span className="text-name">ParseNumberParamsType</span>
            {' = Partial<{ '}
            <span className="text-params">fallback</span>
            {': string; }>'}
          </>
        }
        description={t.ParseNumberParamsType}
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-params">fallback</span>: {t.fallback}
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
    </div>
  );
}
