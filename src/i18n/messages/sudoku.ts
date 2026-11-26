import { TSudokuDifficulty, TSudokuTechnique, TSudokuUnitKind } from 'src/types/sudoku.type';
import { defineMessages } from '../define';

/** What a technique's explanation can mention; cells are named like `R3C4` (row 3, column 4). */
export type TSudokuExplainContext = {
  /** The cell that receives the digit, for a placement. */
  cell: string;
  digit: number;
  /** The cells that form the pattern. */
  cells: string[];
  /** The digits the pattern is about. */
  digits: number[];
  /** The row, column or box the pattern lives in, like "row 3". */
  unit: string;
  /** What gets removed, like "R1C2: 4, 5; R3C3: 4". */
  removed: string;
};

export const sudokuMessages = defineMessages<{
  meta: { title: string; description: string };
  title: string;
  difficulty: Record<TSudokuDifficulty, string>;
  modes: { random: string; daily: string };
  status: {
    time: (time: string) => string;
    mistakes: (count: number) => string;
    hints: (count: number) => string;
    generating: string;
    won: (time: string) => string;
    dailySolved: (time: string) => string;
    dailyLabel: (date: string) => string;
    fallback: (difficulty: string) => string;
  };
  actions: {
    notes: string;
    erase: string;
    redo: string;
    hint: string;
    autoNotes: string;
    checkMistakes: string;
    daily: string;
    reveal: string;
    dismiss: string;
  };
  board: {
    label: string;
    cell: (row: number, column: number, value: number, isGiven: boolean) => string;
    emptyCell: (row: number, column: number, notes: number[]) => string;
    pad: string;
    padDigit: (digit: number, left: number) => string;
  };
  units: Record<TSudokuUnitKind, (index: number) => string>;
  techniques: Record<TSudokuTechnique, string>;
  hint: {
    title: string;
    mistake: (cells: string[]) => string;
    reveal: (cell: string, digit: number) => string;
    step: (index: number, technique: string, text: string) => string;
  };
  explain: Record<TSudokuTechnique, (context: TSudokuExplainContext) => string>;
  instruction: { title: string; rules: string[]; controls: string[] };
}>({
  en: {
    meta: {
      title: 'Sudoku',
      description:
        'Sudoku with four difficulty levels, pencil notes, undo, a daily puzzle and hints that explain the technique.',
    },
    title: 'Sudoku',
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' },
    modes: { random: 'Random', daily: 'Daily' },
    status: {
      time: (time) => `Time ${time}`,
      mistakes: (count) => `Mistakes ${count}`,
      hints: (count) => `Hints ${count}`,
      generating: 'Generating a puzzle…',
      won: (time) => `Solved in ${time}!`,
      dailySolved: (time) => `Daily solved · best ${time}`,
      dailyLabel: (date) => `Daily ${date}`,
      fallback: (difficulty) => `No ${difficulty} puzzle was found in time; this one is close.`,
    },
    actions: {
      notes: 'Notes',
      erase: 'Erase',
      redo: 'Redo',
      hint: 'Hint',
      autoNotes: 'Fill notes',
      checkMistakes: 'Check mistakes',
      daily: 'Daily puzzle',
      reveal: 'Fill it in',
      dismiss: 'Dismiss',
    },
    board: {
      label: 'Sudoku board',
      cell: (row, column, value, isGiven) =>
        `Row ${row}, column ${column}, ${value}${isGiven ? ', given' : ''}`,
      emptyCell: (row, column, notes) =>
        `Row ${row}, column ${column}, empty${notes.length ? `, notes ${notes.join(' ')}` : ''}`,
      pad: 'Digits',
      padDigit: (digit, left) => `${digit}, ${left} left`,
    },
    units: {
      row: (index) => `row ${index}`,
      column: (index) => `column ${index}`,
      box: (index) => `box ${index}`,
    },
    techniques: {
      nakedSingle: 'Naked single',
      hiddenSingle: 'Hidden single',
      nakedPair: 'Naked pair',
      nakedTriple: 'Naked triple',
      hiddenPair: 'Hidden pair',
      pointing: 'Pointing',
      claiming: 'Claiming',
      xWing: 'X-Wing',
      yWing: 'Y-Wing',
    },
    hint: {
      title: 'Hint',
      mistake: (cells) =>
        `Something is wrong first: ${cells.join(', ')} ${cells.length > 1 ? 'hold' : 'holds'} a digit that does not belong in the solution.`,
      reveal: (cell, digit) =>
        `No technique applies here, so the answer is revealed: ${cell} is ${digit}.`,
      step: (index, technique, text) => `${index}. ${technique}: ${text}`,
    },
    explain: {
      nakedSingle: ({ cell, digit }) => `${cell} has only one candidate left, ${digit}.`,
      hiddenSingle: ({ cell, digit, unit }) => `In ${unit}, ${digit} can only go in ${cell}.`,
      nakedPair: ({ cells, digits, unit, removed }) =>
        `${cells.join(' and ')} can only be ${digits.join(' or ')}, so those two digits belong to them in ${unit}. Remove ${removed}.`,
      nakedTriple: ({ cells, digits, unit, removed }) =>
        `${cells.join(', ')} share only the digits ${digits.join(', ')}, so those digits belong to them in ${unit}. Remove ${removed}.`,
      hiddenPair: ({ cells, digits, unit, removed }) =>
        `In ${unit}, ${digits.join(' and ')} fit only ${cells.join(' and ')}, so those cells can hold nothing else. Remove ${removed}.`,
      pointing: ({ cells, digits, unit, removed }) =>
        `In ${unit}, ${digits[0]} fits only ${cells.join(', ')}, which sit on one line, so it cannot appear elsewhere on that line. Remove ${removed}.`,
      claiming: ({ cells, digits, unit, removed }) =>
        `In ${unit}, ${digits[0]} fits only ${cells.join(', ')}, which sit in one box, so it cannot appear elsewhere in that box. Remove ${removed}.`,
      xWing: ({ cells, digits, removed }) =>
        `${digits[0]} fits only the corners ${cells.join(', ')} of a rectangle, so it is in two opposite corners and cannot appear elsewhere on those lines. Remove ${removed}.`,
      yWing: ({ cells, digits, removed }) =>
        `${cells[0]} (${digits[0]}/${digits[1]}) sees ${cells[1]} (${digits[0]}/${digits[2]}) and ${cells[2]} (${digits[1]}/${digits[2]}): whichever it is, one of them becomes ${digits[2]}. Remove ${removed}.`,
    },
    instruction: {
      title: 'How to play Sudoku',
      rules: [
        'Fill every row, column and 3×3 box with the digits 1 to 9, each exactly once.',
        'Every puzzle has exactly one solution, so you never need to guess.',
        'Pencil notes let you write down the digits a cell could still be.',
        'Hint explains the next move with the technique behind it.',
      ],
      controls: [
        'Click a cell, then press 1-9 or a pad button. Press the same digit again to clear it.',
        'Arrow keys move, Backspace or Delete erases, N toggles notes, H asks for a hint.',
        'Ctrl/Cmd+Z undoes and Ctrl/Cmd+Shift+Z redoes.',
        'The daily puzzle is the same for everyone on a given date and difficulty.',
      ],
    },
  },
  vi: {
    meta: {
      title: 'Sudoku',
      description:
        'Sudoku bốn mức độ khó, ghi chú bút chì, đi lại, bàn hằng ngày và gợi ý giải thích kỹ thuật.',
    },
    title: 'Sudoku',
    difficulty: { easy: 'Dễ', medium: 'Vừa', hard: 'Khó', expert: 'Rất khó' },
    modes: { random: 'Ngẫu nhiên', daily: 'Hằng ngày' },
    status: {
      time: (time) => `Thời gian ${time}`,
      mistakes: (count) => `Sai ${count}`,
      hints: (count) => `Gợi ý ${count}`,
      generating: 'Đang tạo bàn…',
      won: (time) => `Hoàn thành sau ${time}!`,
      dailySolved: (time) => `Đã giải bàn hằng ngày · tốt nhất ${time}`,
      dailyLabel: (date) => `Hằng ngày ${date}`,
      fallback: (difficulty) =>
        `Chưa tìm được bàn mức ${difficulty} kịp lúc; bàn này gần với mức đó.`,
    },
    actions: {
      notes: 'Ghi chú',
      erase: 'Xoá',
      redo: 'Làm lại',
      hint: 'Gợi ý',
      autoNotes: 'Điền ghi chú',
      checkMistakes: 'Kiểm tra lỗi',
      daily: 'Bàn hằng ngày',
      reveal: 'Điền giúp',
      dismiss: 'Đóng',
    },
    board: {
      label: 'Bàn Sudoku',
      cell: (row, column, value, isGiven) =>
        `Hàng ${row}, cột ${column}, số ${value}${isGiven ? ', đề cho' : ''}`,
      emptyCell: (row, column, notes) =>
        `Hàng ${row}, cột ${column}, trống${notes.length ? `, ghi chú ${notes.join(' ')}` : ''}`,
      pad: 'Các chữ số',
      padDigit: (digit, left) => `${digit}, còn ${left}`,
    },
    units: {
      row: (index) => `hàng ${index}`,
      column: (index) => `cột ${index}`,
      box: (index) => `khối ${index}`,
    },
    techniques: {
      nakedSingle: 'Số duy nhất của ô',
      hiddenSingle: 'Số duy nhất trong vùng',
      nakedPair: 'Cặp trần',
      nakedTriple: 'Bộ ba trần',
      hiddenPair: 'Cặp ẩn',
      pointing: 'Chỉ hướng',
      claiming: 'Giành khối',
      xWing: 'X-Wing',
      yWing: 'Y-Wing',
    },
    hint: {
      title: 'Gợi ý',
      mistake: (cells) =>
        `Cần sửa lỗi trước: ${cells.join(', ')} đang chứa số không đúng với đáp án.`,
      reveal: (cell, digit) =>
        `Không có kỹ thuật nào áp dụng được, nên mình hé lộ đáp án: ${cell} là ${digit}.`,
      step: (index, technique, text) => `${index}. ${technique}: ${text}`,
    },
    explain: {
      nakedSingle: ({ cell, digit }) => `Ô ${cell} chỉ còn một khả năng là ${digit}.`,
      hiddenSingle: ({ cell, digit, unit }) =>
        `Trong ${unit}, số ${digit} chỉ có thể đặt ở ô ${cell}.`,
      nakedPair: ({ cells, digits, unit, removed }) =>
        `${cells.join(' và ')} chỉ có thể là ${digits.join(' hoặc ')}, nên hai số này thuộc về hai ô đó trong ${unit}. Loại bỏ ${removed}.`,
      nakedTriple: ({ cells, digits, unit, removed }) =>
        `${cells.join(', ')} chỉ chứa các số ${digits.join(', ')}, nên các số này thuộc về ba ô đó trong ${unit}. Loại bỏ ${removed}.`,
      hiddenPair: ({ cells, digits, unit, removed }) =>
        `Trong ${unit}, số ${digits.join(' và ')} chỉ vừa với ${cells.join(' và ')}, nên hai ô đó không thể chứa số khác. Loại bỏ ${removed}.`,
      pointing: ({ cells, digits, unit, removed }) =>
        `Trong ${unit}, số ${digits[0]} chỉ vừa với ${cells.join(', ')} nằm trên một đường, nên nó không thể xuất hiện ở chỗ khác của đường đó. Loại bỏ ${removed}.`,
      claiming: ({ cells, digits, unit, removed }) =>
        `Trong ${unit}, số ${digits[0]} chỉ vừa với ${cells.join(', ')} nằm trong một khối, nên nó không thể xuất hiện ở chỗ khác của khối đó. Loại bỏ ${removed}.`,
      xWing: ({ cells, digits, removed }) =>
        `Số ${digits[0]} chỉ vừa với bốn góc ${cells.join(', ')} của một hình chữ nhật, nên nó nằm ở hai góc đối nhau và không thể xuất hiện ở chỗ khác của các đường đó. Loại bỏ ${removed}.`,
      yWing: ({ cells, digits, removed }) =>
        `${cells[0]} (${digits[0]}/${digits[1]}) nhìn thấy ${cells[1]} (${digits[0]}/${digits[2]}) và ${cells[2]} (${digits[1]}/${digits[2]}): dù ô trục là số nào thì một trong hai ô kia cũng thành ${digits[2]}. Loại bỏ ${removed}.`,
    },
    instruction: {
      title: 'Cách chơi Sudoku',
      rules: [
        'Điền các số từ 1 đến 9 vào mọi hàng, mọi cột và mọi khối 3×3, mỗi số đúng một lần.',
        'Bàn nào cũng chỉ có đúng một đáp án, nên bạn không bao giờ phải đoán.',
        'Ghi chú bút chì giúp bạn ghi lại những số một ô còn có thể là.',
        'Gợi ý giải thích nước đi kế tiếp cùng kỹ thuật đằng sau nó.',
      ],
      controls: [
        'Bấm vào một ô rồi nhấn phím 1-9 hoặc nút số. Nhấn lại đúng số đó để xoá.',
        'Phím mũi tên để di chuyển, Backspace hoặc Delete để xoá, N bật ghi chú, H xin gợi ý.',
        'Ctrl/Cmd+Z đi lại và Ctrl/Cmd+Shift+Z làm lại.',
        'Bàn hằng ngày giống nhau cho mọi người trong cùng một ngày và mức độ khó.',
      ],
    },
  },
});
