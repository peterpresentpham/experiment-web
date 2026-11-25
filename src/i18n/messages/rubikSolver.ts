import type { Face } from 'src/lib/cube/cube';
import { defineMessages } from '../define';

export const rubikSolverMessages = defineMessages<{
  title: string;
  description: string;
  breadcrumb: string;
  intro: string;
  hold: string;
  colors: Record<Face, string>;
  palette: string;
  sticker: (color: string, face: string, index: number) => string;
  solve: string;
  solving: string;
  scramble: string;
  reset: string;
  scan: string;
  solved: string;
  solution: (moves: number) => string;
  uncertain: string;
  failed: string;
  errors: {
    colorCount: (color: string, count: number) => string;
    center: string;
    invalidPiece: string;
    duplicatePiece: string;
    cornerTwist: string;
    edgeFlip: string;
    parity: string;
  };
  scanner: {
    title: string;
    step: (index: number, total: number) => string;
    /** How to hold the cube for each face, by the face's colour. */
    faces: Record<Face, string>;
    capture: string;
    retake: string;
    cancel: string;
    starting: string;
    cameraError: string;
    privacy: string;
  };
}>({
  en: {
    title: 'Rubik solver',
    description:
      'Paint your scrambled 3x3 cube, or scan it with the camera, and watch a solution of about 20 moves in 3D.',
    breadcrumb: 'solver',
    intro:
      'Paint every sticker of your cube (or scan it with the camera), then press Solve. The solver finds a solution of about 20 moves, which plays on the 3D cube below.',
    hold: 'Hold the cube with yellow on top and green in front, as in the guide. The centres never move, so they are fixed.',
    colors: { U: 'yellow', D: 'white', F: 'green', B: 'blue', R: 'orange', L: 'red' },
    palette: 'Paint colour',
    sticker: (color, face, index) => `${face} face, sticker ${index + 1}: ${color}`,
    solve: 'Solve',
    solving: 'Solving…',
    scramble: 'Random scramble',
    reset: 'Reset',
    scan: 'Scan with camera',
    solved: 'The cube is already solved.',
    solution: (moves) => `Solution: ${moves} moves`,
    uncertain:
      'Stickers with a dashed border were hard to tell apart in the pictures: check them against your cube.',
    failed: 'The solver could not start. Reload the page and try again.',
    errors: {
      colorCount: (color, count) => `There are ${count} ${color} stickers; every colour has 9.`,
      center: 'A centre has the wrong colour.',
      invalidPiece: 'The marked piece has a colour combination no real piece has.',
      duplicatePiece: 'The marked pieces are the same piece twice.',
      cornerTwist:
        'A corner is twisted in place: no turns reach this state. Check the corner stickers, or take the corner out and put it back correctly.',
      edgeFlip: 'An edge is flipped in place: no turns reach this state. Check the edge stickers.',
      parity:
        'Two pieces are swapped: no turns reach this state. Check that the stickers were painted in the right places.',
    },
    scanner: {
      title: 'Scan the cube',
      step: (index, total) => `Face ${index} of ${total}`,
      faces: {
        F: 'Green facing the camera, yellow on top.',
        R: 'Orange facing the camera, yellow on top.',
        B: 'Blue facing the camera, yellow on top.',
        L: 'Red facing the camera, yellow on top.',
        U: 'Yellow facing the camera, blue on top.',
        D: 'White facing the camera, green on top.',
      },
      capture: 'Capture',
      retake: 'Retake the previous face',
      cancel: 'Cancel',
      starting: 'Starting the camera…',
      cameraError:
        'The camera is not available. Allow camera access in the browser, or paint the colours by hand.',
      privacy: 'Pictures are read on this device only and never uploaded.',
    },
  },
  vi: {
    title: 'Giải Rubik',
    description:
      'Tô màu khối Rubik 3x3 đang xáo của bạn, hoặc quét bằng camera, rồi xem lời giải khoảng 20 nước trên khối 3D.',
    breadcrumb: 'giải khối',
    intro:
      'Tô đủ màu các ô của khối (hoặc quét bằng camera), rồi bấm Giải. Trang sẽ tìm lời giải khoảng 20 nước và phát từng nước trên khối 3D bên dưới.',
    hold: 'Cầm khối mặt vàng lên trên, mặt xanh lá ra trước, giống trong bài hướng dẫn. Ô giữa không bao giờ đổi chỗ nên đã được tô sẵn.',
    colors: { U: 'vàng', D: 'trắng', F: 'xanh lá', B: 'xanh dương', R: 'cam', L: 'đỏ' },
    palette: 'Màu tô',
    sticker: (color, face, index) => `Mặt ${face}, ô ${index + 1}: ${color}`,
    solve: 'Giải',
    solving: 'Đang giải…',
    scramble: 'Xáo ngẫu nhiên',
    reset: 'Đặt lại',
    scan: 'Quét bằng camera',
    solved: 'Khối đã được giải sẵn rồi.',
    solution: (moves) => `Lời giải: ${moves} nước`,
    uncertain: 'Các ô viền nét đứt khó phân biệt màu trong ảnh: hãy so lại với khối thật.',
    failed: 'Không khởi động được bộ giải. Hãy tải lại trang rồi thử lại.',
    errors: {
      colorCount: (color, count) => `Đang có ${count} ô màu ${color}; mỗi màu phải có đúng 9 ô.`,
      center: 'Có ô giữa bị sai màu.',
      invalidPiece: 'Viên được đánh dấu có tổ hợp màu không viên thật nào có.',
      duplicatePiece: 'Các viên được đánh dấu bị trùng nhau.',
      cornerTwist:
        'Có một viên góc bị xoay tại chỗ: không cách xoay nào ra được trạng thái này. Hãy kiểm tra lại màu các viên góc, hoặc tháo viên góc ra lắp lại cho đúng.',
      edgeFlip:
        'Có một viên cạnh bị lật tại chỗ: không cách xoay nào ra được trạng thái này. Hãy kiểm tra lại màu các viên cạnh.',
      parity:
        'Có hai viên bị đổi chỗ cho nhau: không cách xoay nào ra được trạng thái này. Hãy kiểm tra xem đã tô đúng vị trí chưa.',
    },
    scanner: {
      title: 'Quét khối Rubik',
      step: (index, total) => `Mặt ${index}/${total}`,
      faces: {
        F: 'Mặt xanh lá hướng vào camera, mặt vàng ở trên.',
        R: 'Mặt cam hướng vào camera, mặt vàng ở trên.',
        B: 'Mặt xanh dương hướng vào camera, mặt vàng ở trên.',
        L: 'Mặt đỏ hướng vào camera, mặt vàng ở trên.',
        U: 'Mặt vàng hướng vào camera, mặt xanh dương ở trên.',
        D: 'Mặt trắng hướng vào camera, mặt xanh lá ở trên.',
      },
      capture: 'Chụp',
      retake: 'Chụp lại mặt trước',
      cancel: 'Huỷ',
      starting: 'Đang mở camera…',
      cameraError:
        'Không dùng được camera. Hãy cho phép trình duyệt truy cập camera, hoặc tô màu bằng tay.',
      privacy: 'Ảnh chỉ được xử lý trên máy này, không tải lên đâu cả.',
    },
  },
});
