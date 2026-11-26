import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { RUBIK_LEVELS, RUBIK_PATHS } from 'src/configs/rubikBook.config';
import { defineMessages } from 'src/i18n/define';
import { rubikBookMessages } from 'src/i18n/messages/rubikBook';
import { getLocale } from 'src/i18n/server';
import { pathLinks } from 'src/services/rubik/book.utils';
import { P } from '../parts';
import { ChapterHeading, getBookToc, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  solver: string;
  read: string;
  moveOn: Record<'beginner' | 'intermediate' | 'advanced', string>;
  lookup: string;
}>({
  en: {
    intro:
      'A 3x3 cube has about 43 quintillion states, yet every one of them can be solved in at most 20 moves. You do not need to remember states: you only need a method that breaks the solve into steps. The guide is one book with chapters in reading order. Pick the path for your level, or use the contents to jump to a topic. Every picture is drawn automatically from its own algorithm, and every algorithm has been checked in a simulation.',
    solver: 'Have a scrambled cube? Paint or scan it and get a solution in 3D',
    read: 'Read, in this order:',
    moveOn: {
      beginner:
        'Move on when you solve without the guide, consistently under about 1 to 2 minutes.',
      intermediate:
        'Move on when you are consistently under about 30 seconds. Learn full PLL first, then better F2L and lookahead, and finally full OLL.',
      advanced: 'There is no next level: the goals below show what each time needs.',
    },
    lookup:
      'Need one algorithm, not a lesson? The lookup page lists every OLL, PLL and F2L case with a picture. Search by name (Sune, T-perm), by number (OLL 27), by group, or paste the moves you remember.',
  },
  vi: {
    intro:
      'Rubik 3x3 có khoảng 43 tỷ tỷ trạng thái, nhưng mọi trạng thái đều giải được trong tối đa 20 nước. Bạn không cần nhớ trạng thái: chỉ cần một phương pháp chia nhỏ thành các bước. Hướng dẫn là một cuốn sách gồm các chương xếp theo thứ tự đọc. Chọn lộ trình theo trình độ, hoặc dùng mục lục để nhảy tới chủ đề cần tìm. Mọi hình minh hoạ được vẽ tự động từ chính công thức, và mọi công thức đều đã được kiểm tra bằng mô phỏng.',
    solver: 'Có khối đang xáo? Tô màu hoặc quét bằng camera để xem lời giải 3D',
    read: 'Đọc theo thứ tự:',
    moveOn: {
      beginner:
        'Đi tiếp khi bạn giải được không cần nhìn hướng dẫn, đều đặn dưới khoảng 1 đến 2 phút.',
      intermediate:
        'Đi tiếp khi bạn đều đặn dưới khoảng 30 giây. Học full PLL trước, rồi F2L tốt hơn và lookahead, cuối cùng là full OLL.',
      advanced:
        'Không còn cấp tiếp theo: phần mục tiêu bên dưới cho biết mỗi mốc thời gian cần gì.',
    },
    lookup:
      'Chỉ cần một công thức, không cần cả bài học? Trang tra cứu liệt kê mọi ca OLL, PLL và F2L kèm hình. Tìm theo tên (Sune, T-perm), theo số (OLL 27), theo nhóm, hoặc dán các nước bạn còn nhớ.',
  },
});

/** Opening chapter: how the book is organised, one reading path per level, and the lookup page. */
export default async function PathChapter() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const book = rubikBookMessages[locale];
  const toc = await getBookToc();

  return (
    <section>
      <ChapterHeading id="path" />
      <P>{t.intro}</P>
      <Link
        href={`${RUBIK_BASE}/solver`}
        className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        <Sparkles className="size-4" />
        {t.solver}
      </Link>

      <div className="mt-2 grid gap-4 lg:grid-cols-3">
        {RUBIK_LEVELS.map((level) => (
          <div key={level} id={`path-${level}`} className="scroll-mt-24 rounded-md border p-4">
            <p className="text-lg font-semibold">{book.sections[`path-${level}`]}</p>
            <p className="text-xs text-muted-foreground">{book.levels[level].hint}</p>
            <p className="mt-3 text-sm font-medium">{t.read}</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
              {pathLinks(RUBIK_PATHS[level], toc).map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="underline">
                    {link.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">{t.moveOn[level]}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="path-lookup" />
      <P>{t.lookup}</P>
      <Link
        href={`${RUBIK_BASE}/algorithms`}
        className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        <Search className="size-4" />
        {book.lookup}
      </Link>
    </section>
  );
}
