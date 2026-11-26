import type { TLocalized } from 'src/i18n/define';
import type { MaskName } from 'src/lib/cube/render';

/** Where an algorithm was found. `derived` marks ones worked out here and checked in simulation. */
export type TAlgSource =
  | 'cubeskills'
  | 'ruwix'
  | 'wikibooks'
  | 'twistyGuide'
  | 'gan'
  | 'jperm'
  | 'speedsolving'
  | 'derived';

export const ALG_SOURCES: Record<Exclude<TAlgSource, 'derived'>, { name: string; url: string }> = {
  cubeskills: { name: 'CubeSkills', url: 'https://www.cubeskills.com/tutorials' },
  ruwix: {
    name: 'Ruwix',
    url: 'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/',
  },
  wikibooks: {
    name: 'Wikibooks',
    url: 'https://en.wikibooks.org/wiki/How_to_solve_the_Rubik%27s_Cube/Beginner',
  },
  twistyGuide: {
    name: 'Twisty Guide',
    url: 'https://mrlhumphreys.github.io/twisty_guide_j/guides/3x3x3-beginners',
  },
  gan: {
    name: 'GAN Cube',
    url: 'https://www.gancube.com/pages/how-to-solve-3x3-cube-for-beginners',
  },
  jperm: { name: 'J Perm', url: 'https://jperm.net/3x3' },
  speedsolving: {
    name: 'Speedsolving Wiki',
    url: 'https://www.speedsolving.com/wiki/index.php?title=PLL',
  },
};

/**
 * One way to solve a case, as a source writes it.
 * - `grip`: whole-cube rotation from this page's grip (white bottom, green front) to the grip
 *   the source uses; `z2` means white on top. The picture is drawn in the source's grip.
 * - `noImage`: the algorithm is a building block repeated inside a step, not a whole case, so a
 *   picture of it alone would be misleading.
 */
export type TAlgOption = {
  alg: string;
  source: TAlgSource;
  grip?: 'z2';
  noImage?: boolean;
  note?: TLocalized<string>;
};

/** Pictures for a group of options: which part of the cube is coloured. */
export type TOptionGroup = {
  kind: 'iso' | 'top';
  mask: MaskName;
  arrows?: boolean;
  options: Array<TAlgOption>;
};

const WHITE_TOP: TLocalized<string> = {
  en: 'Held with white on top.',
  vi: 'Cầm trắng ở trên.',
};
const withGrip = (note: TLocalized<string>): TLocalized<string> => ({
  en: `${WHITE_TOP.en} ${note.en}`,
  vi: `${WHITE_TOP.vi} ${note.vi}`,
});

/**
 * Every option found for each beginner (LBL) step, in step order. The main algorithms of each
 * step are shown above these; these are the alternatives to choose from.
 */
export const BEGINNER_OPTIONS: Array<TOptionGroup> = [
  // Step 1: white cross.
  {
    kind: 'iso',
    mask: 'cross',
    options: [
      {
        alg: "F' U' R U",
        source: 'ruwix',
        grip: 'z2',
        note: withGrip({
          en: "White edge on the front face, middle row, with white facing out. Ruwix: F2 then F U' R U, shortened to this.",
          vi: "Cạnh trắng ở hàng giữa mặt trước, trắng nhìn ra ngoài. Ruwix: F2 rồi F U' R U, rút gọn thành công thức này.",
        }),
      },
      {
        alg: "F U' R U",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'White edge in the top layer but upside down (white facing out). Put it at the front first.',
          vi: 'Cạnh trắng ở tầng trên nhưng bị ngược (trắng nhìn ra ngoài). Đưa nó ra phía trước trước.',
        }),
      },
      {
        alg: "R F' R'",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'White edge in the bottom layer with its other colour facing down. Turn D so it sits at the right first.',
          vi: 'Cạnh trắng ở tầng dưới, màu còn lại nhìn xuống. Xoay D để nó nằm ở bên phải trước.',
        }),
      },
      {
        alg: 'F2',
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'White edge in the bottom layer with white facing down. Turn D until it is under its spot, then F2.',
          vi: 'Cạnh trắng ở tầng dưới, trắng nhìn xuống. Xoay D đến khi nó nằm dưới chỗ của nó, rồi F2.',
        }),
      },
      {
        alg: 'F R2 D2',
        source: 'ruwix',
        note: {
          en: 'CFOP example with the cross on the bottom: one sequence that places several edges at once. It only fits this exact position; the point is to plan edges together.',
          vi: 'Ví dụ CFOP, dấu cộng ở đáy: một chuỗi nước đặt nhiều cạnh cùng lúc. Chỉ đúng với đúng vị trí này; ý chính là tính các cạnh cùng nhau.',
        },
      },
    ],
  },
  // Step 2: white corners.
  {
    kind: 'iso',
    mask: 'firstLayer',
    options: [
      {
        alg: "(R' D' R D)×1",
        source: 'ruwix',
        grip: 'z2',
        note: withGrip({
          en: 'Corner below its spot (front-right-bottom), white facing right: once.',
          vi: 'Góc nằm dưới chỗ của nó (trước-phải-dưới), trắng nhìn sang phải: 1 lần.',
        }),
      },
      {
        alg: "(R' D' R D)×3",
        source: 'ruwix',
        grip: 'z2',
        note: withGrip({ en: 'White facing down: 3 times.', vi: 'Trắng nhìn xuống: 3 lần.' }),
      },
      {
        alg: "(R' D' R D)×5",
        source: 'ruwix',
        grip: 'z2',
        note: withGrip({ en: 'White facing front: 5 times.', vi: 'Trắng nhìn ra trước: 5 lần.' }),
      },
      {
        alg: "R2 D' R2 D R2",
        source: 'ruwix',
        grip: 'z2',
        note: withGrip({
          en: 'Ruwix describes this 5-move shortcut in words. It also moves middle-layer edges, which is fine at this step.',
          vi: 'Ruwix mô tả lối tắt 5 nước này bằng lời. Nó cũng xê dịch cạnh tầng giữa, ở bước này không sao.',
        }),
      },
      {
        alg: "R' D' R",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'Corner in the bottom layer, white facing right.',
          vi: 'Góc ở tầng dưới, trắng nhìn sang phải.',
        }),
      },
      {
        alg: "F D F'",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'Corner in the bottom layer, white facing front.',
          vi: 'Góc ở tầng dưới, trắng nhìn ra trước.',
        }),
      },
      {
        alg: "R' D2 R D R' D' R",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'Corner in the bottom layer, white facing down.',
          vi: 'Góc ở tầng dưới, trắng nhìn xuống.',
        }),
      },
      {
        alg: "F D2 F' D' F D F'",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'Same case as the previous one, done with the front face.',
          vi: 'Cùng ca với công thức trước, làm bằng mặt trước.',
        }),
      },
      {
        alg: "R' D' R D R' D' R",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'Corner already in its spot but twisted, white facing right.',
          vi: 'Góc đã đúng chỗ nhưng bị xoay, trắng nhìn sang phải.',
        }),
      },
      {
        alg: "F D F' D' F D F'",
        source: 'wikibooks',
        grip: 'z2',
        note: withGrip({
          en: 'Corner already in its spot but twisted, white facing front.',
          vi: 'Góc đã đúng chỗ nhưng bị xoay, trắng nhìn ra trước.',
        }),
      },
      {
        alg: "R U R'",
        source: 'twistyGuide',
        note: {
          en: 'White bottom. White facing right.',
          vi: 'Trắng ở dưới. Trắng nhìn sang phải.',
        },
      },
      {
        alg: "F' U' F",
        source: 'twistyGuide',
        note: { en: 'White bottom. White facing front.', vi: 'Trắng ở dưới. Trắng nhìn ra trước.' },
      },
      {
        alg: "R U' R' U2 R U R'",
        source: 'twistyGuide',
        note: { en: 'White bottom. White facing up.', vi: 'Trắng ở dưới. Trắng nhìn lên.' },
      },
      {
        alg: "U R U' R'",
        source: 'gan',
        note: {
          en: 'White bottom. "Right hand algorithm".',
          vi: 'Trắng ở dưới. "Công thức tay phải".',
        },
      },
      {
        alg: "U' L' U L",
        source: 'gan',
        note: {
          en: 'White bottom. "Left hand algorithm", for the front-left slot.',
          vi: 'Trắng ở dưới. "Công thức tay trái", cho khe trước-trái.',
        },
      },
    ],
  },
  // Step 3: middle layer.
  {
    kind: 'iso',
    mask: 'f2l',
    options: [
      {
        alg: "(U R U' R' U' F' U F)×2",
        source: 'ruwix',
        note: {
          en: 'Edge in its slot but flipped: do the right algorithm twice (the first time takes it out).',
          vi: 'Cạnh đúng khe nhưng bị lật: làm công thức phải 2 lần (lần đầu đưa nó ra).',
        },
      },
      {
        alg: "(U R U' R') (U' F' U F)",
        source: 'twistyGuide',
        note: {
          en: 'Same as the right algorithm, grouped in two 4-move halves.',
          vi: 'Giống công thức phải, chia thành 2 nửa 4 nước.',
        },
      },
      {
        alg: "(U' F' U F) (U R U' R')",
        source: 'twistyGuide',
        note: {
          en: 'Inserts into the same front-right slot when the edge is in the top layer on the right, its side colour matching the right centre.',
          vi: 'Chèn vào cùng khe trước-phải khi cạnh nằm ở tầng trên phía bên phải, màu bên của nó trùng tâm phải.',
        },
      },
      {
        alg: "F' U2 F",
        source: 'wikibooks',
        note: {
          en: 'Wikibooks solves the middle edges while the bottom corner below the slot is still empty. Only works then.',
          vi: 'Wikibooks làm cạnh tầng giữa khi góc dưới khe còn trống. Chỉ dùng được lúc đó.',
        },
      },
      {
        alg: "F' U' F U R U' R'",
        source: 'wikibooks',
        note: {
          en: 'Edge in its slot but flipped, with the bottom corner still empty (Wikibooks order).',
          vi: 'Cạnh đúng khe nhưng bị lật, góc dưới vẫn trống (thứ tự của Wikibooks).',
        },
      },
    ],
  },
  // Step 4: yellow cross.
  {
    kind: 'top',
    mask: 'eo',
    options: [
      {
        alg: "(F R U R' U' F') U2 (F R U R' U' F')×2",
        source: 'ruwix',
        note: {
          en: 'Dot: Ruwix says "3 times". After the first time an L appears; turn U so it sits like the L case (here U2), then do it twice more.',
          vi: 'Chấm: Ruwix ghi "3 lần". Sau lần đầu sẽ ra chữ L; xoay U để nó nằm như ca chữ L (ở đây là U2), rồi làm thêm 2 lần.',
        },
      },
      {
        alg: "(F R U R' U' F')×2",
        source: 'ruwix',
        note: {
          en: 'L shape held as in the picture: 2 times.',
          vi: 'Hình chữ L cầm như hình: 2 lần.',
        },
      },
      {
        alg: "F U R U' R' F'",
        source: 'ruwix',
        note: {
          en: 'L shape straight to the cross in one go. Wikibooks gives the same one.',
          vi: 'Từ chữ L ra dấu cộng trong 1 lần. Wikibooks cũng dùng công thức này.',
        },
      },
      {
        alg: "F (U R U' R') F'",
        source: 'cubeskills',
        note: {
          en: 'Same moves, from the CubeSkills "Optimising the Beginner\'s Method" sheet.',
          vi: 'Cùng các nước, theo bảng "Optimising the Beginner\'s Method" của CubeSkills.',
        },
      },
      {
        alg: "F (R U R' U') F' Fw (R U R' U') Fw'",
        source: 'twistyGuide',
        note: { en: 'Dot in one go (Fw = f).', vi: 'Chấm trong 1 lần (Fw = f).' },
      },
      {
        alg: "Fw (R U R' U') Fw'",
        source: 'twistyGuide',
        note: { en: 'L shape with a wide F move.', vi: 'Chữ L với nước F rộng.' },
      },
      {
        alg: "F (R U R' U') F'",
        source: 'jperm',
        note: {
          en: 'J Perm: "front clockwise, 4-move sequence, front counterclockwise". Line case.',
          vi: 'J Perm: "xoay mặt trước, 4 nước, xoay ngược mặt trước". Ca đường thẳng.',
        },
      },
    ],
  },
  // Step 5: yellow edges.
  {
    kind: 'top',
    mask: 'llEdges',
    arrows: true,
    options: [
      {
        alg: "R U R' U R U2 R' U",
        source: 'ruwix',
        note: {
          en: 'Swaps the front and left edges. Twistyguide and Wikibooks use it too. It also twists corners, which is fine here.',
          vi: 'Đổi chỗ cạnh trước và cạnh trái. Twisty Guide và Wikibooks cũng dùng. Nó cũng xoay góc, ở bước này không sao.',
        },
      },
      {
        alg: "U (R U R' U R U2 R' U) y2 (R U R' U R U2 R' U)",
        source: 'ruwix',
        note: {
          en: 'Opposite edges swapped: the same algorithm twice with a y2 in between.',
          vi: 'Hai cạnh đối diện bị đổi: làm công thức trên 2 lần, giữa là y2.',
        },
      },
      {
        alg: "[R U'] [R U] [R U] [R U'] R' U' R2",
        source: 'ruwix',
        note: {
          en: 'Ua, as written on the Ruwix PLL page.',
          vi: 'Ua, theo cách viết của trang PLL Ruwix.',
        },
      },
      {
        alg: "R2 U [R U R' U'] (R' U') (R' U R')",
        source: 'ruwix',
        note: {
          en: 'Ub, as written on the Ruwix PLL page.',
          vi: 'Ub, theo cách viết của trang PLL Ruwix.',
        },
      },
      {
        alg: "(R U') (R U) (R U) (R U') R' U' R2",
        source: 'cubeskills',
        note: {
          en: 'Ua, from the CubeSkills beginner sheet (anticlockwise 3-cycle).',
          vi: 'Ua, theo bảng người mới của CubeSkills (xoay vòng ngược chiều kim đồng hồ).',
        },
      },
      {
        alg: "(R2 U) (R U) (R' U') (R' U') R' U R'",
        source: 'cubeskills',
        note: {
          en: 'Ub, from the CubeSkills beginner sheet (clockwise 3-cycle).',
          vi: 'Ub, theo bảng người mới của CubeSkills (xoay vòng theo chiều kim đồng hồ).',
        },
      },
      {
        alg: "y2 (R U R' U) (R' U' R2 U') R' U R' U R [U2]",
        source: 'cubeskills',
        note: {
          en: 'Ua, alternative from the PLL sheet.',
          vi: 'Ua, phương án khác trong bảng PLL.',
        },
      },
      {
        alg: "y2 (R2 U' R' U') R U R U (R U' R)",
        source: 'cubeskills',
        note: {
          en: 'Ua, alternative from the PLL sheet.',
          vi: 'Ua, phương án khác trong bảng PLL.',
        },
      },
      {
        alg: "y2 (R' U R' U') R' U' (R' U R U) R2'",
        source: 'cubeskills',
        note: {
          en: 'Ub, alternative from the PLL sheet.',
          vi: 'Ub, phương án khác trong bảng PLL.',
        },
      },
      {
        alg: "U2 M2' U M U2 M' U M2'",
        source: 'speedsolving',
        note: {
          en: 'Ua with M (middle slice) moves. Fast once you can do M with your ring finger.',
          vi: 'Ua bằng nước M (lớp giữa). Nhanh khi đã quen làm M bằng ngón áp út.',
        },
      },
      {
        alg: "U2 M2 U' M U2 M' U' M2",
        source: 'speedsolving',
        note: { en: 'Ub with M moves.', vi: 'Ub bằng nước M.' },
      },
      {
        alg: "L' U L' U' L' U' L' U L U L2",
        source: 'derived',
        note: {
          en: 'Ub done with the left hand: the mirror of Ua.',
          vi: 'Ub làm bằng tay trái: đối xứng của Ua.',
        },
      },
    ],
  },
  // Step 6: yellow corners into place.
  {
    kind: 'top',
    mask: 'llCorners',
    arrows: true,
    options: [
      {
        alg: "(U R U' L' U R' U' L)×2",
        source: 'ruwix',
        note: {
          en: 'The corners cycle the other way: do it twice.',
          vi: 'Các góc cần xoay vòng chiều ngược lại: làm 2 lần.',
        },
      },
      {
        alg: "L' U R U' L U R' U'",
        source: 'derived',
        note: {
          en: 'The reverse cycle in one go (the inverse of the main algorithm).',
          vi: 'Xoay vòng ngược lại trong 1 lần (nghịch đảo của công thức chính).',
        },
      },
      {
        alg: "x (R' U R') D2 (R U' R') D2 R2 x'",
        source: 'cubeskills',
        note: {
          en: "Aa-perm: same cycle, faster finger tricks. Ruwix writes it without the final x'.",
          vi: "Aa-perm: cùng kiểu xoay vòng, ngón tay nhanh hơn. Ruwix viết không có x' cuối.",
        },
      },
      {
        alg: "x R2' D2 (R U R') D2 (R U' R) x'",
        source: 'cubeskills',
        note: { en: 'Ab-perm: the other direction.', vi: 'Ab-perm: chiều còn lại.' },
      },
      {
        alg: "x' [(R U' R) D2] [(R' U R) D2] R2",
        source: 'ruwix',
        note: { en: 'Ab-perm as written on Ruwix.', vi: 'Ab-perm theo cách viết của Ruwix.' },
      },
      {
        alg: "(R' U L') U2 (R U' L) (R' U L') U2 (R U' L)",
        source: 'cubeskills',
        note: {
          en: 'Swaps 2 diagonal corners when no corner is in place. Saves doing the 3-cycle twice.',
          vi: 'Đổi 2 góc chéo nhau khi không góc nào đúng chỗ. Đỡ phải làm xoay vòng 2 lần.',
        },
      },
    ],
  },
  // Step 7: twist yellow corners.
  {
    kind: 'top',
    mask: 'oll',
    options: [
      {
        alg: "(R' D' R D)×2 U' (R' D' R D)×4 U",
        source: 'ruwix',
        note: {
          en: 'Ruwix worked example: 2 corners to twist. Turn only U between corners.',
          vi: 'Ví dụ của Ruwix: 2 góc cần xoay. Giữa các góc chỉ xoay U.',
        },
      },
      {
        alg: "(R' D' R D)×4 U' (R' D' R D)×2 U",
        source: 'ruwix',
        note: { en: 'Ruwix worked example.', vi: 'Ví dụ của Ruwix.' },
      },
      {
        alg: "(R' D' R D)×2 U (R' D' R D)×2 U2 (R' D' R D)×2 U",
        source: 'ruwix',
        note: { en: 'Ruwix worked example: 3 corners.', vi: 'Ví dụ của Ruwix: 3 góc.' },
      },
      {
        alg: "(R' D' R D)×4 U (R' D' R D)×4 U2 (R' D' R D)×4 U",
        source: 'ruwix',
        note: { en: 'Ruwix worked example: 3 corners.', vi: 'Ví dụ của Ruwix: 3 góc.' },
      },
      {
        alg: "U (R' D' R D)×2 U2 (R' D' R D)×4 U",
        source: 'ruwix',
        note: { en: 'Ruwix worked example.', vi: 'Ví dụ của Ruwix.' },
      },
      {
        alg: "D R' D' R",
        source: 'wikibooks',
        noImage: true,
        note: {
          en: 'Same idea, other direction: repeat 2 or 4 times per corner, turning only U between corners.',
          vi: 'Cùng ý tưởng, chiều ngược lại: lặp 2 hoặc 4 lần cho mỗi góc, giữa các góc chỉ xoay U.',
        },
      },
      {
        alg: "R U R' U'",
        source: 'jperm',
        grip: 'z2',
        noImage: true,
        note: {
          en: 'J Perm flips the cube so the yellow corners are on the bottom, then repeats the 4-move sequence (2 or 4 times per corner).',
          vi: 'J Perm lật khối để góc vàng ở dưới, rồi lặp 4 nước (2 hoặc 4 lần cho mỗi góc).',
        },
      },
    ],
  },
];

/** Extra sources for the 4 basic F2L inserts, same order as `F2L_BASIC_ALGS`. */
export const F2L_BASIC_SOURCES: Array<Array<TAlgSource>> = [
  ['gan'],
  ['twistyGuide'],
  ['gan'],
  ['twistyGuide'],
];

/** Options found for the 2-look PLL cases, besides the CubeSkills sheet. */
export const PLL_EXTRA_OPTIONS: Record<string, Array<TAlgOption>> = {
  Ua: [
    { alg: "[R U'] [R U] [R U] [R U'] R' U' R2", source: 'ruwix' },
    { alg: "U2 M2' U M U2 M' U M2'", source: 'speedsolving' },
  ],
  Ub: [
    { alg: "R2 U [R U R' U'] (R' U') (R' U R')", source: 'ruwix' },
    { alg: "U2 M2 U' M U2 M' U' M2", source: 'speedsolving' },
    { alg: "L' U L' U' L' U' L' U L U L2", source: 'derived' },
  ],
  Aa: [{ alg: "x [(R' U R') D2] [(R U' R') D2] R2", source: 'ruwix' }],
  Ab: [{ alg: "x' [(R U' R) D2] [(R' U R) D2] R2", source: 'ruwix' }],
  H: [{ alg: 'M2 U M2 U2 M2 U M2', source: 'ruwix' }],
  Z: [{ alg: "M2 U M2 U M' U2 M2 U2 M' U2", source: 'ruwix' }],
  Y: [{ alg: "F R U' R' U' [R U R' F'] {[R U R' U'] [R' F R F']}", source: 'ruwix' }],
};

/** Where the main 2-look OLL edge algorithms (dot, L, line) were found. */
export const OLL_EDGE_SOURCES: Array<Array<TAlgSource>> = [
  ['twistyGuide'],
  ['twistyGuide'],
  ['twistyGuide', 'ruwix', 'wikibooks', 'jperm'],
];

/** Options for the 2-look OLL edge cases (dot, L, line), besides the main ones. */
export const OLL_EDGE_EXTRA_OPTIONS: Array<Array<TAlgOption>> = [
  [{ alg: "(F R U R' U' F') U2 (F R U R' U' F')×2", source: 'ruwix' }],
  [
    { alg: "F U R U' R' F'", source: 'ruwix' },
    { alg: "F (U R U' R') F'", source: 'cubeskills' },
    { alg: "(F R U R' U' F')×2", source: 'ruwix' },
  ],
  [],
];
