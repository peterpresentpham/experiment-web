'use client';

import { useRef, useState } from 'react';
import CopyClipboard from '../CopyClipboard';

export type SyntaxHighlighterLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'json'
  | 'html'
  | 'xml'
  | 'css'
  | 'scss'
  | 'less'
  | 'bash'
  | 'shell'
  | 'sh'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'php'
  | 'ruby'
  | 'rust'
  | 'sql'
  | 'kotlin'
  | 'swift'
  | 'r'
  | 'perl'
  | 'lua'
  | 'scala'
  | 'haskell'
  | 'markdown'
  | 'yaml'
  | 'toml'
  | 'ini'
  | 'dockerfile'
  | 'powershell'
  | 'solidity'
  | 'react'
  | 'graphql'
  | 'nginx'
  | 'dart';

export interface CodeBlockProps {
  code: string;
  language?: SyntaxHighlighterLanguage;
  isShowCopy?: boolean;
  showLanguage?: boolean;
}

export default function CodeBlock({
  code,
  language,
  isShowCopy = true,
  showLanguage = false,
}: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [expanded, setExpanded] = useState(false);
  const longCode = code.length > 5000;

  const displayCode = longCode && !expanded ? code.slice(0, 5000) : code;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#19171c] px-4 py-2">
        {language && showLanguage && (
          <span className="text-[12px] text-[#7e7887] uppercase">{language}</span>
        )}
        {language && !showLanguage && <span />}
        {isShowCopy && <CopyClipboard copyText={code} iconprops={{ width: 12, height: 12 }} />}
      </div>

      {/* Code block */}
      <pre
        ref={preRef}
        className="m-0 scrollbar-thin overflow-x-auto bg-[#19171c] p-4 text-sm leading-relaxed text-[#8b8792]"
        style={{ tabSize: 2 }}
      >
        <code>{displayCode}</code>
      </pre>

      {/* Expand button for long code */}
      {longCode && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full cursor-pointer bg-[#19171c] py-2 text-center text-sm text-[#576ddb] hover:underline"
        >
          {expanded ? 'Show less' : `Show more (${(code.length / 1024).toFixed(1)} KB total)`}
        </button>
      )}
    </div>
  );
}
