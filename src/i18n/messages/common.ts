import { defineMessages } from '../define';

type TNavText = { title: string; description: string; tag: string };

export const commonMessages = defineMessages<{
  site: { description: string };
  nav: { caro: TNavText; pikachu: TNavText; blog: TNavText; process: TNavText };
  header: {
    homeLabel: string;
    mainNav: string;
    mobileNav: string;
    openMenu: string;
    menu: string;
    menuDescription: string;
    home: string;
  };
  home: {
    intro: string;
    source: string;
    portfolio: string;
    experiments: string;
  };
  notFound: { title: string; description: string; back: string };
  error: { title: string; description: string; retry: string };
  loading: string;
  settings: {
    open: string;
    title: string;
    language: string;
    sound: string;
    mute: string;
    unmute: string;
    backgroundMute: string;
    backgroundUnmute: string;
    samples: { click: string; success: string; move: string; error: string; win: string };
  };
  actions: {
    save: string;
    cancel: string;
    newGame: string;
    undo: string;
    config: string;
    instructions: string;
    copy: string;
    copied: string;
  };
  languageNames: { en: string; vi: string };
  ui: {
    close: string;
    breadcrumb: string;
    pagination: string;
    previous: string;
    next: string;
    previousPage: string;
    nextPage: string;
    morePages: string;
  };
}>({
  en: {
    site: {
      description:
        'A playground of small web experiments: board games, an OS process scheduler visualizer and a chat app.',
    },
    nav: {
      caro: {
        title: 'Caro',
        description: 'Classic five-in-a-row with offline, online (peer-to-peer) and blind modes.',
        tag: 'Game',
      },
      pikachu: {
        title: 'Pikachu',
        description: 'Match pairs of tiles across a board that shifts as you clear it.',
        tag: 'Game',
      },
      blog: {
        title: 'Blog',
        description: 'A master thesis on account abstraction and ZK proofs, plus library docs.',
        tag: 'Writing',
      },
      process: {
        title: 'Process',
        description: 'Visualize how an operating system schedules processes across CPU cores.',
        tag: 'Simulation',
      },
    },
    header: {
      homeLabel: 'Experiment Web home',
      mainNav: 'Main',
      mobileNav: 'Mobile',
      openMenu: 'Open menu',
      menu: 'Menu',
      menuDescription: 'Navigate between experiments',
      home: 'Home',
    },
    home: {
      intro:
        'A playground of small web experiments: board games you can play with a friend, an operating-system scheduler you can watch, and a chat app.',
      source: 'Source on GitHub',
      portfolio: 'Portfolio',
      experiments: 'Experiments',
    },
    notFound: {
      title: 'Page not found',
      description: 'The page you are looking for does not exist.',
      back: 'Back to home',
    },
    error: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again.',
      retry: 'Try again',
    },
    loading: 'Loading',
    settings: {
      open: 'Open settings',
      title: 'Settings',
      language: 'Language',
      sound: 'Sound effects and background music',
      mute: 'Mute',
      unmute: 'Unmute',
      backgroundMute: 'Mute background',
      backgroundUnmute: 'Unmute background',
      samples: { click: 'Click', success: 'Success', move: 'Move', error: 'Error', win: 'Win' },
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      newGame: 'New game',
      undo: 'Undo',
      config: 'Config',
      instructions: 'Instructions',
      copy: 'Copy',
      copied: 'Copied',
    },
    languageNames: { en: 'English', vi: 'Tiếng Việt' },
    ui: {
      close: 'Close',
      breadcrumb: 'Breadcrumb',
      pagination: 'Pagination',
      previous: 'Previous',
      next: 'Next',
      previousPage: 'Go to previous page',
      nextPage: 'Go to next page',
      morePages: 'More pages',
    },
  },
  vi: {
    site: {
      description:
        'Sân chơi gồm những thử nghiệm web nhỏ: trò chơi trên bàn cờ, mô phỏng bộ lập lịch tiến trình của hệ điều hành và ứng dụng trò chuyện.',
    },
    nav: {
      caro: {
        title: 'Caro',
        description:
          'Cờ caro năm quân liên tiếp, chơi offline, online (ngang hàng) và chế độ bịt mắt.',
        tag: 'Trò chơi',
      },
      pikachu: {
        title: 'Pikachu',
        description: 'Nối các cặp hình giống nhau trên bàn cờ thay đổi sau mỗi lần ăn cặp.',
        tag: 'Trò chơi',
      },
      blog: {
        title: 'Blog',
        description:
          'Luận văn thạc sĩ về ví account abstraction và chứng minh ZK, kèm tài liệu thư viện.',
        tag: 'Bài viết',
      },
      process: {
        title: 'Tiến trình',
        description: 'Xem hệ điều hành lập lịch các tiến trình trên nhiều nhân CPU.',
        tag: 'Mô phỏng',
      },
    },
    header: {
      homeLabel: 'Trang chủ Experiment Web',
      mainNav: 'Điều hướng chính',
      mobileNav: 'Điều hướng trên di động',
      openMenu: 'Mở menu',
      menu: 'Menu',
      menuDescription: 'Chuyển giữa các thử nghiệm',
      home: 'Trang chủ',
    },
    home: {
      intro:
        'Sân chơi gồm những thử nghiệm web nhỏ: trò chơi trên bàn cờ để chơi cùng bạn bè, bộ lập lịch của hệ điều hành để quan sát, và một ứng dụng trò chuyện.',
      source: 'Mã nguồn trên GitHub',
      portfolio: 'Portfolio',
      experiments: 'Các thử nghiệm',
    },
    notFound: {
      title: 'Không tìm thấy trang',
      description: 'Trang bạn đang tìm không tồn tại.',
      back: 'Về trang chủ',
    },
    error: {
      title: 'Đã có lỗi xảy ra',
      description: 'Có lỗi không mong muốn. Vui lòng thử lại.',
      retry: 'Thử lại',
    },
    loading: 'Đang tải',
    settings: {
      open: 'Mở cài đặt',
      title: 'Cài đặt',
      language: 'Ngôn ngữ',
      sound: 'Hiệu ứng âm thanh và nhạc nền',
      mute: 'Tắt tiếng',
      unmute: 'Bật tiếng',
      backgroundMute: 'Tắt nhạc nền',
      backgroundUnmute: 'Bật nhạc nền',
      samples: {
        click: 'Bấm',
        success: 'Thành công',
        move: 'Di chuyển',
        error: 'Lỗi',
        win: 'Thắng',
      },
    },
    actions: {
      save: 'Lưu',
      cancel: 'Huỷ',
      newGame: 'Ván mới',
      undo: 'Đi lại',
      config: 'Cài đặt',
      instructions: 'Hướng dẫn',
      copy: 'Sao chép',
      copied: 'Đã sao chép',
    },
    languageNames: { en: 'English', vi: 'Tiếng Việt' },
    ui: {
      close: 'Đóng',
      breadcrumb: 'Đường dẫn trang',
      pagination: 'Phân trang',
      previous: 'Trước',
      next: 'Sau',
      previousPage: 'Trang trước',
      nextPage: 'Trang sau',
      morePages: 'Các trang khác',
    },
  },
});
