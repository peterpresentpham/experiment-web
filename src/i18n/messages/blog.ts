import { TFormatNumberSlug } from 'src/configs/blog.config';
import { defineMessages } from '../define';

type TTopicText = { title: string; description: string };

export const blogMessages = defineMessages<{
  meta: { title: string; description: string };
  title: string;
  intro: string;
  home: string;
  topics: {
    thesis: TTopicText;
    formatNumber: TTopicText;
    rubik: TTopicText;
    chess: TTopicText;
    caro: TTopicText;
  };
  thesis: { metaTitle: string; metaDescription: string; breadcrumb: string; loading: string };
  formatNumber: {
    title: string;
    docs: string;
    pages: Record<TFormatNumberSlug, string>;
  };
  chess: { title: string; description: string };
  caro: { title: string; description: string };
  rubik: {
    title: string;
    description: string;
    algorithmsTitle: string;
    algorithmsDescription: string;
    algorithmsBreadcrumb: string;
    player: {
      show: string;
      hide: string;
      loading: string;
      error: string;
      play: string;
      pause: string;
      replay: string;
      toStart: string;
      toEnd: string;
      stepBack: string;
      stepForward: string;
      progress: string;
      speed: string;
      moves: string;
    };
  };
}>({
  en: {
    meta: {
      title: 'Blog',
      description:
        'Notes on zero-knowledge proofs, account abstraction, a number formatting library and solving the Rubik cube.',
    },
    title: 'Blog',
    intro: 'Long-form writing and library documentation moved over from my old blog.',
    home: 'Home',
    topics: {
      thesis: {
        title: 'Master thesis',
        description:
          'Account abstraction wallet with social recovery based on zero-knowledge proofs, written as a web book.',
      },
      formatNumber: {
        title: 'Format number',
        description: 'Documentation for @peter-present/format-number, a number formatting library.',
      },
      rubik: {
        title: 'Rubik 3x3',
        description:
          'Learn to solve the 3x3 cube in three levels: beginner, intermediate and advanced. All 57 OLL, 21 PLL and 41 F2L cases, with diagrams.',
      },
      chess: {
        title: 'Chess',
        description:
          'Learn chess from scratch: the rules, how every piece moves, openings, tactics and endgames, with 3D boards that play each example.',
      },
      caro: {
        title: 'Caro',
        description:
          'Learn caro (five in a row) under the blocked-ends rule: the shapes, double threats and VCF, and what the Hell level engine taught us about openings.',
      },
    },
    thesis: {
      metaTitle: 'Account Abstraction Wallet with Social Recovery based on Zero-Knowledge Proof',
      metaDescription:
        'Master thesis on an account abstraction wallet with social recovery using zero-knowledge proofs.',
      breadcrumb: 'Master thesis',
      loading: 'Loading thesis...',
    },
    formatNumber: {
      title: 'Format number',
      docs: 'Documentation',
      pages: {
        'getting-started': 'Getting started',
        round: 'Round',
        compact: 'Compact',
        io: 'IO',
        notation: 'Notation',
        format: 'Format',
        types: 'Types',
      },
    },
    chess: {
      title: 'Chess',
      description:
        'A leveled guide to chess: the rules, how every piece moves, then openings, tactics and endgames, with 3D boards.',
    },
    caro: {
      title: 'Learn caro',
      description:
        'A leveled guide to caro (five in a row) with the blocked-ends rule: shapes, defence, double threats, VCF, and openings from the Hell level engine.',
    },
    rubik: {
      title: 'Rubik 3x3',
      description:
        'A leveled guide to solving the 3x3 cube: beginner, intermediate and advanced. Full OLL, PLL and F2L, with diagrams.',
      algorithmsTitle: 'Rubik 3x3 | Algorithm lookup',
      algorithmsDescription:
        'Search every Rubik 3x3 OLL, PLL and F2L case by name, number or moves, with a picture and algorithms for each.',
      algorithmsBreadcrumb: 'Algorithm lookup',
      player: {
        show: 'Watch in 3D',
        hide: 'Hide 3D',
        loading: 'Loading the 3D cube...',
        error: 'The 3D cube could not load.',
        play: 'Play',
        pause: 'Pause',
        replay: 'Play again',
        toStart: 'To the start',
        toEnd: 'To the end',
        stepBack: 'Previous move',
        stepForward: 'Next move',
        progress: 'Progress',
        speed: 'Speed',
        moves: 'Moves',
      },
    },
  },
  vi: {
    meta: {
      title: 'Blog',
      description:
        'Ghi chép về chứng minh không tiết lộ tri thức, account abstraction, thư viện định dạng số và cách giải Rubik.',
    },
    title: 'Blog',
    intro: 'Các bài viết dài và tài liệu thư viện, chuyển về từ blog cũ của tôi.',
    home: 'Trang chủ',
    topics: {
      thesis: {
        title: 'Luận văn thạc sĩ',
        description:
          'Ví account abstraction có khôi phục xã hội dựa trên chứng minh không tiết lộ tri thức, trình bày dạng sách web (tiếng Anh).',
      },
      formatNumber: {
        title: 'Format number',
        description: 'Tài liệu cho @peter-present/format-number, thư viện định dạng số.',
      },
      rubik: {
        title: 'Rubik 3x3',
        description:
          'Học giải Rubik 3x3 theo 3 cấp độ: người mới, trung cấp, chuyên nghiệp. Đủ 57 OLL, 21 PLL, 41 F2L, có hình minh hoạ.',
      },
      chess: {
        title: 'Cờ vua',
        description:
          'Học cờ vua từ con số 0: luật chơi, cách đi từng quân, khai cuộc, chiến thuật và tàn cuộc, với bàn cờ 3D chạy từng ví dụ.',
      },
      caro: {
        title: 'Cờ caro',
        description:
          'Học chơi caro theo luật chặn hai đầu: các thế cờ, đòn đôi, chuỗi bốn (VCF), và những gì engine cấp Địa ngục cho thấy về khai cuộc.',
      },
    },
    thesis: {
      metaTitle: 'Account Abstraction Wallet with Social Recovery based on Zero-Knowledge Proof',
      metaDescription:
        'Luận văn thạc sĩ về ví account abstraction có khôi phục xã hội dựa trên chứng minh không tiết lộ tri thức.',
      breadcrumb: 'Luận văn thạc sĩ',
      loading: 'Đang tải luận văn...',
    },
    formatNumber: {
      title: 'Format number',
      docs: 'Tài liệu',
      pages: {
        'getting-started': 'Bắt đầu',
        round: 'Round',
        compact: 'Compact',
        io: 'IO',
        notation: 'Notation',
        format: 'Format',
        types: 'Kiểu dữ liệu',
      },
    },
    chess: {
      title: 'Cờ vua',
      description:
        'Hướng dẫn học cờ vua theo cấp độ: luật chơi, cách đi từng quân, rồi khai cuộc, chiến thuật và tàn cuộc, với bàn cờ 3D.',
    },
    caro: {
      title: 'Học chơi cờ caro',
      description:
        'Hướng dẫn chơi caro theo cấp độ với luật chặn hai đầu: các thế cờ, phòng thủ, đòn đôi, VCF, và khai cuộc từ engine cấp Địa ngục.',
    },
    rubik: {
      title: 'Rubik 3x3',
      description:
        'Hướng dẫn giải Rubik 3x3 theo cấp độ: người mới, trung cấp, chuyên nghiệp. Đủ OLL, PLL, F2L, có hình minh hoạ.',
      algorithmsTitle: 'Rubik 3x3 | Tra cứu công thức',
      algorithmsDescription:
        'Tìm mọi ca OLL, PLL và F2L của Rubik 3x3 theo tên, số hoặc các nước, kèm hình và công thức.',
      algorithmsBreadcrumb: 'Tra cứu công thức',
      player: {
        show: 'Xem 3D',
        hide: 'Ẩn 3D',
        loading: 'Đang tải khối 3D...',
        error: 'Không tải được khối 3D.',
        play: 'Phát',
        pause: 'Tạm dừng',
        replay: 'Phát lại',
        toStart: 'Về đầu',
        toEnd: 'Đến cuối',
        stepBack: 'Nước trước',
        stepForward: 'Nước sau',
        progress: 'Tiến độ',
        speed: 'Tốc độ',
        moves: 'Các nước',
      },
    },
  },
});
