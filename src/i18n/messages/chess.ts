import type { TChessExampleId, TChessSectionId } from 'src/configs/chessGuide.config';
import { defineMessages } from '../define';

type TSection = {
  title: string;
  body: Array<string>;
  bullets?: Array<string>;
  tip?: { title: string; text: string };
};

type TExampleText = { title: string; caption: string };

export const chessMessages = defineMessages<{
  title: string;
  intro: string;
  levels: Record<'beginner' | 'intermediate', { label: string; hint: string }>;
  howTo: string;
  player: {
    loading: string;
    play: string;
    pause: string;
    replay: string;
    toStart: string;
    toEnd: string;
    stepBack: string;
    stepForward: string;
    speed: string;
    moves: string;
    startPosition: string;
  };
  sections: Record<TChessSectionId, TSection>;
  examples: Record<TChessExampleId, TExampleText>;
  sourcesTitle: string;
  // Same order as `CHESS_SOURCE_URLS` in the view.
  sources: Array<string>;
}>({
  en: {
    title: 'Learn chess from scratch',
    intro:
      'Chess looks hard because it has many rules, but each rule is small. This guide builds them in order: the board, how every piece moves, the three special moves, how a game ends, and then the ideas that win games (openings, tactics, mating patterns, endgames). Every example is a 3D board that plays the moves one at a time.',
    levels: {
      beginner: { label: '1. Beginner', hint: 'Board · pieces · special moves · ending a game' },
      intermediate: {
        label: '2. Intermediate',
        hint: 'Openings · tactics · mating patterns · endgames',
      },
    },
    howTo:
      'How to use the 3D boards: drag to turn the board, scroll or pinch to zoom, press Play or step through the moves. White starts at the bottom. A yellow square is the last move, green dots are squares the piece can go to, red rings mark the key squares and a red square is a king in check.',
    player: {
      loading: 'Loading the 3D board...',
      play: 'Play',
      pause: 'Pause',
      replay: 'Play again',
      toStart: 'To the start',
      toEnd: 'To the end',
      stepBack: 'Previous move',
      stepForward: 'Next move',
      speed: 'Speed',
      moves: 'Moves',
      startPosition: 'Start',
    },
    sections: {
      board: {
        title: 'The board and the starting position',
        body: [
          'Chess is played by two players on an 8 by 8 board of 64 squares, alternating light and dark. One player has the white pieces and the other the black pieces. White always moves first, then the players take turns, one move each. You cannot pass.',
          'Each side starts with 16 pieces: 8 pawns, 2 rooks, 2 knights, 2 bishops, 1 queen and 1 king. The pawns fill the second row. The other pieces stand on the first row: rooks in the corners, then knights, then bishops, then the queen and the king in the middle.',
          "The columns are called files and are named a to h from left to right (from White's side). The rows are called ranks and are numbered 1 to 8 from White's side. Every square has a name made of its file and rank, like e4 or g8. You will need these names to read moves later.",
        ],
        bullets: [
          'Two memory tricks for the setup: the bottom-right corner square must be light ("light on the right"), and the queen always starts on her own colour (the white queen on the light square d1, the black queen on the dark square d8).',
          "The goal of the game is to checkmate the opponent's king: attack it so that it cannot escape. You never capture the king; the game ends before that.",
        ],
      },
      pieces: {
        title: 'How every piece moves',
        body: [
          'A piece moves to an empty square or captures an enemy piece by taking its place; the captured piece leaves the board for good. You can never capture your own pieces. Every piece except the knight cannot jump over other pieces.',
          'Press Play or look at the green dots in each example below: they show exactly the squares that piece can reach from where it stands.',
        ],
      },
      special: {
        title: 'Three special moves',
        body: [
          'These moves look odd the first time, but they are part of the standard rules, and a position can depend on them. Each one has conditions that must all be true.',
        ],
        bullets: [
          'Castling: the king moves two squares towards a rook, and that rook jumps to the other side of the king. Conditions: neither the king nor that rook has moved before, there are no pieces between them, the king is not in check, and the king does not pass through or land on an attacked square.',
          'En passant ("in passing"): if an enemy pawn advances two squares from its start and lands right beside your pawn, you may capture it on the very next move as if it had moved only one square. If you do not do it immediately, the chance is gone.',
          'Promotion: a pawn that reaches the far row must become a queen, rook, bishop or knight of its own colour (almost always a queen). You do not need to have lost that piece before.',
        ],
      },
      end: {
        title: 'Check, checkmate and draws',
        body: [
          'Check means the king is attacked. You must answer it at once in one of three ways: move the king to a safe square, capture the attacking piece, or block the line between them (not possible against a knight). A move that leaves your own king in check is illegal.',
          'Checkmate means the king is in check and there is no legal way out. The player who is checkmated loses and the game ends immediately.',
          'A draw (half a point each) happens by: stalemate (the player to move has no legal move but is not in check), agreement, insufficient material (for example king against king), threefold repetition of the same position, or the fifty-move rule (fifty moves by each side with no capture and no pawn move).',
        ],
        tip: {
          title: 'Do not stalemate by accident',
          text: 'When you are far ahead, always check that your opponent has a legal move before you make yours. Giving stalemate turns a won game into a draw.',
        },
      },
      values: {
        title: 'Piece values and trading',
        body: [
          "Players use points to judge a trade. They are only a guide, because a piece's real worth depends on the position, but they stop you from giving away more than you take.",
        ],
        bullets: [
          'Pawn = 1 point.',
          'Knight = 3 points and bishop = 3 points (two bishops together are slightly stronger than a bishop and a knight).',
          'Rook = 5 points.',
          'Queen = 9 points.',
          'King: priceless, since losing it ends the game. In the endgame it is also a strong fighting piece.',
          'Giving a rook (5) for a knight (3) loses material, and taking a defended pawn with your queen (9 for 1) is a blunder.',
        ],
        tip: {
          title: 'The three-question check',
          text: 'Before every move ask: what does my opponent threaten now? What does my move threaten? Is the piece I move (or any piece I leave behind) left hanging, meaning attacked and not defended?',
        },
      },
      notation: {
        title: 'Reading and writing moves',
        body: [
          'Games are written in algebraic notation (SAN). It is what every book, website and the move list under each 3D board use.',
        ],
        bullets: [
          'The piece letter comes first: K king, Q queen, R rook, B bishop, N knight (K is taken). A pawn has no letter. Then the square it goes to: Nf3 means a knight goes to f3, and e4 means a pawn goes to e4.',
          'x means a capture: Bxc6 is a bishop capturing on c6, and exd5 is the pawn from the e-file capturing on d5.',
          '+ means check and # means checkmate: Qh4#.',
          "O-O is castling on the king's side (short) and O-O-O is castling on the queen's side (long).",
          '=Q after a pawn move is promotion: a8=Q. If two same pieces can reach a square, the file or rank is added: Rad1.',
          'Moves are numbered in pairs: 1.e4 e5 means White played e4 and Black replied e5.',
        ],
        tip: {
          title: 'Touch-move rule',
          text: 'In a real game, if you touch a piece you must move it, and once you let go of it on a square the move is made. Decide before you touch.',
        },
      },
      opening: {
        title: 'The opening: three principles',
        body: [
          'You do not need to memorise lines to play the first ten moves well. Follow three principles, and break them only for a concrete reason.',
        ],
        bullets: [
          'Fight for the centre (the squares e4, d4, e5, d5) with pawns and pieces. Pieces in the centre reach more squares.',
          'Develop your knights and bishops quickly, usually knights before bishops, and avoid moving the same piece twice or bringing the queen out early.',
          'Castle early to hide the king and bring a rook to the middle, then connect your rooks.',
        ],
        tip: {
          title: 'A beginner opening that follows all of these',
          text: 'As White, play e4, then Nf3, then Bc4, then castle, then d3 or c3 and d4. This is the Italian Game. The example below shows it; try to say which principle each move follows.',
        },
      },
      tactics: {
        title: 'Tactics: the three basic tricks',
        body: [
          'A tactic is a short forcing sequence that wins material or checkmates. Most games below master level are decided by tactics, so learn to spot these three patterns.',
        ],
        bullets: [
          'Fork: one piece attacks two or more targets at once, so the opponent can save only one. Knights are the best forkers because most pieces cannot attack back.',
          'Pin: a piece cannot move because a more valuable piece (or the king) stands behind it on the same line. A pin against the king is absolute: the pinned piece cannot legally move at all.',
          'Skewer: the reverse of a pin. A valuable piece is attacked, must move, and exposes a piece behind it.',
        ],
        tip: {
          title: 'How to find tactics',
          text: 'Look at checks, captures and threats first, in that order, for both sides. Ask which enemy pieces are undefended or lined up with the king.',
        },
      },
      mating: {
        title: 'Basic checkmating patterns',
        body: [
          'You win a won game only by finishing it. These two patterns come up again and again.',
        ],
        bullets: [
          'Back-rank mate: a king stuck behind its own pawns on the first (or last) row is checked by a rook or queen along that row, and has no square to run to. Always give your own king an escape square ("luft") by moving a pawn once you have castled.',
          'Ladder mate (two rooks): two rooks cut the board into strips. One rook checks along a row, the king steps to the next row, and the other rook checks there. The rooks leapfrog each other up the board until the king is mated on the edge.',
        ],
      },
      endgame: {
        title: 'Endgame ideas: the king becomes a fighter',
        body: [
          'With fewer pieces on the board, the king is safe enough to join the fight. Bring it to the centre and use it to support your pawns.',
          'Opposition: two kings face each other on the same file or rank with exactly one square between them. The player who has to move must step aside and lets the other king advance. In a king and pawn ending, who holds the opposition often decides whether the pawn promotes or not.',
        ],
        bullets: [
          'Push passed pawns (pawns with no enemy pawn in front or on the neighbouring files). A passed pawn is a strong asset in the endgame.',
          'Keep your rooks active, on open files and on the seventh row, rather than guarding pawns passively.',
          'Learn the basic mates: king and queen against king, and king and rook against king.',
        ],
      },
      habits: {
        title: 'Common mistakes and how to practise',
        body: [
          'Most lost games below club level are lost to a single blunder, not to a deep plan. A few habits remove most of them.',
        ],
        bullets: [
          'Blunder check: before every move, look at the square the piece lands on and at every piece it stops defending.',
          "Do not chase material with one piece in the opening, and do not ignore your opponent's threats while you attack.",
          'Solve a few tactical puzzles every day. Repeating the patterns above is the fastest way to improve.',
          'Review every loss: find the first move where the position got worse and ask what you missed.',
          'Play longer games (10 minutes or more per side) while you learn, so you have time to think.',
        ],
      },
    },
    examples: {
      start: {
        title: 'The starting position',
        caption:
          'Turn the board and read the file letters a to h and the rank numbers 1 to 8 around it. White is at the bottom. Notice the queens facing each other on d1 and d8, and the kings on e1 and e8.',
      },
      rook: {
        title: 'Rook',
        caption:
          'The rook moves any number of squares in a straight line, along a rank or a file, but not diagonally. From d4 on an empty board it reaches 14 squares. Rooks are strongest on open files where no pawn is in the way.',
      },
      bishop: {
        title: 'Bishop',
        caption:
          'The bishop moves any number of squares diagonally. It always stays on the same colour of squares it started on, so each side has a light-squared and a dark-squared bishop. Because it covers only half the squares, two bishops working together are valuable.',
      },
      queen: {
        title: 'Queen',
        caption:
          'The queen moves like a rook and a bishop combined: any number of squares in a straight line or on a diagonal. She is the strongest piece (9 points), so bring her out carefully so she is not chased by lesser pieces.',
      },
      knight: {
        title: 'Knight',
        caption:
          'The knight moves in an L shape: two squares in one direction and then one square sideways. It is the only piece that jumps over others, which makes it very useful in crowded positions. From the centre it reaches 8 squares; in a corner only 2.',
      },
      king: {
        title: 'King',
        caption:
          'The king moves one square in any direction. It can never move to a square attacked by an enemy piece, and the two kings can never stand next to each other. Keep it safe: it is the piece you must never lose.',
      },
      pawnStart: {
        title: 'Pawn: moving',
        caption:
          'A pawn moves straight forward one square. From its starting square it may instead advance two squares. Pawns never move backwards and cannot capture the piece directly in front of them, so a pawn can be blocked.',
      },
      pawnCapture: {
        title: 'Pawn: capturing',
        caption:
          'A pawn captures one square diagonally forward, which is different from how it moves. Here the white pawn on e4 can step to e5 or capture either black pawn on d5 and f5.',
      },
      castling: {
        title: 'Castling, short and long',
        caption:
          "White castles on the king's side (O-O): the king goes to g1 and the rook from h1 to f1. Then Black castles on the queen's side (O-O-O): the king goes to c8 and the rook from a8 to d8. In one move you hide the king and activate a rook.",
      },
      enPassant: {
        title: 'En passant',
        caption:
          'Black has just played d7-d5, passing beside the white pawn on e5. White can capture "in passing" with exd6: the pawn lands on d6, the square the black pawn skipped, and the black pawn on d5 is removed. The red ring marks the captured pawn.',
      },
      promotion: {
        title: 'Promotion',
        caption:
          'The white pawn reaches a8 and becomes a queen with a check. Choosing a knight or another piece is called underpromotion and is rare, but a knight can sometimes give a check the queen cannot.',
      },
      check: {
        title: 'Check',
        caption:
          'The rook goes to a8 and attacks the black king along the back row. The king square turns red. Black answers by moving the king to d7, out of the line of attack.',
      },
      foolsMate: {
        title: "Fool's mate: the shortest game",
        caption:
          'After 1.f3 e5 2.g4, Black plays Qh4#. The white king is attacked on the diagonal h4 to e1, and the pawns that would block it have moved away. It is a warning not to open the diagonal in front of your own king.',
      },
      stalemate: {
        title: 'Stalemate',
        caption:
          "It is Black's turn. The king on h8 is not in check, but every square it could go to (g8, h7, g7) is attacked, and Black has no other piece. With no legal move and no check, the game is a draw even though White has a queen more.",
      },
      italian: {
        title: 'The Italian Game',
        caption:
          'White takes the centre (e4), develops the knight (Nf3) and the bishop (Bc4) aimed at f7, then prepares d4 with c3. Black does the same. Every move follows a principle: centre, development, and a plan to castle next.',
      },
      scholar: {
        title: "Scholar's mate: a trap and how to avoid it",
        caption:
          "White brings the queen and bishop out at once against the weak f7 square, which only the king defends. Black's Nf6 attacks the queen but misses the threat, and Qxf7# ends the game. Defend f7 (for example with ...Qe7 or ...g6) and the trap fails.",
      },
      fork: {
        title: 'Fork',
        caption:
          'Nd6+ checks the king on e8 and attacks the rook on b7 at the same time (the red rings). The king must move, then the knight takes the rook for free. Knights fork because they attack in a pattern most pieces cannot answer.',
      },
      pin: {
        title: 'Pin',
        caption:
          'After 3.Bb5, the knight on c6 is pinned against the king on e8: if it moves, the bishop would give check, so it cannot legally move. White can now pile up on the pinned piece, for example by attacking it again.',
      },
      skewer: {
        title: 'Skewer',
        caption:
          'The rook checks the king on e5 along the fifth rank. The black queen on a5 stands behind it on the same line. The king has to move out of the way, and then the rook captures the queen.',
      },
      backRank: {
        title: 'Back-rank mate',
        caption:
          'The black king is walled in by its own pawns on f7, g7 and h7. Ra8# checks along the eighth row and nothing can block or capture, so it is checkmate. One pawn move earlier would have given the king a flight square.',
      },
      ladder: {
        title: 'Ladder mate with two rooks',
        caption:
          'The rook on a6 stops the king from going down. Rb7+ checks and forces the king to the last row, then Ra8# finishes. The two rooks hop over each other, row by row, like climbing a ladder.',
      },
      opposition: {
        title: 'Opposition',
        caption:
          "The kings face each other on e4 and e6 with one square between them, and it is White's turn. White has to step aside, so Black's king can advance (for example to d5 or f5). Having the opposition means it is the other player who has to move.",
      },
    },
    sourcesTitle: 'References',
    sources: [
      'FIDE Laws of Chess (official rules)',
      'Lichess: Learn chess (interactive lessons)',
      'Wikipedia: Rules of chess',
      'Wikipedia: Chess tactics and checkmate patterns',
      'chess.js (the move generator behind every example)',
    ],
  },
  vi: {
    title: 'Học cờ vua từ con số 0',
    intro:
      'Cờ vua trông khó vì có nhiều luật, nhưng mỗi luật đều nhỏ. Bài này xây dựng theo thứ tự: bàn cờ, cách đi của từng quân, ba nước đi đặc biệt, cách kết thúc ván cờ, rồi đến những ý tưởng giúp thắng ván (khai cuộc, chiến thuật, các thế chiếu hết, tàn cuộc). Mỗi ví dụ là một bàn cờ 3D chạy từng nước một.',
    levels: {
      beginner: { label: '1. Người mới', hint: 'Bàn cờ · quân cờ · nước đặc biệt · kết thúc ván' },
      intermediate: {
        label: '2. Trung cấp',
        hint: 'Khai cuộc · chiến thuật · thế chiếu hết · tàn cuộc',
      },
    },
    howTo:
      'Cách dùng bàn cờ 3D: kéo để xoay bàn, cuộn chuột hoặc chụm hai ngón để phóng to, bấm Chạy hoặc bước từng nước. Quân Trắng ở phía dưới. Ô vàng là nước vừa đi, chấm xanh là các ô quân đó đi tới được, vòng đỏ đánh dấu ô quan trọng và ô đỏ là vua đang bị chiếu.',
    player: {
      loading: 'Đang tải bàn cờ 3D...',
      play: 'Chạy',
      pause: 'Dừng',
      replay: 'Chạy lại',
      toStart: 'Về đầu',
      toEnd: 'Đến cuối',
      stepBack: 'Nước trước',
      stepForward: 'Nước sau',
      speed: 'Tốc độ',
      moves: 'Các nước đi',
      startPosition: 'Đầu',
    },
    sections: {
      board: {
        title: 'Bàn cờ và thế xếp quân ban đầu',
        body: [
          'Cờ vua do hai người chơi trên bàn 8 x 8 gồm 64 ô, xen kẽ ô sáng và ô tối. Một người cầm quân Trắng, người kia cầm quân Đen. Trắng luôn đi trước, sau đó hai bên lần lượt đi mỗi bên một nước. Không được bỏ lượt.',
          'Mỗi bên có 16 quân: 8 tốt, 2 xe, 2 mã, 2 tượng, 1 hậu và 1 vua. Tám quân tốt xếp kín hàng thứ hai. Các quân còn lại xếp ở hàng đầu: xe ở hai góc, rồi đến mã, rồi đến tượng, hậu và vua ở giữa.',
          'Các cột gọi là cột (file), đặt tên từ a đến h, từ trái sang phải (nhìn từ phía Trắng). Các hàng gọi là hàng (rank), đánh số từ 1 đến 8 tính từ phía Trắng. Mỗi ô có tên ghép từ cột và hàng, như e4 hay g8. Bạn cần các tên này để đọc nước đi ở phần sau.',
        ],
        bullets: [
          'Hai mẹo nhớ khi xếp quân: ô góc dưới bên phải phải là ô sáng ("sáng bên phải"), và hậu luôn đứng trên ô cùng màu với mình (hậu Trắng ở ô sáng d1, hậu Đen ở ô tối d8).',
          'Mục tiêu của ván cờ là chiếu hết vua đối phương: tấn công vua sao cho nó không thoát được. Vua không bao giờ bị bắt; ván cờ kết thúc trước đó.',
        ],
      },
      pieces: {
        title: 'Cách đi của từng quân',
        body: [
          'Một quân đi tới ô trống, hoặc bắt quân địch bằng cách đứng vào chỗ của nó; quân bị bắt rời bàn cờ vĩnh viễn. Không bao giờ được bắt quân của mình. Mọi quân trừ mã đều không được nhảy qua quân khác.',
          'Bấm Chạy hoặc nhìn các chấm xanh trong từng ví dụ bên dưới: chúng cho thấy chính xác các ô quân đó đi tới được từ vị trí hiện tại.',
        ],
      },
      special: {
        title: 'Ba nước đi đặc biệt',
        body: [
          'Các nước này lạ lúc đầu, nhưng đều thuộc luật chuẩn và có thể quyết định cả một thế cờ. Mỗi nước có những điều kiện phải đúng hết.',
        ],
        bullets: [
          'Nhập thành: vua đi hai ô về phía một quân xe, và quân xe đó nhảy sang bên kia vua. Điều kiện: vua và xe đó chưa từng di chuyển, không có quân nào nằm giữa, vua không đang bị chiếu, và vua không đi qua hay đứng trên ô bị tấn công.',
          'Bắt tốt qua đường (en passant): nếu một tốt địch tiến hai ô từ vị trí xuất phát và dừng ngay cạnh tốt của bạn, bạn có quyền bắt nó ở nước liền sau như thể nó chỉ đi một ô. Nếu không bắt ngay thì mất cơ hội.',
          'Phong cấp: tốt đi đến hàng cuối phía địch bắt buộc phải đổi thành hậu, xe, tượng hoặc mã cùng màu (hầu như luôn là hậu). Bạn không cần phải mất quân đó trước.',
        ],
      },
      end: {
        title: 'Chiếu, chiếu hết và hoà cờ',
        body: [
          'Chiếu nghĩa là vua đang bị tấn công. Bạn phải xử lý ngay bằng một trong ba cách: đưa vua sang ô an toàn, bắt quân đang chiếu, hoặc chặn đường giữa quân đó và vua (không chặn được quân mã). Nước đi để vua mình vẫn bị chiếu là nước phạm luật.',
          'Chiếu hết nghĩa là vua đang bị chiếu và không còn cách hợp lệ nào để thoát. Bên bị chiếu hết thua và ván cờ kết thúc ngay.',
          'Ván cờ hoà (mỗi bên nửa điểm) khi: hết nước đi (bên đến lượt không có nước hợp lệ nhưng vua không bị chiếu), hai bên thoả thuận, không đủ lực lượng chiếu hết (ví dụ vua đấu vua), lặp lại cùng một thế cờ ba lần, hoặc luật năm mươi nước (năm mươi nước mỗi bên mà không bắt quân và không đi tốt).',
        ],
        tip: {
          title: 'Đừng vô tình để hết nước đi',
          text: 'Khi đang hơn hẳn, luôn kiểm tra đối phương còn nước đi hợp lệ trước khi bạn đi. Để hết nước đi (stalemate) biến ván thắng thành ván hoà.',
        },
      },
      values: {
        title: 'Giá trị quân cờ và đổi quân',
        body: [
          'Người chơi dùng điểm để đánh giá một lần đổi quân. Đây chỉ là hướng dẫn, vì giá trị thật của quân còn tuỳ thế cờ, nhưng nó giúp bạn không cho đi nhiều hơn nhận về.',
        ],
        bullets: [
          'Tốt = 1 điểm.',
          'Mã = 3 điểm và tượng = 3 điểm (hai tượng cùng nhau mạnh hơn một tượng và một mã một chút).',
          'Xe = 5 điểm.',
          'Hậu = 9 điểm.',
          'Vua: vô giá, vì mất vua là hết ván. Ở tàn cuộc, vua cũng là quân chiến đấu mạnh.',
          'Đổi xe (5) lấy mã (3) là lỗ, và dùng hậu (9) ăn một tốt đang được bảo vệ (1) là sai lầm nặng.',
        ],
        tip: {
          title: 'Ba câu hỏi trước mỗi nước đi',
          text: 'Đối phương đang đe doạ gì? Nước đi của tôi đe doạ gì? Quân tôi vừa đi (hoặc quân nào tôi bỏ lại) có bị treo không, tức là bị tấn công mà không được bảo vệ?',
        },
      },
      notation: {
        title: 'Đọc và ghi nước đi',
        body: [
          'Ván cờ được ghi bằng ký hiệu đại số (SAN). Đó là cách mọi sách, trang web và danh sách nước đi dưới mỗi bàn cờ 3D dùng.',
        ],
        bullets: [
          'Chữ của quân đứng trước: K vua, Q hậu, R xe, B tượng, N mã (K đã dùng cho vua). Quân tốt không có chữ. Sau đó là ô đến: Nf3 nghĩa là mã đi đến f3, e4 nghĩa là tốt đi đến e4.',
          'x là bắt quân: Bxc6 là tượng bắt quân ở c6, exd5 là tốt ở cột e bắt quân ở d5.',
          '+ là chiếu và # là chiếu hết: Qh4#.',
          'O-O là nhập thành cánh vua (ngắn), O-O-O là nhập thành cánh hậu (dài).',
          '=Q sau nước tốt là phong cấp: a8=Q. Nếu hai quân giống nhau cùng đến được một ô thì thêm cột hoặc hàng: Rad1.',
          'Các nước được đánh số theo cặp: 1.e4 e5 nghĩa là Trắng đi e4 và Đen đáp e5.',
        ],
        tip: {
          title: 'Luật chạm quân',
          text: 'Trong ván thật, nếu bạn chạm vào một quân thì phải đi quân đó, và khi bạn thả tay trên một ô thì nước đi đã xong. Hãy quyết định trước khi chạm.',
        },
      },
      opening: {
        title: 'Khai cuộc: ba nguyên tắc',
        body: [
          'Bạn không cần học thuộc các biến để đi tốt mười nước đầu. Hãy theo ba nguyên tắc, và chỉ phá lệ khi có lý do cụ thể.',
        ],
        bullets: [
          'Tranh giành trung tâm (các ô e4, d4, e5, d5) bằng tốt và quân. Quân ở trung tâm đi được nhiều ô hơn.',
          'Phát triển mã và tượng nhanh, thường là mã trước tượng, tránh đi một quân hai lần hoặc đưa hậu ra sớm.',
          'Nhập thành sớm để giấu vua và đưa xe vào giữa, rồi nối hai xe với nhau.',
        ],
        tip: {
          title: 'Một khai cuộc cho người mới theo đủ các nguyên tắc',
          text: 'Cầm Trắng, đi e4, rồi Nf3, rồi Bc4, nhập thành, rồi d3 hoặc c3 và d4. Đây là Khai cuộc Ý (Italian Game). Ví dụ bên dưới trình bày nó; hãy thử nói mỗi nước theo nguyên tắc nào.',
        },
      },
      tactics: {
        title: 'Chiến thuật: ba đòn cơ bản',
        body: [
          'Chiến thuật là một chuỗi nước ép buộc ngắn để thắng quân hoặc chiếu hết. Hầu hết các ván dưới trình độ cao thủ được quyết định bằng chiến thuật, nên hãy học cách nhận ra ba mẫu này.',
        ],
        bullets: [
          'Đòn đôi (fork): một quân tấn công hai hoặc nhiều mục tiêu cùng lúc, đối phương chỉ cứu được một. Mã là quân đánh đòn đôi giỏi nhất vì hầu hết quân khác không thể phản công.',
          'Ghim (pin): một quân không thể đi vì phía sau nó trên cùng đường có quân đắt hơn (hoặc vua). Ghim vào vua là ghim tuyệt đối: quân bị ghim không được phép đi.',
          'Xiên (skewer): ngược với ghim. Quân đắt bị tấn công phải rời đi, và để lộ quân đứng sau nó.',
        ],
        tip: {
          title: 'Cách tìm chiến thuật',
          text: 'Hãy xem các nước chiếu, bắt quân và đe doạ trước, theo thứ tự đó, cho cả hai bên. Tự hỏi quân địch nào không được bảo vệ hoặc nằm thẳng hàng với vua.',
        },
      },
      mating: {
        title: 'Các thế chiếu hết cơ bản',
        body: [
          'Thế hơn chỉ thành thắng khi bạn kết thúc được ván cờ. Hai mẫu này xuất hiện rất thường xuyên.',
        ],
        bullets: [
          'Chiếu hết hàng cuối (back-rank): vua kẹt sau các tốt của chính mình ở hàng đầu (hoặc hàng cuối) bị xe hoặc hậu chiếu dọc hàng đó và không còn ô để chạy. Sau khi nhập thành, hãy đi một tốt để vua có ô thoát ("luft").',
          'Chiếu hết kiểu bậc thang (hai xe): hai xe cắt bàn cờ thành các dải. Một xe chiếu dọc một hàng, vua bước sang hàng kế, và xe kia chiếu ở đó. Hai xe nhảy qua nhau lên từng hàng cho đến khi vua bị chiếu hết ở mép bàn.',
        ],
      },
      endgame: {
        title: 'Ý tưởng tàn cuộc: vua thành quân chiến đấu',
        body: [
          'Khi còn ít quân trên bàn, vua đủ an toàn để tham chiến. Hãy đưa vua vào giữa và dùng nó yểm trợ các quân tốt.',
          'Đối vương (opposition): hai vua đứng đối mặt trên cùng cột hoặc hàng với đúng một ô ở giữa. Bên phải đi sẽ phải né sang bên và nhường vua kia tiến lên. Trong tàn cuộc vua và tốt, ai nắm đối vương thường quyết định tốt có phong cấp được hay không.',
        ],
        bullets: [
          'Đẩy các tốt thông (không có tốt địch phía trước hoặc ở các cột kề bên). Tốt thông là lợi thế lớn ở tàn cuộc.',
          'Giữ xe hoạt động, trên cột mở và hàng thứ bảy, thay vì đứng thụ động bảo vệ tốt.',
          'Học các thế chiếu hết cơ bản: vua và hậu đấu vua, vua và xe đấu vua.',
        ],
      },
      habits: {
        title: 'Lỗi thường gặp và cách luyện tập',
        body: [
          'Hầu hết ván thua ở trình độ dưới câu lạc bộ là do một nước sai, không phải do kế hoạch sâu. Vài thói quen sau loại bỏ gần hết lỗi đó.',
        ],
        bullets: [
          'Kiểm tra sai lầm: trước mỗi nước, nhìn ô quân sắp đến và mọi quân mà nó thôi bảo vệ.',
          'Đừng dùng một quân đi ăn quân ở khai cuộc, và đừng bỏ qua đe doạ của đối phương khi bạn đang tấn công.',
          'Giải vài bài chiến thuật mỗi ngày. Lặp lại các mẫu ở trên là cách tiến bộ nhanh nhất.',
          'Xem lại mỗi ván thua: tìm nước đầu tiên làm thế cờ xấu đi và tự hỏi mình đã bỏ sót gì.',
          'Chơi ván dài (từ 10 phút mỗi bên) khi đang học, để có thời gian suy nghĩ.',
        ],
      },
    },
    examples: {
      start: {
        title: 'Thế xếp quân ban đầu',
        caption:
          'Hãy xoay bàn cờ và đọc các chữ cột a đến h và số hàng 1 đến 8 quanh bàn. Trắng ở phía dưới. Chú ý hai hậu đối mặt nhau ở d1 và d8, hai vua ở e1 và e8.',
      },
      rook: {
        title: 'Xe',
        caption:
          'Xe đi bao nhiêu ô cũng được theo đường thẳng, dọc hàng hoặc cột, nhưng không đi chéo. Từ d4 trên bàn trống, xe tới được 14 ô. Xe mạnh nhất trên cột mở, nơi không có tốt cản đường.',
      },
      bishop: {
        title: 'Tượng',
        caption:
          'Tượng đi bao nhiêu ô cũng được theo đường chéo. Nó luôn ở trên màu ô mà nó xuất phát, nên mỗi bên có một tượng ô sáng và một tượng ô tối. Vì chỉ kiểm soát một nửa số ô, hai tượng phối hợp với nhau rất có giá trị.',
      },
      queen: {
        title: 'Hậu',
        caption:
          'Hậu đi như xe cộng tượng: bao nhiêu ô cũng được theo đường thẳng hoặc đường chéo. Hậu là quân mạnh nhất (9 điểm), nên hãy đưa hậu ra cẩn thận để không bị các quân nhỏ hơn đuổi.',
      },
      knight: {
        title: 'Mã',
        caption:
          'Mã đi theo hình chữ L: hai ô theo một hướng rồi một ô sang bên. Đây là quân duy nhất nhảy qua được quân khác, rất hữu ích khi thế cờ đông đúc. Từ trung tâm mã tới được 8 ô, ở góc chỉ tới được 2 ô.',
      },
      king: {
        title: 'Vua',
        caption:
          'Vua đi một ô theo mọi hướng. Vua không bao giờ được đi vào ô bị quân địch tấn công, và hai vua không bao giờ được đứng cạnh nhau. Hãy giữ vua an toàn: đây là quân bạn không được phép mất.',
      },
      pawnStart: {
        title: 'Tốt: cách đi',
        caption:
          'Tốt đi thẳng về phía trước một ô. Từ ô xuất phát, nó có thể tiến hai ô. Tốt không bao giờ đi lùi và không bắt được quân đứng ngay trước mặt, nên tốt có thể bị chặn.',
      },
      pawnCapture: {
        title: 'Tốt: cách bắt quân',
        caption:
          'Tốt bắt quân theo đường chéo phía trước một ô, khác với cách đi. Ở đây tốt Trắng ở e4 có thể bước lên e5 hoặc bắt một trong hai tốt Đen ở d5 và f5.',
      },
      castling: {
        title: 'Nhập thành ngắn và dài',
        caption:
          'Trắng nhập thành cánh vua (O-O): vua đến g1 và xe từ h1 sang f1. Sau đó Đen nhập thành cánh hậu (O-O-O): vua đến c8 và xe từ a8 sang d8. Chỉ một nước vừa giấu được vua vừa đưa xe vào hoạt động.',
      },
      enPassant: {
        title: 'Bắt tốt qua đường',
        caption:
          'Đen vừa đi d7-d5, lướt qua cạnh tốt Trắng ở e5. Trắng có thể bắt "qua đường" bằng exd6: tốt đến d6, ô mà tốt Đen đã bỏ qua, và tốt Đen ở d5 bị lấy khỏi bàn. Vòng đỏ đánh dấu quân bị bắt.',
      },
      promotion: {
        title: 'Phong cấp',
        caption:
          'Tốt Trắng đến a8 và thành hậu kèm chiếu. Chọn mã hoặc quân khác gọi là phong cấp thấp, hiếm gặp, nhưng đôi khi mã chiếu được trong khi hậu thì không.',
      },
      check: {
        title: 'Chiếu',
        caption:
          'Xe đi tới a8 và tấn công vua Đen dọc hàng cuối. Ô vua chuyển đỏ. Đen đáp bằng cách đưa vua sang d7, ra khỏi đường tấn công.',
      },
      foolsMate: {
        title: 'Chiếu hết ngu ngốc: ván cờ ngắn nhất',
        caption:
          'Sau 1.f3 e5 2.g4, Đen đi Qh4#. Vua Trắng bị tấn công trên đường chéo h4 đến e1, và các tốt có thể chắn đã đi chỗ khác. Đây là lời nhắc đừng mở đường chéo trước mặt vua mình.',
      },
      stalemate: {
        title: 'Hết nước đi (stalemate)',
        caption:
          'Đến lượt Đen. Vua ở h8 không bị chiếu, nhưng mọi ô nó có thể đi (g8, h7, g7) đều bị tấn công, và Đen không còn quân nào khác. Không có nước hợp lệ và không bị chiếu, ván cờ hoà dù Trắng hơn một hậu.',
      },
      italian: {
        title: 'Khai cuộc Ý',
        caption:
          'Trắng chiếm trung tâm (e4), phát triển mã (Nf3) và tượng (Bc4) nhắm vào f7, rồi chuẩn bị d4 bằng c3. Đen làm tương tự. Mỗi nước đều theo một nguyên tắc: trung tâm, phát triển quân, và kế hoạch nhập thành tiếp theo.',
      },
      scholar: {
        title: 'Chiếu hết thầy giáo: một cái bẫy và cách tránh',
        caption:
          'Trắng đưa hậu và tượng ra ngay để đánh vào ô f7 yếu, chỉ có vua bảo vệ. Nf6 của Đen tấn công hậu nhưng bỏ qua đe doạ, và Qxf7# kết thúc ván. Hãy bảo vệ f7 (ví dụ bằng ...Qe7 hoặc ...g6) thì bẫy không thành.',
      },
      fork: {
        title: 'Đòn đôi (fork)',
        caption:
          'Nd6+ chiếu vua ở e8 và đồng thời tấn công xe ở b7 (các vòng đỏ). Vua phải đi, rồi mã ăn xe miễn phí. Mã đánh đòn đôi tốt vì nó tấn công theo kiểu mà hầu hết quân không đáp trả được.',
      },
      pin: {
        title: 'Ghim (pin)',
        caption:
          'Sau 3.Bb5, mã ở c6 bị ghim vào vua ở e8: nếu nó đi, tượng sẽ chiếu, nên nó không được phép đi. Trắng giờ có thể dồn thêm quân tấn công quân bị ghim.',
      },
      skewer: {
        title: 'Xiên (skewer)',
        caption:
          'Xe chiếu vua ở e5 dọc hàng năm. Hậu Đen ở a5 đứng sau vua trên cùng đường. Vua phải rời khỏi đường, rồi xe bắt hậu.',
      },
      backRank: {
        title: 'Chiếu hết hàng cuối',
        caption:
          'Vua Đen bị các tốt của chính mình ở f7, g7 và h7 bao kín. Ra8# chiếu dọc hàng tám, không thể chặn hay bắt, nên là chiếu hết. Chỉ cần đi một tốt trước đó thì vua đã có ô thoát.',
      },
      ladder: {
        title: 'Chiếu hết bậc thang bằng hai xe',
        caption:
          'Xe ở a6 chặn vua đi xuống. Rb7+ chiếu và ép vua về hàng cuối, rồi Ra8# kết thúc. Hai xe nhảy qua nhau từng hàng như leo thang.',
      },
      opposition: {
        title: 'Đối vương',
        caption:
          'Hai vua đối mặt ở e4 và e6 với một ô ở giữa, và đang là lượt Trắng. Trắng phải né sang bên, nên vua Đen tiến lên được (ví dụ d5 hoặc f5). Nắm đối vương nghĩa là người kia phải đi.',
      },
    },
    sourcesTitle: 'Nguồn tham khảo',
    sources: [
      'Luật cờ vua FIDE (luật chính thức)',
      'Lichess: Learn chess (bài học tương tác)',
      'Wikipedia: Rules of chess',
      'Wikipedia: Chess tactics và các thế chiếu hết',
      'chess.js (bộ sinh nước đi phía sau mọi ví dụ)',
    ],
  },
});
