import { TRubikLevel } from 'src/configs/rubikBook.config';
import { defineMessages } from '../define';

/** Titles of the Rubik guide. Chapter and section ids come from `RUBIK_BOOK`. */
export const rubikBookMessages = defineMessages<{
  title: string;
  contents: string;
  contentsOpen: string;
  lookup: string;
  levels: Record<TRubikLevel, { label: string; hint: string }>;
  /** Chapter id -> title. */
  chapters: Record<string, string>;
  /** Section id -> title. The layer-by-layer steps take theirs from the beginner guide. */
  sections: Record<string, string>;
}>({
  en: {
    title: 'Learn to solve the Rubik 3x3 from scratch',
    contents: 'Contents',
    contentsOpen: 'Show the contents',
    lookup: 'Look up an algorithm',
    levels: {
      beginner: { label: 'Beginner', hint: 'LBL · 7 steps · ~7 algorithms' },
      intermediate: { label: 'Intermediate', hint: 'CFOP 4-look · 17 algorithms' },
      advanced: { label: 'Advanced', hint: 'Full OLL/PLL · F2L · lookahead' },
    },
    chapters: {
      path: 'How to read this guide',
      basics: 'The basics',
      lbl: 'Layer by layer: your first solve',
      cross: 'Cross',
      f2l: 'F2L: the first two layers',
      oll: 'OLL: orient the last layer',
      pll: 'PLL: permute the last layer',
      skills: 'Skills: fingers, speed and lookahead',
      plan: 'Roadmap, goals and other methods',
    },
    sections: {
      'path-beginner': '1. Beginner path',
      'path-intermediate': '2. Intermediate path',
      'path-advanced': '3. Advanced path',
      'path-lookup': 'Finding things quickly',
      'basics-structure': 'How the cube is built',
      'basics-notation': 'Move notation',
      'basics-grip': 'Holding the cube and finger practice',
      'lbl-variants': 'Why other guides use different algorithms',
      'lbl-tips': 'Tips and common mistakes',
      'cross-direct': 'Cross edges straight onto the bottom',
      'cross-planning': 'Thinking about the cross as a whole',
      'cross-inspection': 'Using the 15-second inspection',
      'cross-xcross': 'XCross and colour neutrality',
      'f2l-corners': 'White corners with short inserts',
      'f2l-pairs': 'Intuitive F2L: pairs',
      'f2l-algs': 'F2L algorithms and tips',
      'oll-2look': '2-look OLL (10 algorithms)',
      'oll-full': 'Full OLL (57 cases)',
      'pll-2look': '2-look PLL (7 algorithms)',
      'pll-full': 'Full PLL (21 cases)',
      'skills-fingers': 'Finger tricks',
      'skills-saving': 'Saving time',
      'skills-lookahead': 'Lookahead',
      'skills-lastlayer': 'Last layer: AUF, COLL and ZBLL',
      'skills-practice': 'Practising the right way',
      'plan-roadmap': 'Suggested learning order',
      'plan-goals': 'Goals',
      'plan-methods': 'Other methods',
      'plan-sources': 'References',
    },
  },
  vi: {
    title: 'Học giải Rubik 3x3 từ con số 0',
    contents: 'Mục lục',
    contentsOpen: 'Mở mục lục',
    lookup: 'Tra cứu công thức',
    levels: {
      beginner: { label: 'Người mới', hint: 'LBL · 7 bước · ~7 công thức' },
      intermediate: { label: 'Trung cấp', hint: 'CFOP 4-look · 17 công thức' },
      advanced: { label: 'Chuyên nghiệp', hint: 'Full OLL/PLL · F2L · lookahead' },
    },
    chapters: {
      path: 'Cách đọc hướng dẫn này',
      basics: 'Kiến thức nền',
      lbl: 'Từng tầng: lần giải đầu tiên',
      cross: 'Cross (dấu cộng)',
      f2l: 'F2L: hai tầng đầu',
      oll: 'OLL: xoay tầng cuối',
      pll: 'PLL: hoán vị tầng cuối',
      skills: 'Kỹ năng: ngón tay, tốc độ và lookahead',
      plan: 'Lộ trình, mục tiêu và phương pháp khác',
    },
    sections: {
      'path-beginner': '1. Lộ trình người mới',
      'path-intermediate': '2. Lộ trình trung cấp',
      'path-advanced': '3. Lộ trình chuyên nghiệp',
      'path-lookup': 'Tìm nhanh nội dung',
      'basics-structure': 'Cấu tạo khối',
      'basics-notation': 'Ký hiệu nước đi',
      'basics-grip': 'Cách cầm và tập ngón tay',
      'lbl-variants': 'Vì sao công thức ở đây khác một số trang khác',
      'lbl-tips': 'Mẹo và lỗi hay gặp',
      'cross-direct': 'Đưa cạnh dấu cộng thẳng xuống đáy',
      'cross-planning': 'Nhìn cả dấu cộng, không làm từng cạnh',
      'cross-inspection': 'Dùng 15 giây quan sát',
      'cross-xcross': 'XCross và cross không màu cố định',
      'f2l-corners': 'Góc trắng bằng công thức ngắn',
      'f2l-pairs': 'F2L trực quan: ghép cặp',
      'f2l-algs': 'Công thức F2L và mẹo',
      'oll-2look': '2-look OLL (10 công thức)',
      'oll-full': 'Full OLL (57 ca)',
      'pll-2look': '2-look PLL (7 công thức)',
      'pll-full': 'Full PLL (21 ca)',
      'skills-fingers': 'Finger tricks',
      'skills-saving': 'Tiết kiệm thời gian',
      'skills-lookahead': 'Lookahead (nhìn trước)',
      'skills-lastlayer': 'Tầng cuối: AUF, COLL và ZBLL',
      'skills-practice': 'Luyện tập đúng cách',
      'plan-roadmap': 'Thứ tự học đề xuất',
      'plan-goals': 'Mục tiêu',
      'plan-methods': 'Các phương pháp khác',
      'plan-sources': 'Nguồn tham khảo',
    },
  },
});
