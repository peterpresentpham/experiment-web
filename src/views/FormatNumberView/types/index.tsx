/* eslint-disable react/no-unescaped-entities */
/* eslint-disable quotes */
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import ElementItem from 'src/components/format-number/ElementItem';

export default function TypesPage() {
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
        description="Supported input types for number formatting"
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
        description="Strategies for rounding numbers"
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            {'half: Round to the nearest neighbor. If equidistant, round away from zero.'}
          </ArticleLI>
          <ArticleLI>{'up: Round towards Positive Infinity.'}</ArticleLI>
          <ArticleLI>{'down: Round towards Negative Infinity.'}</ArticleLI>
          <ArticleLI>{'truncate: Round towards Zero.'}</ArticleLI>
          <ArticleLI>
            {'banker: Round to the nearest even neighbor (Statistical rounding).'}
          </ArticleLI>
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
        description="Modes for special numerical notation"
      />
      <ElementItem
        id="SignType"
        title={
          <>
            <span className="text-keyword">type</span> <span className="text-name">SignType</span> =
            '-' | ''
          </>
        }
        description="Possible sign values for internal number representation"
      />
      <ElementItem
        id="RoundingConfigType"
        description="Configuration for rounding operations"
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
            <span className="text-params">rounding</span>: The rounding strategy to use
          </ArticleLI>
          <ArticleLI>
            <span className="text-params">precision</span>: Number of decimal places to keep
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="NumberConfigType"
        description="Configuration for basic number display properties"
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
            <span className="text-params">prefix</span>: Text to prepend to the number (e.g., '$')
          </ArticleLI>
          <ArticleLI>
            <span className="text-params">suffix</span>: Text to append to the number (e.g., '
            units')
          </ArticleLI>
          <ArticleLI>
            <span className="text-params">notation</span>: The notation style to apply
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="ObjectNumberType"
        description="Internal object structure containing full formatting state"
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
            <span className="text-params">compactedSymbol</span>: The symbol used for compact
            notation (e.g., 'K', 'M')
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="FormattingConfigType"
        description="Full configuration options for the formatNumber function"
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
            <span className="text-params">isCompact</span>: Whether to use compact notation (K, M,
            B, etc.)
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
      <ElementItem
        id="FNType"
        title={
          <p>
            <span className="text-keyword">type</span> <span className="text-name">FNType</span>{' '}
            <span>{'= {'}</span>
            <p className="ml-4">
              <span className="text-name">round</span>(options?:{' '}
              <span className="text-name">RoundingConfigType</span>):{' '}
              <span className="text-name">FNType</span>;
            </p>
            <p className="ml-4">
              <span className="text-name">compact</span>(options?:{' '}
              <span className="text-name">RoundingConfigType</span>):{' '}
              <span className="text-name">FNType</span>;
            </p>
            <p className="ml-4">
              <span className="text-name">notation</span>(mode?:{' '}
              <span className="text-name">NotationMode</span>):{' '}
              <span className="text-name">FNType</span>;
            </p>
            <p className="ml-4">
              <span className="text-name">prefix</span>(symbol: string):{' '}
              <span className="text-name">FNType</span>;
            </p>
            <p className="ml-4">
              <span className="text-name">suffix</span>(symbol: string):{' '}
              <span className="text-name">FNType</span>;
            </p>
            <p className="ml-4">
              <span className="text-name">toNumber</span>(): string;
            </p>
            <p className="ml-4">
              <span className="text-name">toObject</span>():{' '}
              <span className="text-name">ObjectNumberType</span>;
            </p>
            <p>{'};'}</p>
          </p>
        }
        description="Fluent API interface for chainable number formatting operations."
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-name">round</span>
            {': Rounds the number based on the provided precision and strategy.'}
          </ArticleLI>
          <ArticleLI>
            <span className="text-name">compact</span>
            {': Converts the number to a compact representation (e.g., 1K, 1M, 1B).'}
            {': '}
          </ArticleLI>
          <ArticleLI>
            <span className="text-name">notation</span>
            {': Sets the notation style for the number (e.g., scientific, subscript).'}
            {': '}
          </ArticleLI>
          <ArticleLI>
            <span className="text-name">prefix</span>
            {': Adds a prefix to the formatted number string.'}
            {': '}
          </ArticleLI>
          <ArticleLI>
            <span className="text-name">suffix</span>
            {': Adds a suffix to the formatted number string.'}
            {': '}
          </ArticleLI>
          <ArticleLI>
            <span className="text-name">toNumber</span>
            {': Finalizes the chain and returns the formatted number as a string.'}
            {': '}
          </ArticleLI>
          <ArticleLI>
            <span className="text-name">toObject</span>
            {': Returns the internal state of the number as an ObjectNumberType.'}
            {': '}
          </ArticleLI>
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
        description="Configuration for input parsing"
      >
        <ArticleUL className="list-disc">
          <ArticleLI isFirst>
            <span className="text-params">fallback</span>:{' '}
            {"Value to return if parsing fails. Default is '--'"}
          </ArticleLI>
        </ArticleUL>
      </ElementItem>
    </div>
  );
}
