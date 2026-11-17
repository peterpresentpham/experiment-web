/* eslint-disable quotes */
import type { MaskName } from 'src/lib/cube/render';

/**
 * Picture of a cube state.
 * - `alg`: show the case this algorithm solves (inverse applied to a solved cube).
 * - `setup`: moves applied forward to a solved cube (e.g. to show what a move does).
 * - `view`: whole-cube rotation applied last, only to change the viewing angle.
 */
export type CubeImage = {
  kind: 'iso' | 'top';
  alg?: string;
  setup?: string;
  view?: string;
  mask?: MaskName;
  arrows?: boolean;
  caption?: string;
};

export type AlgType = { name: string; alg: string; note?: string; image?: CubeImage };

export const COLOR_SCHEME = [
  { color: 'Trắng', opposite: 'Vàng' },
  { color: 'Xanh lá', opposite: 'Xanh dương' },
  { color: 'Đỏ', opposite: 'Cam' },
];

export const NOTATION: Array<{ move: string; meaning: string }> = [
  {
    move: 'R',
    meaning: 'Mặt phải (Right), xoay 90° theo chiều kim đồng hồ khi nhìn thẳng vào mặt phải.',
  },
  { move: "R'", meaning: 'Dấu nháy (đọc là "prime"): xoay ngược chiều kim đồng hồ.' },
  { move: 'R2', meaning: 'Xoay 180° (chiều nào cũng được).' },
  {
    move: 'L',
    meaning: 'Mặt trái (Left). Chiều kim đồng hồ khi nhìn từ bên trái, nên L ngược hướng với R.',
  },
  { move: 'U / D', meaning: 'Mặt trên (Up) / mặt dưới (Down).' },
  { move: 'F / B', meaning: 'Mặt trước (Front) / mặt sau (Back).' },
  {
    move: 'r, u, f... (hoặc Rw)',
    meaning: 'Chữ thường: xoay 2 lớp cùng lúc (mặt đó và lớp giữa kề nó).',
  },
  { move: 'M, E, S', meaning: 'Lớp giữa: M cùng chiều L, E cùng chiều D, S cùng chiều F.' },
  { move: 'x, y, z', meaning: 'Xoay cả khối: x theo chiều R, y theo chiều U, z theo chiều F.' },
  {
    move: '( ) và [ ]',
    meaning: 'Ngoặc chỉ để chia nhóm cho dễ nhớ. [U] ở cuối là xoay U để căn chỉnh (AUF).',
  },
];

/** Moves shown as pictures: the state right after doing the move on a solved cube. */
export const NOTATION_IMAGES: Array<string> = [
  'R',
  "R'",
  'U',
  "U'",
  'F',
  "F'",
  'L',
  'D',
  'R2',
  'r',
  'M',
  'y',
];

type GuideStep = {
  title: string;
  goal: string;
  images?: Array<CubeImage>;
  tips: Array<string>;
  algs?: Array<AlgType>;
};

// Doing the white cross puts the white edges on the bottom; F2 R2 B2 L2 lifts them
// back up around the yellow centre, which is exactly the "daisy".
const DAISY = 'F2 R2 B2 L2';

export const BEGINNER_STEPS: Array<GuideStep> = [
  {
    title: 'Bước 1: Dấu cộng trắng',
    goal: 'Ghép 4 cạnh trắng quanh tâm trắng. Màu còn lại của mỗi cạnh phải trùng với tâm bên cạnh.',
    images: [
      {
        kind: 'iso',
        setup: DAISY,
        mask: 'cross',
        caption: 'Bông hoa (daisy): cạnh trắng quanh tâm vàng',
      },
      {
        kind: 'iso',
        view: 'z2',
        mask: 'cross',
        caption: 'Mục tiêu: dấu cộng trắng, cạnh khớp tâm',
      },
    ],
    tips: [
      'Cách dễ nhất cho người mới là "bông hoa" (daisy): giữ tâm vàng ở trên, đưa 4 cạnh trắng lên quanh tâm vàng như 4 cánh hoa, mặt trắng hướng lên.',
      'Xoay U cho đến khi màu bên của một cánh hoa trùng với tâm ngay dưới nó (ví dụ cánh trắng-xanh lá nằm trên tâm xanh lá).',
      'Xoay mặt đó 180° (F2, R2...). Cạnh trắng sẽ đi xuống đáy, đúng chỗ. Làm lần lượt với cả 4 cánh.',
      'Lật khối để mặt trắng xuống dưới (mặt vàng ở trên). Giữ nguyên cách cầm này cho mọi bước sau.',
    ],
  },
  {
    title: 'Bước 2: Bốn góc trắng (xong tầng 1)',
    goal: 'Đặt 4 góc có màu trắng vào đúng chỗ, hoàn thành tầng thứ nhất.',
    images: [
      {
        kind: 'iso',
        view: 'z2',
        mask: 'firstLayer',
        caption: 'Mục tiêu: tầng 1 hoàn chỉnh (nhìn mặt trắng)',
      },
    ],
    tips: [
      'Tìm một góc có màu trắng ở tầng trên. Đọc 2 màu còn lại của nó (ví dụ xanh lá và cam).',
      'Xoay U để góc đó nằm ngay phía trên chỗ của nó: chỗ nằm giữa 2 tâm cùng màu. Cầm khối sao cho chỗ đó ở góc trước-phải-dưới.',
      "Lặp lại R U R' U' cho đến khi góc vào đúng và mặt trắng hướng xuống (1, 3 hoặc 5 lần).",
      "Góc trắng bị kẹt sai chỗ ở tầng dưới: đặt nó ở trước-phải, làm R U R' U' một lần để đưa nó lên rồi làm lại như trên.",
    ],
    algs: [{ name: 'Sexy move (lặp lại đến khi góc vào)', alg: "R U R' U'" }],
  },
  {
    title: 'Bước 3: Tầng giữa',
    goal: 'Đặt 4 cạnh tầng giữa (các cạnh không có màu vàng).',
    images: [
      { kind: 'iso', alg: "U R U' R' U' F' U F", mask: 'f2l', caption: 'Cạnh cần đưa sang phải' },
      { kind: 'iso', alg: "U' L' U L U F U' F'", mask: 'f2l', caption: 'Cạnh cần đưa sang trái' },
      { kind: 'iso', mask: 'f2l', caption: 'Mục tiêu: 2 tầng đầu hoàn chỉnh' },
    ],
    tips: [
      'Tìm cạnh ở tầng trên không có màu vàng. Xoay U để màu mặt trước của cạnh trùng với tâm trước, tạo thành chữ T ngược.',
      'Nhìn màu trên đỉnh của cạnh đó: nếu trùng tâm bên phải thì dùng công thức "sang phải", trùng tâm trái thì dùng "sang trái".',
      'Nếu cạnh đã nằm ở tầng giữa nhưng sai chỗ hoặc bị lật: đặt nó ở trước-phải, làm công thức "sang phải" một lần để đẩy nó lên, rồi làm lại.',
    ],
    algs: [
      { name: 'Sang phải', alg: "U R U' R' U' F' U F" },
      { name: 'Sang trái', alg: "U' L' U L U F U' F'" },
    ],
  },
  {
    title: 'Bước 4: Dấu cộng vàng',
    goal: 'Làm 4 cạnh vàng hướng lên trên. Chưa cần quan tâm đến góc.',
    images: [
      { kind: 'top', alg: "F R U R' U' F' f R U R' U' f'", mask: 'eo', caption: 'Chấm' },
      { kind: 'top', alg: "F U R U' R' F'", mask: 'eo', caption: 'Chữ L (đặt ở trên-trái)' },
      { kind: 'top', alg: "F R U R' U' F'", mask: 'eo', caption: 'Đường thẳng (nằm ngang)' },
      { kind: 'top', mask: 'eo', caption: 'Mục tiêu: dấu cộng vàng' },
    ],
    tips: [
      'Nhìn mặt vàng (bỏ qua các góc). Bạn sẽ thấy 1 trong 3 hình: chấm, chữ L, hoặc đường thẳng.',
      'Đường thẳng: xoay U cho nằm ngang rồi dùng công thức 1.',
      'Chữ L: xoay U để 2 cạnh vàng ở phía sau và bên trái (giống hình), dùng công thức 2.',
      'Chấm: dùng công thức 1 một lần, sẽ ra chữ L hoặc đường thẳng, rồi làm tiếp như trên.',
    ],
    algs: [
      { name: '1. Đường thẳng (và chấm)', alg: "F R U R' U' F'" },
      { name: '2. Chữ L', alg: "F U R U' R' F'" },
    ],
  },
  {
    title: 'Bước 5: Khớp màu cạnh vàng',
    goal: 'Đổi chỗ các cạnh vàng sao cho màu bên của chúng trùng với tâm.',
    images: [
      {
        kind: 'top',
        alg: "R U' R U R U R U' R' U' R2",
        mask: 'llEdges',
        arrows: true,
        caption: 'Ba cạnh xoay vòng theo mũi tên',
      },
    ],
    tips: [
      'Xoay U và đếm có bao nhiêu cạnh khớp tâm. Luôn có cách xoay để ít nhất 1 cạnh khớp.',
      'Nếu đúng 1 cạnh khớp: để cạnh đó ở phía sau, làm công thức. 3 cạnh còn lại xoay vòng; làm lại lần 2 nếu vòng sai chiều.',
      'Nếu 2 cạnh khớp nằm đối diện hoặc kề nhau: làm công thức một lần ở góc bất kỳ, sẽ ra trường hợp chỉ có 1 cạnh khớp.',
    ],
    algs: [{ name: 'Xoay vòng 3 cạnh (Ua)', alg: "R U' R U R U R U' R' U' R2" }],
  },
  {
    title: 'Bước 6: Đặt góc vàng đúng chỗ',
    goal: 'Đưa 4 góc vàng về đúng vị trí. Góc có thể đang bị xoay sai chiều, chưa sao.',
    images: [
      {
        kind: 'top',
        alg: "U R U' L' U R' U' L",
        mask: 'llCorners',
        arrows: true,
        caption: 'Góc trước-phải đúng chỗ, 3 góc còn lại xoay vòng',
      },
    ],
    tips: [
      'Góc "đúng chỗ" là góc có 3 màu trùng với 3 tâm xung quanh nó, dù nó đang xoay hướng nào.',
      'Tìm một góc đúng chỗ, cầm sao cho nó ở trước-phải-trên. Làm công thức (1 hoặc 2 lần) đến khi cả 4 góc đúng chỗ.',
      'Không có góc nào đúng chỗ: làm công thức một lần ở bất kỳ đâu, sẽ có 1 góc đúng.',
    ],
    algs: [{ name: 'Xoay vòng 3 góc', alg: "U R U' L' U R' U' L" }],
  },
  {
    title: 'Bước 7: Xoay góc vàng, hoàn thành',
    goal: 'Xoay từng góc cho mặt vàng hướng lên.',
    images: [
      {
        kind: 'iso',
        alg: "R' D' R D R' D' R D U R' D' R D R' D' R D R' D' R D R' D' R D U'",
        mask: 'none',
        caption: 'Hai góc cần xoay',
      },
      { kind: 'iso', caption: 'Hoàn thành!' },
    ],
    tips: [
      'Lật khối: mặt vàng vẫn ở trên. Đặt một góc chưa đúng chiều ở trước-phải-trên.',
      "Lặp lại R' D' R D (2 hoặc 4 lần) cho đến khi mặt vàng của góc đó hướng lên.",
      'QUAN TRỌNG: không xoay cả khối. Chỉ xoay U để đưa góc kế tiếp vào trước-phải-trên. Phần dưới sẽ trông như bị phá, đừng hoảng, nó sẽ tự hồi lại khi xong góc cuối.',
      'Xong cả 4 góc: xoay U lần cuối để hoàn thành khối.',
    ],
    algs: [{ name: 'Xoay góc (lặp lại)', alg: "R' D' R D" }],
  },
];

/** Basic F2L insertions (pair already built or about to be). */
export const F2L_BASIC: Array<AlgType> = [
  {
    name: 'Cặp đã ghép ở bên phải (góc trắng nhìn ra trước)',
    alg: "U R U' R'",
    image: { kind: 'iso', alg: "U R U' R'", mask: 'f2l' },
  },
  {
    name: 'Góc trắng nhìn sang phải, cạnh ở phía sau: chèn thẳng',
    alg: "R U R'",
    image: { kind: 'iso', alg: "R U R'", mask: 'f2l' },
  },
  {
    name: 'Cặp đã ghép ở bên trái, chèn vào khe trái',
    alg: "U' L' U L",
    image: { kind: 'iso', alg: "U' L' U L", mask: 'f2l' },
  },
  {
    name: 'Góc trắng nhìn ra trước, cạnh ở bên trái',
    alg: "F' U' F",
    image: { kind: 'iso', alg: "F' U' F", mask: 'f2l' },
  },
];

export const OLL_EDGES_2LOOK: Array<AlgType> = [
  {
    name: 'Chấm',
    alg: "F R U R' U' F' f R U R' U' f'",
    image: { kind: 'top', alg: "F R U R' U' F' f R U R' U' f'", mask: 'eo' },
  },
  {
    name: 'Chữ L',
    alg: "f R U R' U' f'",
    image: { kind: 'top', alg: "f R U R' U' f'", mask: 'eo' },
  },
  {
    name: 'Đường thẳng',
    alg: "F R U R' U' F'",
    image: { kind: 'top', alg: "F R U R' U' F'", mask: 'eo' },
  },
];

/** OCLL: the 7 corner-orientation cases of 2-look OLL, numbered like full OLL. */
export const OLL_CORNERS_2LOOK: Array<{ id: string; name: string; note: string }> = [
  { id: '27', name: 'Sune', note: '1 góc vàng hướng lên. Đặt nó ở trước-trái.' },
  {
    id: '26',
    name: 'Anti-Sune',
    note: '1 góc vàng hướng lên, mặt vàng các góc khác xoay ngược Sune.',
  },
  { id: '21', name: 'H', note: 'Không góc nào hướng lên, 2 cặp vàng ở hai bên đối diện.' },
  { id: '22', name: 'Pi', note: 'Không góc nào hướng lên, một bên có 2 vàng (đèn pha).' },
  {
    id: '23',
    name: 'Headlights (U)',
    note: '2 góc vàng kề nhau, 2 vàng của góc kia cùng nhìn về 1 phía.',
  },
  {
    id: '24',
    name: 'T (Chameleon)',
    note: '2 góc vàng kề nhau, vàng của 2 góc kia nhìn ra 2 bên.',
  },
  { id: '25', name: 'Bowtie (L)', note: '2 góc vàng nằm chéo nhau.' },
];

export const PLL_2LOOK: Array<{ id: string; note: string }> = [
  {
    id: 'Aa',
    note: 'Góc: có 1 cặp "đèn pha" (2 góc cùng màu trên một mặt). Đặt đèn pha ở phía sau.',
  },
  {
    id: 'Ab',
    note: 'Góc: chiều ngược Aa. Dùng 1 trong 2 công thức A là đủ, nếu sai chiều thì làm lại.',
  },
  { id: 'Y', note: 'Góc: không có đèn pha nào. Làm ở góc bất kỳ, 2 góc chéo đổi chỗ.' },
  { id: 'Ua', note: 'Cạnh: 1 mặt đã xong, 3 cạnh xoay vòng. Mặt xong để ở phía sau.' },
  { id: 'Ub', note: 'Cạnh: như Ua nhưng ngược chiều.' },
  { id: 'H', note: 'Cạnh: 2 cặp cạnh đối diện đổi chỗ.' },
  { id: 'Z', note: 'Cạnh: 2 cặp cạnh kề nhau đổi chỗ.' },
];

export const OLL_GROUP_LABELS: Record<string, string> = {
  ocll: 'Cạnh đã đúng (OCLL), học đầu tiên',
  t: 'Hình chữ T',
  square: 'Hình vuông',
  c: 'Hình chữ C',
  w: 'Hình chữ W',
  cornersOk: 'Góc đúng, cạnh lật',
  p: 'Hình chữ P',
  i: 'Hình chữ I',
  fish: 'Hình con cá',
  knight: 'Hình quân mã',
  awkward: 'Hình khó (Awkward)',
  l: 'Hình chữ L',
  bolt: 'Hình tia sét',
  dot: 'Chấm (không cạnh nào đúng)',
};

export const PLL_GROUP_LABELS: Record<string, string> = {
  edges: 'Chỉ đổi cạnh',
  corners: 'Chỉ đổi góc',
  g: 'Hoán vị G (hai vòng)',
  adjacent: 'Đổi 2 góc kề nhau',
  diagonal: 'Đổi 2 góc chéo nhau',
};

export const PLL_LEARNING_ORDER = [
  'T',
  'Jb',
  'Ja',
  'Y',
  'Ra',
  'Rb',
  'F',
  'V',
  'Ga',
  'Gb',
  'Gc',
  'Gd',
  'Na',
  'Nb',
  'E',
];
