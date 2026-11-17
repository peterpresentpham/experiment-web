import { TPikachuTransform } from 'src/types/pikachu.type';
import { defineMessages } from '../define';

export const pikachuMessages = defineMessages<{
  meta: { title: string; description: string };
  title: string;
  transforms: Record<TPikachuTransform, string>;
  round: (round: number, transform: string) => string;
  randomType: (transform: string) => string;
  hint: string;
  changeBoard: string;
  outOfMove: string;
  outOfMoveOverlay: string;
  win: string;
  piece: (value: number, row: number, column: number) => string;
  config: {
    title: string;
    board: string;
    imageType: string;
    internal: string;
    external: string;
    lines: string;
    rounds: string;
    reset: string;
    removeRound: string;
    gameType: string;
    normal: string;
    customBoard: string;
    randomBoard: string;
    blind: string;
  };
  instruction: { title: string; internal: string; external: string };
}>({
  en: {
    meta: {
      title: 'Pikachu',
      description: 'Pikachu (Onet) tile matching with board transforms between rounds.',
    },
    title: 'Pikachu',
    transforms: {
      normal: 'Normal',
      fallDown: 'Fall down',
      fallUp: 'Fall up',
      shiftLeft: 'Shift left',
      shiftRight: 'Shift right',
      splitHorizontally: 'Split horizontally',
      mergeHorizontally: 'Merge horizontally',
      splitVertically: 'Split vertically',
      mergeVertically: 'Merge vertically',
      shiftUpLeft: 'Shift up left',
      shiftUpRight: 'Shift up right',
      shiftDownLeft: 'Shift down left',
      shiftDownRight: 'Shift down right',
      spreadOut: 'Spread out',
      collapseToCenter: 'Collapse to center',
    },
    round: (round, transform) => `Round ${round} · ${transform}`,
    randomType: (transform) => `Type · ${transform}`,
    hint: 'Hint',
    changeBoard: 'Change board',
    outOfMove: 'No moves left, please change the board',
    outOfMoveOverlay: 'No more moves. Change the board to continue.',
    win: 'You win!',
    piece: (value, row, column) => `Piece ${value}, row ${row}, column ${column}`,
    config: {
      title: 'Pikachu config',
      board: 'Board config',
      imageType: 'Image type',
      internal: 'Internal',
      external: 'External',
      lines: 'Number of lines',
      rounds: 'Round config',
      reset: 'Reset',
      removeRound: 'Remove round',
      gameType: 'Game type',
      normal: 'Normal',
      customBoard: 'Custom board',
      randomBoard: 'Random board',
      blind: 'Blind',
    },
    instruction: {
      title: 'Pikachu instructions',
      internal: '1. Internal images',
      external: '2. External images',
    },
  },
  vi: {
    meta: {
      title: 'Pikachu',
      description: 'Game nối thú Pikachu (Onet), bàn cờ biến đổi sau mỗi màn.',
    },
    title: 'Pikachu',
    transforms: {
      normal: 'Bình thường',
      fallDown: 'Rơi xuống',
      fallUp: 'Dồn lên',
      shiftLeft: 'Dồn trái',
      shiftRight: 'Dồn phải',
      splitHorizontally: 'Tách ngang',
      mergeHorizontally: 'Gộp ngang',
      splitVertically: 'Tách dọc',
      mergeVertically: 'Gộp dọc',
      shiftUpLeft: 'Dồn lên trái',
      shiftUpRight: 'Dồn lên phải',
      shiftDownLeft: 'Dồn xuống trái',
      shiftDownRight: 'Dồn xuống phải',
      spreadOut: 'Toả ra góc',
      collapseToCenter: 'Dồn vào giữa',
    },
    round: (round, transform) => `Màn ${round} · ${transform}`,
    randomType: (transform) => `Kiểu · ${transform}`,
    hint: 'Gợi ý',
    changeBoard: 'Đổi bàn',
    outOfMove: 'Hết nước đi, hãy đổi bàn',
    outOfMoveOverlay: 'Hết nước đi. Đổi bàn để chơi tiếp.',
    win: 'Bạn thắng!',
    piece: (value, row, column) => `Hình ${value}, hàng ${row}, cột ${column}`,
    config: {
      title: 'Cài đặt Pikachu',
      board: 'Kích thước bàn',
      imageType: 'Bộ hình',
      internal: 'Có sẵn',
      external: 'Bên ngoài',
      lines: 'Số đoạn nối',
      rounds: 'Các màn chơi',
      reset: 'Đặt lại',
      removeRound: 'Xoá màn',
      gameType: 'Kiểu chơi',
      normal: 'Thường',
      customBoard: 'Bàn tuỳ chỉnh',
      randomBoard: 'Bàn ngẫu nhiên',
      blind: 'Bịt mắt',
    },
    instruction: {
      title: 'Hướng dẫn Pikachu',
      internal: '1. Bộ hình có sẵn',
      external: '2. Bộ hình bên ngoài',
    },
  },
});
