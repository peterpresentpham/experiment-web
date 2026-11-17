import Link from 'next/link';
import { Fragment } from 'react';
import { commonMessages } from 'src/i18n/messages/common';
import { getMessages } from 'src/i18n/server';
import { TDivProps } from 'src/types/global';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './shadcn/breadcrumb';

export interface CssBreadcrumbsProps extends TDivProps {
  configs: Array<{ link?: string; label: string; formatter?: (label: string) => string }>;
}

export default async function CssBreadcrumbs({ configs, ...props }: CssBreadcrumbsProps) {
  const len = configs.length - 1;
  const { ui } = await getMessages(commonMessages);

  return (
    <div {...props}>
      <Breadcrumb aria-label={ui.breadcrumb}>
        <BreadcrumbList>
          {configs.map((item, index) => {
            const formatter = item?.formatter;

            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.link ? (
                    <Link href={item.link} className="no-underline">
                      <p>{formatter ? formatter(item.label) : item.label}</p>
                    </Link>
                  ) : (
                    <p color="text-background">{formatter ? formatter(item.label) : item.label}</p>
                  )}
                </BreadcrumbItem>
                {index < len && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
