'use client';

import Link from 'next/link';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { TTableOfContentType } from 'src/types/thesis.type';
import { buildTableOfContent } from 'src/services/thesis/table-of-content';

interface ContentProps {
  parentIndex?: string | number;
  content: TTableOfContentType;
}

function SubsectionTableOfContent({ parentIndex, content }: ContentProps) {
  return (
    <div className="ml-4">
      {content.map((item) => {
        const _title = parentIndex
          ? `${parentIndex}.${item.index} ${item.title}`
          : `${item.index} ${item.title}`;

        return (
          <div key={item.id}>
            <Link href={`#${item.id}`} className="mb-4 hover:underline">
              {_title}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function SectionTableOfContent({ parentIndex, content }: ContentProps) {
  return (
    <div>
      {content.map((item) => {
        const _index = parentIndex ? `${parentIndex}.${item.index}` : `${item.index}`;
        const _title = parentIndex ? `${_index} ${item.title}` : `${_index} ${item.title}`;

        return (
          <div key={item.id}>
            <Link href={`#${item.id}`} className="mb-4 hover:underline">
              {_title}
            </Link>
            <SubsectionTableOfContent parentIndex={_index} content={item.content} />
          </div>
        );
      })}
    </div>
  );
}

function ChapterTableOfContent({ content }: ContentProps) {
  return (
    <div>
      {content.map((item) => {
        return (
          <div key={item.id}>
            <Link
              href={`#${item.id}`}
              className="mb-4 text-lg font-bold uppercase hover:underline"
            >{`Chapter ${item.index}. ${item.title}`}</Link>
            <SectionTableOfContent parentIndex={item.index} content={item.content} />
          </div>
        );
      })}
    </div>
  );
}

const EMPTY_TOC: ReturnType<typeof buildTableOfContent> = {
  content: [],
  figures: [],
  tables: [],
  appendixes: [],
  abstract: false,
  acknowledge: false,
  reference: false,
};

interface TProps {
  id: string;
  firstLevel: 'chapter' | 'section';
  children: ReactNode;
}

export default function TableOfContent({ id, firstLevel, children }: TProps) {
  const [toc, setToc] = useState<ReturnType<typeof buildTableOfContent>>(EMPTY_TOC);
  const { content, figures, tables, appendixes, abstract, acknowledge, reference } = toc;

  // The table is read from the thesis in the DOM, so it is built once the page has been painted.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setToc(buildTableOfContent(id, firstLevel)));
    return () => cancelAnimationFrame(frame);
  }, [id, firstLevel]);

  return (
    <Fragment>
      <div className="mb-5">
        {acknowledge && (
          <Link href="#acknowledgement" className="hover:underline">
            <p className="text-xl font-bold">Acknowledge</p>
          </Link>
        )}
        {abstract && (
          <Link href="#abstract" className="hover:underline">
            <p className="text-xl font-bold">Abstract</p>
          </Link>
        )}
        <p className="text-xl font-bold">Table of Content</p>
        {firstLevel == 'chapter' && <ChapterTableOfContent content={content} />}
        {firstLevel == 'section' && <SectionTableOfContent content={content} />}
        {reference && (
          <Link href="#reference" className="hover:underline">
            <p className="text-xl font-bold">Reference</p>
          </Link>
        )}
      </div>
      {appendixes.length > 0 && (
        <div>
          <p className="text-xl font-bold">Appendix</p>
          {appendixes.map((appendix) => {
            const title = `Appendix ${appendix.index}. ${appendix.title}`;

            return (
              <div key={appendix.id} className="mt-3">
                <Link href={`#${appendix.id}`} className="mb-4 hover:underline">
                  {title}
                </Link>
              </div>
            );
          })}
        </div>
      )}
      <div className="my-5">
        <p className="text-xl font-bold">List of Figures</p>
        {figures.map((chapterFigure, index) => {
          return (
            <div key={index} className="mt-3">
              {chapterFigure.map((figure) => {
                const title = `Figure ${figure.index} ${figure.title}`;

                return (
                  <div key={figure.id}>
                    <Link href={`#${figure.id}`} className="mb-4 hover:underline">
                      {title}
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="mb-5">
        <p className="text-xl font-bold">List of Tables</p>
        {tables.map((chapterTable, index) => {
          return (
            <div key={index} className="mt-3">
              {chapterTable.map((table) => {
                const title = `Table ${table.index} ${table.title}`;

                return (
                  <div key={table.id}>
                    <Link href={`#${table.id}`} className="mb-4 hover:underline">
                      {title}
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {children}
    </Fragment>
  );
}
