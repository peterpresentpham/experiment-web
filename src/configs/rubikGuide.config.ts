/* eslint-disable quotes */
import { defineMessages } from 'src/i18n/define';
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

export type GuideStep = {
  title: string;
  goal: string;
  images?: Array<CubeImage>;
  tips: Array<string>;
  algs?: Array<AlgType>;
};

// Doing the white cross puts the white edges on the bottom; F2 R2 B2 L2 lifts them
// back up around the yellow centre, which is exactly the "daisy".
const DAISY = 'F2 R2 B2 L2';

/**
 * Language-independent part of the beginner steps: pictures and algorithms. The text of each
 * step (title, goal, captions, tips, algorithm names) comes from `GUIDE_TEXT`, in the same order.
 */
const BEGINNER_SHAPE: Array<{ images?: Array<Omit<CubeImage, 'caption'>>; algs?: Array<string> }> =
  [
    {
      images: [
        { kind: 'iso', setup: DAISY, mask: 'cross' },
        { kind: 'iso', view: 'z2', mask: 'cross' },
      ],
    },
    { images: [{ kind: 'iso', view: 'z2', mask: 'firstLayer' }], algs: ["R U R' U'"] },
    {
      images: [
        { kind: 'iso', alg: "U R U' R' U' F' U F", mask: 'f2l' },
        { kind: 'iso', alg: "U' L' U L U F U' F'", mask: 'f2l' },
        { kind: 'iso', mask: 'f2l' },
      ],
      algs: ["U R U' R' U' F' U F", "U' L' U L U F U' F'"],
    },
    {
      images: [
        { kind: 'top', alg: "F R U R' U' F' f R U R' U' f'", mask: 'eo' },
        { kind: 'top', alg: "F U R U' R' F'", mask: 'eo' },
        { kind: 'top', alg: "F R U R' U' F'", mask: 'eo' },
        { kind: 'top', mask: 'eo' },
      ],
      algs: ["F R U R' U' F'", "F U R U' R' F'"],
    },
    {
      images: [{ kind: 'top', alg: "R U' R U R U R U' R' U' R2", mask: 'llEdges', arrows: true }],
      algs: ["R U' R U R U R U' R' U' R2"],
    },
    {
      images: [{ kind: 'top', alg: "U R U' L' U R' U' L", mask: 'llCorners', arrows: true }],
      algs: ["U R U' L' U R' U' L"],
    },
    {
      images: [
        {
          kind: 'iso',
          alg: "R' D' R D R' D' R D U R' D' R D R' D' R D R' D' R D R' D' R D U'",
          mask: 'none',
        },
        { kind: 'iso' },
      ],
      algs: ["R' D' R D"],
    },
  ];

const F2L_BASIC_ALGS = ["U R U' R'", "R U R'", "U' L' U L", "F' U' F"];

const OLL_EDGES_ALGS = ["F R U R' U' F' f R U R' U' f'", "f R U R' U' f'", "F R U R' U' F'"];

/** OCLL: the 7 corner-orientation cases of 2-look OLL, numbered like full OLL. */
const OLL_CORNER_CASES = [
  { id: '27', name: 'Sune' },
  { id: '26', name: 'Anti-Sune' },
  { id: '21', name: 'H' },
  { id: '22', name: 'Pi' },
  { id: '23', name: 'Headlights (U)' },
  { id: '24', name: 'T (Chameleon)' },
  { id: '25', name: 'Bowtie (L)' },
];

const PLL_2LOOK_IDS = ['Aa', 'Ab', 'Y', 'Ua', 'Ub', 'H', 'Z'];

type TStepText = {
  title: string;
  goal: string;
  captions: Array<string>;
  tips: Array<string>;
  algNames: Array<string>;
};

type TGuideText = {
  colorScheme: Array<{ color: string; opposite: string }>;
  notation: Array<{ move: string; meaning: string }>;
  steps: Array<TStepText>;
  f2lBasic: Array<string>;
  ollEdges: Array<string>;
  ollCornerNotes: Array<string>;
  pllNotes: Array<string>;
  ollGroups: Record<string, string>;
  pllGroups: Record<string, string>;
};

const GUIDE_TEXT = defineMessages<TGuideText>({
  en: {
    colorScheme: [
      { color: 'White', opposite: 'Yellow' },
      { color: 'Green', opposite: 'Blue' },
      { color: 'Red', opposite: 'Orange' },
    ],
    notation: [
      {
        move: 'R',
        meaning:
          'Right face, turned 90° clockwise as seen when looking straight at the right face.',
      },
      { move: "R'", meaning: 'The apostrophe (read "prime") means counterclockwise.' },
      { move: 'R2', meaning: 'A 180° turn (either direction).' },
      {
        move: 'L',
        meaning:
          'Left face. Clockwise as seen from the left side, so L turns the opposite way to R.',
      },
      { move: 'U / D', meaning: 'Up face / Down face.' },
      { move: 'F / B', meaning: 'Front face / Back face.' },
      {
        move: 'r, u, f... (or Rw)',
        meaning: 'Lowercase: turn two layers at once (the face and the middle layer next to it).',
      },
      {
        move: 'M, E, S',
        meaning: 'Middle layers: M turns like L, E like D, S like F.',
      },
      {
        move: 'x, y, z',
        meaning: 'Rotate the whole cube: x like R, y like U, z like F.',
      },
      {
        move: '( ) and [ ]',
        meaning:
          'Brackets only group moves to make them easier to remember. A final [U] is an alignment turn (AUF).',
      },
    ],
    steps: [
      {
        title: 'Step 1: White cross',
        goal: 'Place the 4 white edges around the white centre. The other colour of each edge must match the centre next to it.',
        captions: [
          'Daisy: white edges around the yellow centre',
          'Goal: white cross, edges match centres',
        ],
        tips: [
          'The easiest way for beginners is the "daisy": hold the yellow centre on top and bring the 4 white edges up around it like 4 petals, white facing up.',
          'Turn U until the side colour of a petal matches the centre right below it (for example the white-green petal above the green centre).',
          'Turn that face 180° (F2, R2...). The white edge drops to the bottom, in the right place. Repeat for all 4 petals.',
          'Flip the cube so white is on the bottom (yellow on top). Keep holding it this way for every later step.',
        ],
        algNames: [],
      },
      {
        title: 'Step 2: Four white corners (first layer done)',
        goal: 'Put the 4 corners that have white into place, finishing the first layer.',
        captions: ['Goal: complete first layer (white face shown)'],
        tips: [
          'Find a corner with white in the top layer. Read its other 2 colours (for example green and orange).',
          'Turn U so that corner sits right above its spot: the spot between the 2 centres of those colours. Hold the cube so that spot is at front-right-bottom.',
          "Repeat R U R' U' until the corner drops in with white facing down (1, 3 or 5 times).",
          "A white corner stuck in the wrong place in the bottom layer: put it at front-right, do R U R' U' once to bring it up, then continue as above.",
        ],
        algNames: ['Sexy move (repeat until the corner is in)'],
      },
      {
        title: 'Step 3: Middle layer',
        goal: 'Place the 4 middle-layer edges (the edges without yellow).',
        captions: [
          'Edge going to the right',
          'Edge going to the left',
          'Goal: first two layers done',
        ],
        tips: [
          'Find an edge in the top layer without yellow. Turn U so its front colour matches the front centre, forming an upside-down T.',
          'Look at the top colour of that edge: if it matches the right centre, use the "to the right" algorithm; if it matches the left centre, use "to the left".',
          'If the edge is already in the middle layer but in the wrong place or flipped: put it at front-right, do the "to the right" algorithm once to push it out, then try again.',
        ],
        algNames: ['To the right', 'To the left'],
      },
      {
        title: 'Step 4: Yellow cross',
        goal: 'Turn the 4 yellow edges to face up. Ignore the corners for now.',
        captions: [
          'Dot',
          'L shape (placed at back-left)',
          'Line (horizontal)',
          'Goal: yellow cross',
        ],
        tips: [
          'Look at the yellow face (ignore the corners). You will see 1 of 3 shapes: a dot, an L shape or a line.',
          'Line: turn U so it is horizontal, then use algorithm 1.',
          'L shape: turn U so the 2 yellow edges are at the back and on the left (like the picture), then use algorithm 2.',
          'Dot: use algorithm 1 once to get an L or a line, then continue as above.',
        ],
        algNames: ['1. Line (and dot)', '2. L shape'],
      },
      {
        title: 'Step 5: Match the yellow edges',
        goal: 'Swap the yellow edges so their side colours match the centres.',
        captions: ['Three edges cycle along the arrows'],
        tips: [
          'Turn U and count how many edges match their centres. You can always turn it so at least 1 edge matches.',
          'Exactly 1 edge matches: hold that edge at the back and do the algorithm. The other 3 cycle; do it a second time if they cycled the wrong way.',
          'Two matching edges, opposite or next to each other: do the algorithm once from any side to get the case with only 1 matching edge.',
        ],
        algNames: ['Cycle 3 edges (Ua)'],
      },
      {
        title: 'Step 6: Place the yellow corners',
        goal: 'Move the 4 yellow corners to their correct spots. They may still be twisted; that is fine.',
        captions: ['Front-right corner in place, the other 3 cycle'],
        tips: [
          'A corner is "in place" when its 3 colours match the 3 centres around it, whichever way it is twisted.',
          'Find a corner in place and hold it at front-right-top. Do the algorithm (once or twice) until all 4 corners are in place.',
          'No corner in place: do the algorithm once from anywhere and 1 corner will be in place.',
        ],
        algNames: ['Cycle 3 corners'],
      },
      {
        title: 'Step 7: Twist the yellow corners, done',
        goal: 'Twist each corner until its yellow faces up.',
        captions: ['Two corners to twist', 'Solved!'],
        tips: [
          'Keep yellow on top. Put an unsolved corner at front-right-top.',
          "Repeat R' D' R D (2 or 4 times) until that corner's yellow faces up.",
          'IMPORTANT: do not rotate the whole cube. Only turn U to bring the next corner to front-right-top. The bottom will look scrambled; do not panic, it comes back once the last corner is done.',
          'All 4 corners done: one last U turn solves the cube.',
        ],
        algNames: ['Corner twist (repeat)'],
      },
    ],
    f2lBasic: [
      'Pair already built on the right (white facing front)',
      'White facing right, edge at the back: insert directly',
      'Pair already built on the left, insert into the left slot',
      'White facing front, edge on the left',
    ],
    ollEdges: ['Dot', 'L shape', 'Line'],
    ollCornerNotes: [
      '1 yellow corner faces up. Put it at front-left.',
      '1 yellow corner faces up; the other yellows twist the opposite way to Sune.',
      'No corner faces up, 2 yellow pairs on opposite sides.',
      'No corner faces up, one side has 2 yellows (headlights).',
      '2 adjacent yellow corners face up; the other 2 corners both show yellow on the same side.',
      '2 adjacent yellow corners face up; the yellows of the other 2 face out to the sides.',
      '2 yellow corners face up, diagonal from each other.',
    ],
    pllNotes: [
      'Corners: there is one pair of "headlights" (2 corners of the same colour on one side). Put the headlights at the back.',
      'Corners: the opposite direction of Aa. Either A algorithm is enough; if it goes the wrong way, do it again.',
      'Corners: no headlights at all. Do it from any side; 2 diagonal corners swap.',
      'Edges: one side is solved, 3 edges cycle. Put the solved side at the back.',
      'Edges: like Ua but in the other direction.',
      'Edges: 2 pairs of opposite edges swap.',
      'Edges: 2 pairs of adjacent edges swap.',
    ],
    ollGroups: {
      ocll: 'Edges already oriented (OCLL), learn first',
      t: 'T shapes',
      square: 'Squares',
      c: 'C shapes',
      w: 'W shapes',
      cornersOk: 'Corners oriented, edges flipped',
      p: 'P shapes',
      i: 'I shapes',
      fish: 'Fish shapes',
      knight: 'Knight move shapes',
      awkward: 'Awkward shapes',
      l: 'L shapes',
      bolt: 'Lightning bolts',
      dot: 'Dots (no edge oriented)',
    },
    pllGroups: {
      edges: 'Edges only',
      corners: 'Corners only',
      g: 'G perms (two cycles)',
      adjacent: 'Adjacent corner swap',
      diagonal: 'Diagonal corner swap',
    },
  },
  vi: {
    colorScheme: [
      { color: 'Trắng', opposite: 'Vàng' },
      { color: 'Xanh lá', opposite: 'Xanh dương' },
      { color: 'Đỏ', opposite: 'Cam' },
    ],
    notation: [
      {
        move: 'R',
        meaning: 'Mặt phải (Right), xoay 90° theo chiều kim đồng hồ khi nhìn thẳng vào mặt phải.',
      },
      { move: "R'", meaning: 'Dấu nháy (đọc là "prime"): xoay ngược chiều kim đồng hồ.' },
      { move: 'R2', meaning: 'Xoay 180° (chiều nào cũng được).' },
      {
        move: 'L',
        meaning:
          'Mặt trái (Left). Chiều kim đồng hồ khi nhìn từ bên trái, nên L ngược hướng với R.',
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
    ],
    steps: [
      {
        title: 'Bước 1: Dấu cộng trắng',
        goal: 'Ghép 4 cạnh trắng quanh tâm trắng. Màu còn lại của mỗi cạnh phải trùng với tâm bên cạnh.',
        captions: [
          'Bông hoa (daisy): cạnh trắng quanh tâm vàng',
          'Mục tiêu: dấu cộng trắng, cạnh khớp tâm',
        ],
        tips: [
          'Cách dễ nhất cho người mới là "bông hoa" (daisy): giữ tâm vàng ở trên, đưa 4 cạnh trắng lên quanh tâm vàng như 4 cánh hoa, mặt trắng hướng lên.',
          'Xoay U cho đến khi màu bên của một cánh hoa trùng với tâm ngay dưới nó (ví dụ cánh trắng-xanh lá nằm trên tâm xanh lá).',
          'Xoay mặt đó 180° (F2, R2...). Cạnh trắng sẽ đi xuống đáy, đúng chỗ. Làm lần lượt với cả 4 cánh.',
          'Lật khối để mặt trắng xuống dưới (mặt vàng ở trên). Giữ nguyên cách cầm này cho mọi bước sau.',
        ],
        algNames: [],
      },
      {
        title: 'Bước 2: Bốn góc trắng (xong tầng 1)',
        goal: 'Đặt 4 góc có màu trắng vào đúng chỗ, hoàn thành tầng thứ nhất.',
        captions: ['Mục tiêu: tầng 1 hoàn chỉnh (nhìn mặt trắng)'],
        tips: [
          'Tìm một góc có màu trắng ở tầng trên. Đọc 2 màu còn lại của nó (ví dụ xanh lá và cam).',
          'Xoay U để góc đó nằm ngay phía trên chỗ của nó: chỗ nằm giữa 2 tâm cùng màu. Cầm khối sao cho chỗ đó ở góc trước-phải-dưới.',
          "Lặp lại R U R' U' cho đến khi góc vào đúng và mặt trắng hướng xuống (1, 3 hoặc 5 lần).",
          "Góc trắng bị kẹt sai chỗ ở tầng dưới: đặt nó ở trước-phải, làm R U R' U' một lần để đưa nó lên rồi làm lại như trên.",
        ],
        algNames: ['Sexy move (lặp lại đến khi góc vào)'],
      },
      {
        title: 'Bước 3: Tầng giữa',
        goal: 'Đặt 4 cạnh tầng giữa (các cạnh không có màu vàng).',
        captions: [
          'Cạnh cần đưa sang phải',
          'Cạnh cần đưa sang trái',
          'Mục tiêu: 2 tầng đầu hoàn chỉnh',
        ],
        tips: [
          'Tìm cạnh ở tầng trên không có màu vàng. Xoay U để màu mặt trước của cạnh trùng với tâm trước, tạo thành chữ T ngược.',
          'Nhìn màu trên đỉnh của cạnh đó: nếu trùng tâm bên phải thì dùng công thức "sang phải", trùng tâm trái thì dùng "sang trái".',
          'Nếu cạnh đã nằm ở tầng giữa nhưng sai chỗ hoặc bị lật: đặt nó ở trước-phải, làm công thức "sang phải" một lần để đẩy nó lên, rồi làm lại.',
        ],
        algNames: ['Sang phải', 'Sang trái'],
      },
      {
        title: 'Bước 4: Dấu cộng vàng',
        goal: 'Làm 4 cạnh vàng hướng lên trên. Chưa cần quan tâm đến góc.',
        captions: [
          'Chấm',
          'Chữ L (đặt ở trên-trái)',
          'Đường thẳng (nằm ngang)',
          'Mục tiêu: dấu cộng vàng',
        ],
        tips: [
          'Nhìn mặt vàng (bỏ qua các góc). Bạn sẽ thấy 1 trong 3 hình: chấm, chữ L, hoặc đường thẳng.',
          'Đường thẳng: xoay U cho nằm ngang rồi dùng công thức 1.',
          'Chữ L: xoay U để 2 cạnh vàng ở phía sau và bên trái (giống hình), dùng công thức 2.',
          'Chấm: dùng công thức 1 một lần, sẽ ra chữ L hoặc đường thẳng, rồi làm tiếp như trên.',
        ],
        algNames: ['1. Đường thẳng (và chấm)', '2. Chữ L'],
      },
      {
        title: 'Bước 5: Khớp màu cạnh vàng',
        goal: 'Đổi chỗ các cạnh vàng sao cho màu bên của chúng trùng với tâm.',
        captions: ['Ba cạnh xoay vòng theo mũi tên'],
        tips: [
          'Xoay U và đếm có bao nhiêu cạnh khớp tâm. Luôn có cách xoay để ít nhất 1 cạnh khớp.',
          'Nếu đúng 1 cạnh khớp: để cạnh đó ở phía sau, làm công thức. 3 cạnh còn lại xoay vòng; làm lại lần 2 nếu vòng sai chiều.',
          'Nếu 2 cạnh khớp nằm đối diện hoặc kề nhau: làm công thức một lần ở góc bất kỳ, sẽ ra trường hợp chỉ có 1 cạnh khớp.',
        ],
        algNames: ['Xoay vòng 3 cạnh (Ua)'],
      },
      {
        title: 'Bước 6: Đặt góc vàng đúng chỗ',
        goal: 'Đưa 4 góc vàng về đúng vị trí. Góc có thể đang bị xoay sai chiều, chưa sao.',
        captions: ['Góc trước-phải đúng chỗ, 3 góc còn lại xoay vòng'],
        tips: [
          'Góc "đúng chỗ" là góc có 3 màu trùng với 3 tâm xung quanh nó, dù nó đang xoay hướng nào.',
          'Tìm một góc đúng chỗ, cầm sao cho nó ở trước-phải-trên. Làm công thức (1 hoặc 2 lần) đến khi cả 4 góc đúng chỗ.',
          'Không có góc nào đúng chỗ: làm công thức một lần ở bất kỳ đâu, sẽ có 1 góc đúng.',
        ],
        algNames: ['Xoay vòng 3 góc'],
      },
      {
        title: 'Bước 7: Xoay góc vàng, hoàn thành',
        goal: 'Xoay từng góc cho mặt vàng hướng lên.',
        captions: ['Hai góc cần xoay', 'Hoàn thành!'],
        tips: [
          'Lật khối: mặt vàng vẫn ở trên. Đặt một góc chưa đúng chiều ở trước-phải-trên.',
          "Lặp lại R' D' R D (2 hoặc 4 lần) cho đến khi mặt vàng của góc đó hướng lên.",
          'QUAN TRỌNG: không xoay cả khối. Chỉ xoay U để đưa góc kế tiếp vào trước-phải-trên. Phần dưới sẽ trông như bị phá, đừng hoảng, nó sẽ tự hồi lại khi xong góc cuối.',
          'Xong cả 4 góc: xoay U lần cuối để hoàn thành khối.',
        ],
        algNames: ['Xoay góc (lặp lại)'],
      },
    ],
    f2lBasic: [
      'Cặp đã ghép ở bên phải (góc trắng nhìn ra trước)',
      'Góc trắng nhìn sang phải, cạnh ở phía sau: chèn thẳng',
      'Cặp đã ghép ở bên trái, chèn vào khe trái',
      'Góc trắng nhìn ra trước, cạnh ở bên trái',
    ],
    ollEdges: ['Chấm', 'Chữ L', 'Đường thẳng'],
    ollCornerNotes: [
      '1 góc vàng hướng lên. Đặt nó ở trước-trái.',
      '1 góc vàng hướng lên, mặt vàng các góc khác xoay ngược Sune.',
      'Không góc nào hướng lên, 2 cặp vàng ở hai bên đối diện.',
      'Không góc nào hướng lên, một bên có 2 vàng (đèn pha).',
      '2 góc vàng kề nhau, 2 vàng của góc kia cùng nhìn về 1 phía.',
      '2 góc vàng kề nhau, vàng của 2 góc kia nhìn ra 2 bên.',
      '2 góc vàng nằm chéo nhau.',
    ],
    pllNotes: [
      'Góc: có 1 cặp "đèn pha" (2 góc cùng màu trên một mặt). Đặt đèn pha ở phía sau.',
      'Góc: chiều ngược Aa. Dùng 1 trong 2 công thức A là đủ, nếu sai chiều thì làm lại.',
      'Góc: không có đèn pha nào. Làm ở góc bất kỳ, 2 góc chéo đổi chỗ.',
      'Cạnh: 1 mặt đã xong, 3 cạnh xoay vòng. Mặt xong để ở phía sau.',
      'Cạnh: như Ua nhưng ngược chiều.',
      'Cạnh: 2 cặp cạnh đối diện đổi chỗ.',
      'Cạnh: 2 cặp cạnh kề nhau đổi chỗ.',
    ],
    ollGroups: {
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
    },
    pllGroups: {
      edges: 'Chỉ đổi cạnh',
      corners: 'Chỉ đổi góc',
      g: 'Hoán vị G (hai vòng)',
      adjacent: 'Đổi 2 góc kề nhau',
      diagonal: 'Đổi 2 góc chéo nhau',
    },
  },
});

function buildGuide(text: TGuideText) {
  const beginnerSteps: Array<GuideStep> = BEGINNER_SHAPE.map((shape, index) => {
    const step = text.steps[index];
    return {
      title: step.title,
      goal: step.goal,
      tips: step.tips,
      images: shape.images?.map((image, i) => ({ ...image, caption: step.captions[i] })),
      algs: shape.algs?.map((alg, i) => ({ name: step.algNames[i], alg })),
    };
  });
  const f2lBasic: Array<AlgType> = F2L_BASIC_ALGS.map((alg, i) => ({
    name: text.f2lBasic[i],
    alg,
    image: { kind: 'iso', alg, mask: 'f2l' },
  }));
  const ollEdges2Look: Array<AlgType> = OLL_EDGES_ALGS.map((alg, i) => ({
    name: text.ollEdges[i],
    alg,
    image: { kind: 'top', alg, mask: 'eo' },
  }));
  const ollCorners2Look = OLL_CORNER_CASES.map((item, i) => ({
    ...item,
    note: text.ollCornerNotes[i],
  }));
  const pll2Look = PLL_2LOOK_IDS.map((id, i) => ({ id, note: text.pllNotes[i] }));

  return {
    colorScheme: text.colorScheme,
    notation: text.notation,
    beginnerSteps,
    f2lBasic,
    ollEdges2Look,
    ollCorners2Look,
    pll2Look,
    ollGroupLabels: text.ollGroups,
    pllGroupLabels: text.pllGroups,
  };
}

/** The whole guide in each language; pictures and algorithms are shared. */
export const RUBIK_GUIDE = {
  en: buildGuide(GUIDE_TEXT.en),
  vi: buildGuide(GUIDE_TEXT.vi),
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
