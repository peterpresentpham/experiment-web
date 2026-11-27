import type { TCaroExampleId, TCaroLevel, TCaroSectionId } from 'src/configs/caroGuide.config';
import { defineMessages } from '../define';

type TSection = {
  title: string;
  body: Array<string>;
  bullets?: Array<string>;
  tip?: { title: string; text: string };
};

type TExampleText = { title: string; caption: string };

export const caroGuideMessages = defineMessages<{
  title: string;
  intro: string;
  levels: Record<TCaroLevel, { label: string; hint: string }>;
  howTo: string;
  board: {
    play: string;
    pause: string;
    replay: string;
    toStart: string;
    toEnd: string;
    stepBack: string;
    stepForward: string;
    position: (move: number, total: number) => string;
    start: string;
    x: string;
    o: string;
    cell: (name: string, stone: string, move?: number) => string;
  };
  sections: Record<TCaroSectionId, TSection>;
  examples: Record<TCaroExampleId, TExampleText>;
  playLink: string;
  sourcesTitle: string;
  // Same order as `SOURCE_URLS` in the view.
  sources: Array<string>;
}>({
  en: {
    title: 'Learn caro (five in a row)',
    intro:
      "Caro is a game of two players and one goal: five of your marks in a row. The rules fit in one sentence, but the game is deep, and it has one rule that changes everything: a five blocked at both ends does not win. This guide goes from the rules to the shapes every player must recognise, then to the tactics that decide games, and ends with what this site's Hell level, a strong engine, has taught us about openings and about who wins.",
    levels: {
      beginner: { label: '1. Beginner', hint: 'Rules · blocked ends · shapes · defence' },
      intermediate: { label: '2. Intermediate', hint: 'Fake open fours · double threats · VCF' },
      advanced: { label: '3. From the Hell level', hint: 'First move · opening · how to beat it' },
    },
    howTo:
      'How to read the boards: X always moves first. Use the buttons to play the moves one by one; the latest move is shaded and every played stone carries its move number. Ringed cells are the points the text talks about, and a winning five is highlighted. Cells are named by column letter and row number, like h8.',
    board: {
      play: 'Play',
      pause: 'Pause',
      replay: 'Play again',
      toStart: 'To the start',
      toEnd: 'To the end',
      stepBack: 'Previous move',
      stepForward: 'Next move',
      position: (move, total) => `Move ${move} of ${total}`,
      start: 'Start position',
      x: 'X',
      o: 'O',
      cell: (name, stone, move) => `${name}: ${stone || 'empty'}${move ? `, move ${move}` : ''}`,
    },
    sections: {
      board: {
        title: 'The board and how to win',
        body: [
          'Two players take turns putting their mark, X or O, on an empty cell. X always starts. You cannot pass, and a mark never moves or leaves the board.',
          'The first player to get five marks in an unbroken line wins: across, down or along either diagonal. On this site the board is 15 by 15 or 20 by 20 (20 by 20 by default), big enough that the edges rarely matter.',
        ],
        bullets: [
          'Six or more in a row also wins here. Some variants (gomoku, renju) refuse an overline; Vietnamese caro does not.',
          'A full board with no five is a draw, but on a big board that almost never happens.',
        ],
      },
      blockRule: {
        title: 'The blocked-ends rule',
        body: [
          'Vietnamese caro is usually played with one extra rule, the default on this site: a five does not win when both of its ends are blocked by the opponent\'s marks. The five has to be "alive" at one end at least.',
          'Only opponent marks block. The edge of the board does not count as a block, so a five against the edge wins as long as the other end is not an opponent mark. With the rule switched off ("Free" in the game settings), any five wins.',
        ],
        tip: {
          title: 'Why it matters',
          text: 'The rule makes defending stronger: a line that is already capped at one end can be killed by a single mark at the other end, even after it grows to five. Many shapes that win in plain gomoku are only half as dangerous here. The intermediate level shows the trap it creates.',
        },
      },
      shapes: {
        title: 'The shapes: threes and fours',
        body: [
          'You do not need to read the whole board. Strong players look for a few shapes, because each one tells you who must answer and how fast.',
          'A three is three marks that can become an unstoppable open four with one more move. If both ends are free it is an open three (a live three) and must be answered at once. A three with a gap in it (a split three) is just as dangerous. A three blocked at one end is a closed three: it can still make a four, but that four can be stopped.',
          'A four needs one more mark to make five. It must be blocked immediately, at the one cell that completes it. An open four has two such cells: the opponent can only block one, so an open four wins.',
        ],
        bullets: [
          'Open three: answer it now, or it becomes an open four.',
          'Four: block it now, at the cell that makes five.',
          'Open four: the game is over; you can only make it not happen in the first place.',
        ],
      },
      defence: {
        title: 'Defending: the order of priorities',
        body: [
          'Most lost games are lost by a missed block, not by a brilliant attack. Before every move, go through this list from the top and stop at the first line that applies.',
        ],
        bullets: [
          'Can you make five? Play it.',
          'Does the opponent have a four? Block the cell that completes it.',
          'Can you make an open four, or a four that also makes an open three? Play it: it wins.',
          'Does the opponent have an open three? Block it, or answer with a four of your own first (a four must be answered, so it buys you a move).',
          "Otherwise build: put your mark where it extends your own lines and cuts the opponent's.",
        ],
        tip: {
          title: 'Blocking a split three',
          text: 'Block a split three (like g8 h8 _ j8) in the gap. A mark at either end leaves a four the opponent can still make; a mark in the gap breaks the shape for good.',
        },
      },
      blockedEnds: {
        title: 'Blocked ends: the fake open four',
        body: [
          'Under the blocked-ends rule, a four with two free completing cells is not always an open four. If an opponent mark sits one cell past one end (like _ X X X X _ O), the defender plays the other free cell: now one completion is taken, and the other would make a five with an opponent mark at both ends, which does not win.',
          'The same idea turns open threes into weak ones. Before you count a line as open, look one cell further than the free ends: an opponent mark there can close the whole line with a single move.',
        ],
        tip: {
          title: 'A lesson from building the engine',
          text: 'Even this site\'s machine got this wrong at first: its shape table counted "two free completing cells" as an open four, so it panicked or attacked at the wrong time under the blocked-ends rule. The fix was to ask, for every free cell, whether one opponent mark there would kill every five.',
        },
      },
      doubleThreats: {
        title: 'Double threats: four-three and three-three',
        body: [
          'A single threat can always be blocked. Games are won by a move that makes two threats at once, because the opponent only gets one move to answer both.',
          'A four-three makes a four (which must be blocked at once) and an open three on another line. After the forced block the three becomes an open four. A three-three makes two open threes: the opponent blocks one, the other becomes an open four. A four-four (two fours) wins even faster.',
        ],
        bullets: [
          'Unlike renju, Vietnamese caro allows every double threat for both players.',
          'When you see the opponent can make a double threat next move, block the shared cell now, before it is played.',
        ],
      },
      vcf: {
        title: 'Winning by continuous fours (VCF)',
        body: [
          'A VCF (victory by continuous fours) is a sequence in which every attacking move makes a four. The opponent has no choice: each four must be blocked in one exact cell, so you can calculate the whole line in your head. It ends with a double four or a four-three that cannot be stopped.',
          'Its big brother, the VCT (victory by continuous threats), also uses open threes. It is stronger but harder to calculate, because a three can be answered in more than one way.',
          'Engines are built around this idea. The Hard level of this site searches for VCF and VCT sequences before anything else, and the engines of the Hell level do the same thing deep inside their search.',
        ],
        tip: {
          title: 'Practise it',
          text: 'Before each move, count your own fours: could a chain of them end in a double threat? Then do the same for the opponent. Most games between good players are decided by the first player who finds a VCF.',
        },
      },
      firstMove: {
        title: 'Moving first is a huge advantage',
        body: [
          'Gomoku on a 15 by 15 board without restrictions has been solved: the first player wins with perfect play (L. Victor Allis, 1994). The blocked-ends rule makes defending easier, but our engine tests show the first move is still close to decisive.',
          'Measured while building the Hell level: the Tengen engine playing itself at one second a move, the first player won 80 games out of 80. Playing second against itself with four times the thinking time, it avoided defeat in only 3 games out of 40 on a 15 by 15 board, and 1 out of 40 on 20 by 20. Rapfi, the engine that plays the Hell level now, won all 36 games it played first in our book tests.',
        ],
        bullets: [
          'If you want to beat the machine, choose to move first. Every human win on the deployed site so far came from moving first.',
          'When the machine moves first it won its two recorded games in 11 and 13 moves.',
          'Playing second, aim to defend with marks that also build your own lines, so that your blocks turn into threats later.',
        ],
      },
      opening: {
        title: 'The opening: what the Hell level plays',
        body: [
          'Start near the middle: lines need room to grow in every direction. The Hell level uses an opening book: for the first moves it does not think, it plays replies that a long engine analysis chose in advance (2,489 positions).',
          'Its answer to a first move in the middle is always the diagonal neighbour. When X then makes a diagonal two, the book blocks the end farther from its own mark.',
        ],
        bullets: [
          'The book is built by asking the engine, for each position, which reply leaves the first player the least: among replies of equal value it picks one at random, so the machine does not repeat itself.',
          'It only covers the first few moves. After that the engine searches, which is when good players start to find chances.',
        ],
      },
      realGame: {
        title: 'A game the machine lost',
        body: [
          'Three players beat the Hell level on the deployed site in its first week, all moving first, and all with the same opening shape (two of them shifted by one column). This is one of those games, replayed move by move.',
          "Moves 4 (j12) and 6 (m12) are the machine's, from its old opening book. A long analysis later found that after m12 the player had a forced win. Then a VCF finished it: m7, p10 and o9 are all fours, and o9 makes two at once (l6 and q11), so the machine could block only one.",
        ],
        bullets: [
          'The book was rebuilt and deepened after these games: at move 4 it now plays m9, and positions that strong players reached are checked at depth. In a test where a strong player chose every move, the number of openings already lost when the book runs out went from 13 out of 60 to 0.',
          'The machine also remembers lost games in your browser: a move that lost is avoided next time. It now recognises a position by its shape, so the same opening shifted to another part of the board is caught too, as in the two shifted games.',
        ],
      },
      beatHell: {
        title: 'How to beat the Hell level',
        body: [
          'To find out, a stronger copy of Rapfi (4 seconds a move) played first against the Hell level 150 times, with the Hell level as the site plays it on a slow device: its opening book, then Rapfi at 2 seconds a move on one thread. For its first three moves the attacker picked at random among its near-best moves, so the games cover many openings. It won 130 games, the Hell level won 14, and 6 filled the board.',
          "The book covered the machine's first three moves in every game, and none of the 130 losses came from a book move: each time, the forced win appeared right after a move the engine had chosen by searching. So the opening's job is to leave the book with the initiative; the game is won in the middle.",
          'The lines below start with X at k11 in the middle, which the machine always answers with j10. Mirrored across the k11 to j10 diagonal they work the same (l10 becomes j12, m10 becomes j13).',
        ],
        bullets: [
          'l10, the best line: the book answers m9; play i12, and the book plays m11. Then the engine takes over, and in all 6 of these games the attacker had a forced win by its 5th or 6th move (first example).',
          'm10: the book answers l11; play n10. The attacker won all 8 of these games (second example).',
          'l11: the book answers m11; play k12. The attacker won 26 of 29.',
          'j8 won all 10 games, whatever the book answered. l9 was the weakest: after the reply m9, k10 won only 2 of 7.',
          'After the opening: half of the forced wins appeared between your 7th and 19th move, and most games ended with a run of 2 to 4 fours. Keep making threes and fours that force answers near your own stones, and before every move look for a four-three or a VCF.',
        ],
        tip: {
          title: 'It learns from you',
          text: 'The machine remembers in your browser the games it lost, and avoids the move that lost next time. Replaying a won game move for move rarely works twice: learn the openings and the ideas, not the moves. On a fast device it also thinks with up to 4 threads, so it is a little stronger than in these tests.',
        },
      },
      practice: {
        title: 'How to practise',
        body: [
          'Play the machine from the Easy level up. Move first while you learn, and after every loss step back to the move where the opponent got a four or an open three you did not see.',
          'Every level from Easy up plays the Tengen engine, limited in how far ahead it looks: Easy looks one move ahead and often picks a weaker move on purpose, Medium three moves, and Hard eight, with the opening book and the lessons from games it lost. Hell is Rapfi, a far stronger engine. Beating Hard consistently is a real achievement.',
        ],
      },
    },
    examples: {
      five: {
        title: 'Five in a row wins',
        caption: 'X plays j8 and makes f8 to j8: five in a row, across.',
      },
      overline: {
        title: 'Six in a row also wins',
        caption: 'X fills the gap at i8: six in a row, f8 to k8. Caro counts it as a win.',
      },
      blockedFive: {
        title: 'Blocked at both ends: no win',
        caption:
          'X makes f8 to j8, but O already stands at e8 and k8. Under the blocked-ends rule this five does not count and the game goes on.',
      },
      edgeFive: {
        title: 'The edge is not a block',
        caption:
          'X makes a8 to e8 against the left edge. O blocks the right end at f8, but the edge does not count, so X wins.',
      },
      openThree: {
        title: 'Open three',
        caption:
          'g8 h8 i8 with f8 and j8 free (and room beyond). If O does not answer, X plays f8 or j8 and gets an open four. O must block at f8 or j8.',
      },
      splitThree: {
        title: 'Split three',
        caption:
          'g8 h8 _ j8 is also an open three: X at i8 makes an open four. The ringed cells are the possible blocks; the gap i8 is the best one.',
      },
      closedThree: {
        title: 'Closed three',
        caption:
          'O already stands at f8. X can still make a four (j8), but O will block it at k8. Not urgent.',
      },
      four: {
        title: 'Four',
        caption: 'O at f8 caps one end. X wins at k8 next move unless O blocks it right now.',
      },
      openFour: {
        title: 'Open four',
        caption:
          'g8 to j8 with f8 and k8 both free: O can block only one of them, X plays the other and wins.',
      },
      blockGap: {
        title: 'Block a split three in the gap',
        caption:
          'O plays i8. The ends f8 or k8 would still let X make a four; the gap breaks the line completely.',
      },
      fakeOpenFour: {
        title: 'The fake open four',
        caption:
          'X has g8 to j8 with f8 and k8 free, but O stands at l8. O plays f8, and now X at k8 makes a five with O at both ends: no win. Without the blocked-ends rule this would be an open four.',
      },
      fourThree: {
        title: 'Four-three',
        caption:
          'X j8 makes a four across (O must block k8) and an open three down (j6 j7 j8). X j9 then makes an open four down the column, and j5 completes it.',
      },
      doubleThree: {
        title: 'Three-three',
        caption:
          'X i8 makes two open threes: across (g8 h8 i8) and down (i6 i7 i8). O blocks the column at i9, so X plays j8 for an open four across and wins at k8.',
      },
      vcf: {
        title: 'A VCF',
        caption:
          'Every X move is a four. i8 forces j8. i9 makes two fours at once (down the i column and along the diagonal h8 i9 j10 k11): O blocks i7, X wins at g7.',
      },
      bookOpening: {
        title: "The first moves from the Hell level's book (20x20)",
        caption:
          'X starts at k11 in the middle; the machine answers on the diagonal at j10. X makes a diagonal two with l10, and the book blocks its far end at m9.',
      },
      realGame: {
        title: 'A real game the machine lost (39 moves)',
        caption:
          "Ringed: the old book's moves 4 and 6. Step through to the end: from move 33 the player plays a VCF (m7, p10, o9) and wins on the diagonal l6 to p10.",
      },
      hellLineA: {
        title: 'Beating the Hell level: the l10 line (25 moves)',
        caption:
          "Moves 1 to 6 are the line above, the machine's from its book. Ringed: h14, its first move found by searching, after which X has a forced win. From move 19 every X move is a four (l12, l13), i10 makes two at once (h9 and m14), and h9 completes the diagonal h9 to l13.",
      },
      hellLineB: {
        title: 'Beating the Hell level: the m10 line (27 moves)',
        caption:
          "The book plays j10, l11 and j9. Ringed: j7, the machine's first searched move, which lets X win. X builds on the right side; l12 makes two fours at once (k12 and p12), and k12 wins along row 12.",
      },
    },
    playLink: 'Play caro against the machine',
    sourcesTitle: 'References',
    sources: [
      'Wikipedia: Gomoku (rules, variants, solved status)',
      'Wikipedia (Vietnamese): Cờ caro',
      'L. V. Allis, Searching for Solutions in Games and Artificial Intelligence (1994): gomoku is a first-player win',
      'Gomocup: the gomoku and renju engine tournament',
      'Rapfi: the engine behind the Hell level',
    ],
  },
  vi: {
    title: 'Học chơi cờ caro',
    intro:
      'Caro là trò chơi của hai người với một mục tiêu: có năm quân của mình thẳng hàng. Luật chỉ cần một câu, nhưng cách chơi rất sâu, và có một luật làm thay đổi tất cả: năm quân bị chặn cả hai đầu thì không thắng. Bài này đi từ luật chơi đến các thế cờ ai cũng phải nhận ra, rồi các đòn quyết định ván cờ, và kết thúc bằng những gì cấp Địa ngục (một engine rất mạnh) của trang này cho thấy về khai cuộc và về việc ai sẽ thắng.',
    levels: {
      beginner: { label: '1. Người mới', hint: 'Luật · chặn hai đầu · các thế · phòng thủ' },
      intermediate: { label: '2. Trung cấp', hint: 'Bốn mở giả · đòn đôi · chuỗi bốn (VCF)' },
      advanced: { label: '3. Từ cấp Địa ngục', hint: 'Đi trước · khai cuộc · cách thắng máy' },
    },
    howTo:
      'Cách xem bàn cờ: X luôn đi trước. Bấm các nút để xem từng nước; nước vừa đi được tô nền và mỗi quân đã đi có số thứ tự nước. Ô có vòng là điểm bài viết nhắc tới, năm quân thắng được tô sáng. Ô được gọi theo chữ cột và số hàng, ví dụ h8.',
    board: {
      play: 'Phát',
      pause: 'Tạm dừng',
      replay: 'Phát lại',
      toStart: 'Về đầu',
      toEnd: 'Đến cuối',
      stepBack: 'Nước trước',
      stepForward: 'Nước sau',
      position: (move, total) => `Nước ${move}/${total}`,
      start: 'Thế ban đầu',
      x: 'X',
      o: 'O',
      cell: (name, stone, move) => `${name}: ${stone || 'trống'}${move ? `, nước ${move}` : ''}`,
    },
    sections: {
      board: {
        title: 'Bàn cờ và cách thắng',
        body: [
          'Hai người lần lượt đánh dấu của mình, X hoặc O, vào một ô trống. X luôn đi trước. Không được bỏ lượt, và quân đã đặt thì không di chuyển hay bị bỏ đi.',
          'Ai có trước năm quân liền nhau trên một đường thẳng thì thắng: hàng ngang, hàng dọc hoặc một trong hai đường chéo. Trên trang này bàn cờ là 15×15 hoặc 20×20 (mặc định 20×20), đủ rộng để mép bàn ít khi quan trọng.',
        ],
        bullets: [
          'Sáu quân trở lên liền nhau cũng tính thắng. Một số biến thể (gomoku, renju) không công nhận, caro Việt Nam thì có.',
          'Kín bàn mà không ai có năm thì hoà, nhưng trên bàn lớn gần như không bao giờ xảy ra.',
        ],
      },
      blockRule: {
        title: 'Luật chặn hai đầu',
        body: [
          'Caro ở Việt Nam thường chơi thêm một luật, cũng là luật mặc định trên trang này: năm quân không thắng nếu cả hai đầu đều bị quân đối phương chặn. Năm quân phải còn "sống" ít nhất một đầu.',
          'Chỉ quân đối phương mới tính là chặn. Mép bàn không tính, nên năm quân sát mép vẫn thắng nếu đầu còn lại không phải quân đối phương. Khi tắt luật này (chọn "Tự do" trong cài đặt ván), cứ có năm là thắng.',
        ],
        tip: {
          title: 'Vì sao luật này quan trọng',
          text: 'Luật này giúp bên phòng thủ mạnh hơn: một đường đã bị chặn một đầu có thể bị "giết" chỉ bằng một quân ở đầu kia, kể cả khi nó đã dài thành năm. Nhiều thế thắng trong gomoku thường chỉ còn nguy hiểm một nửa ở đây. Phần trung cấp sẽ chỉ ra cái bẫy mà luật này tạo ra.',
        },
      },
      shapes: {
        title: 'Các thế: ba và bốn',
        body: [
          'Bạn không cần đọc cả bàn cờ. Người chơi giỏi chỉ tìm vài thế, vì mỗi thế cho biết ai phải đỡ và phải đỡ ngay hay chưa.',
          'Thế ba là ba quân mà chỉ thêm một nước nữa sẽ thành bốn mở không chặn được. Nếu hai đầu đều trống thì đó là ba mở (ba sống) và phải đỡ ngay. Ba có một ô trống ở giữa (ba gãy) cũng nguy hiểm như vậy. Ba đã bị chặn một đầu là ba chết: vẫn thành bốn được, nhưng bốn đó chặn được.',
          'Thế bốn chỉ cần thêm một quân là thành năm. Phải chặn ngay, đúng ô hoàn thành nó. Bốn mở có hai ô như vậy: đối phương chỉ chặn được một, nên bốn mở là thắng.',
        ],
        bullets: [
          'Ba mở: đỡ ngay, nếu không nó thành bốn mở.',
          'Bốn: chặn ngay, đúng ô tạo thành năm.',
          'Bốn mở: ván cờ đã kết thúc; chỉ có cách không để nó xuất hiện từ đầu.',
        ],
      },
      defence: {
        title: 'Phòng thủ: thứ tự ưu tiên',
        body: [
          'Phần lớn ván thua là do bỏ sót một nước chặn, không phải do đối phương tấn công quá hay. Trước mỗi nước, đi lần lượt từ trên xuống danh sách này và dừng ở dòng đầu tiên đúng.',
        ],
        bullets: [
          'Mình tạo được năm không? Đi ngay.',
          'Đối phương có bốn không? Chặn ô hoàn thành nó.',
          'Mình tạo được bốn mở, hoặc một nước vừa thành bốn vừa thành ba mở không? Đi ngay: đó là nước thắng.',
          'Đối phương có ba mở không? Chặn, hoặc đánh một nước bốn của mình trước (bốn bắt buộc phải đỡ, nên mình được thêm một nước).',
          'Nếu không có gì ở trên thì phát triển: đặt quân ở chỗ vừa nối dài đường của mình vừa cắt đường của đối phương.',
        ],
        tip: {
          title: 'Chặn ba gãy',
          text: 'Chặn ba gãy (như g8 h8 _ j8) vào ô trống ở giữa. Chặn ở một đầu thì đối phương vẫn tạo được bốn; chặn vào giữa thì đường đó hỏng hẳn.',
        },
      },
      blockedEnds: {
        title: 'Chặn hai đầu: bốn mở giả',
        body: [
          'Với luật chặn hai đầu, một thế bốn có hai ô hoàn thành chưa chắc đã là bốn mở. Nếu có quân đối phương nằm cách một đầu một ô (như _ X X X X _ O), bên phòng thủ đánh vào ô trống còn lại: một ô hoàn thành đã bị chiếm, ô kia nếu đi vào sẽ thành năm quân bị chặn cả hai đầu, không thắng.',
          'Cùng ý đó biến ba mở thành ba yếu. Trước khi coi một đường là "mở", hãy nhìn xa hơn đầu trống một ô: nếu có quân đối phương ở đó, chỉ một nước là đóng được cả đường.',
        ],
        tip: {
          title: 'Bài học khi làm engine',
          text: 'Chính máy của trang này lúc đầu cũng sai chỗ này: bảng thế cờ của nó coi "có hai ô hoàn thành" là bốn mở, nên với luật chặn hai đầu nó hoảng hoặc tấn công sai thời điểm. Cách sửa là kiểm tra với từng ô trống: nếu đối phương đặt một quân ở đó, có giết được mọi đường năm không.',
        },
      },
      doubleThreats: {
        title: 'Đòn đôi: bốn-ba và ba-ba',
        body: [
          'Một đe doạ đơn lẻ thì luôn chặn được. Ván cờ được quyết định bằng một nước tạo hai đe doạ cùng lúc, vì đối phương chỉ có một nước để đỡ cả hai.',
          'Bốn-ba tạo một thế bốn (bắt buộc chặn ngay) và một ba mở trên đường khác. Sau nước chặn bắt buộc, ba mở thành bốn mở. Ba-ba tạo hai ba mở: đối phương chặn một, đường kia thành bốn mở. Bốn-bốn (hai thế bốn) còn thắng nhanh hơn.',
        ],
        bullets: [
          'Khác với renju, caro Việt Nam cho phép mọi loại đòn đôi với cả hai bên.',
          'Khi thấy đối phương sắp tạo được đòn đôi ở nước sau, hãy chặn ngay ô giao nhau của hai đường, trước khi họ đi vào đó.',
        ],
      },
      vcf: {
        title: 'Thắng bằng chuỗi bốn (VCF)',
        body: [
          'VCF (victory by continuous fours) là chuỗi nước mà mỗi nước tấn công đều tạo thế bốn. Đối phương không có lựa chọn: mỗi thế bốn phải chặn đúng một ô, nên bạn tính được cả chuỗi trong đầu. Chuỗi kết thúc bằng bốn-bốn hoặc bốn-ba không chặn được.',
          'Người anh của nó là VCT (victory by continuous threats), dùng thêm cả ba mở. Mạnh hơn nhưng khó tính hơn, vì ba mở có nhiều cách đỡ.',
          'Engine được xây quanh ý tưởng này. Cấp Khó của trang này tìm chuỗi VCF và VCT trước mọi thứ khác, và engine của cấp Địa ngục cũng làm vậy ngay trong phần tìm kiếm của nó.',
        ],
        tip: {
          title: 'Luyện tập',
          text: 'Trước mỗi nước, đếm các thế bốn của mình: có chuỗi nào kết thúc bằng đòn đôi không? Rồi làm tương tự cho đối phương. Phần lớn các ván giữa người chơi giỏi được quyết định bởi người tìm ra VCF trước.',
        },
      },
      firstMove: {
        title: 'Đi trước là lợi thế rất lớn',
        body: [
          'Gomoku trên bàn 15×15 không giới hạn đã được giải: bên đi trước thắng nếu chơi hoàn hảo (L. Victor Allis, 1994). Luật chặn hai đầu giúp phòng thủ dễ hơn, nhưng các thử nghiệm engine của chúng tôi cho thấy đi trước vẫn gần như quyết định.',
          'Số liệu đo được khi xây cấp Địa ngục: engine Tengen tự đánh với chính nó, 1 giây mỗi nước, bên đi trước thắng 80/80 ván. Khi đi sau trước chính nó nhưng được nghĩ lâu gấp bốn lần, nó chỉ không thua 3/40 ván trên bàn 15×15 và 1/40 ván trên bàn 20×20. Rapfi, engine đang chơi cấp Địa ngục, thắng cả 36 ván nó đi trước trong các thử nghiệm sách khai cuộc.',
        ],
        bullets: [
          'Muốn thắng máy, hãy chọn đi trước. Mọi ván người chơi thắng trên trang đến nay đều là ván đi trước.',
          'Khi máy đi trước, nó thắng cả hai ván đã ghi lại, sau 11 và 13 nước.',
          'Khi đi sau, hãy phòng thủ bằng những quân đồng thời nối dài đường của mình, để các nước chặn sau này biến thành đe doạ.',
        ],
      },
      opening: {
        title: 'Khai cuộc: cấp Địa ngục đi thế nào',
        body: [
          'Hãy bắt đầu gần giữa bàn: các đường cần chỗ để phát triển về mọi hướng. Cấp Địa ngục dùng sách khai cuộc: với các nước đầu nó không suy nghĩ, mà đi những nước một phân tích engine dài đã chọn sẵn (2.489 thế cờ).',
          'Khi người chơi đi nước đầu ở giữa, máy luôn đáp vào ô chéo bên cạnh. Khi X tạo một đường hai chéo, sách chặn ở đầu xa quân của máy hơn.',
        ],
        bullets: [
          'Sách được tạo bằng cách hỏi engine, với từng thế cờ, nước đáp nào để lại ít cơ hội nhất cho bên đi trước. Giữa các nước tốt ngang nhau, máy chọn ngẫu nhiên để không lặp lại chính mình.',
          'Sách chỉ có vài nước đầu. Sau đó engine tự tìm kiếm, và đó là lúc người chơi giỏi bắt đầu tìm ra cơ hội.',
        ],
      },
      realGame: {
        title: 'Một ván máy đã thua',
        body: [
          'Trong tuần đầu tiên trên trang chính thức, ba người chơi đã thắng cấp Địa ngục, đều là đi trước và đều với cùng một hình khai cuộc (hai ván bị dịch sang một cột). Đây là một trong các ván đó, phát lại từng nước.',
          'Nước 4 (j12) và nước 6 (m12) là của máy, lấy từ sách khai cuộc cũ. Sau này phân tích dài cho thấy sau m12 người chơi đã có đường thắng ép buộc. Cuối ván là một chuỗi VCF: m7, p10 và o9 đều là thế bốn, và o9 tạo hai thế bốn cùng lúc (l6 và q11), máy chỉ chặn được một.',
        ],
        bullets: [
          'Sau các ván này sách được tạo lại và phân tích sâu hơn: ở nước 4 giờ máy đi m9, và các thế cờ người chơi mạnh hay đi tới được kiểm tra kỹ. Trong thử nghiệm mà một người chơi mạnh chọn từng nước, số khai cuộc đã thua sẵn khi hết sách giảm từ 13/60 xuống 0.',
          'Máy cũng nhớ các ván thua trên trình duyệt của bạn: nước nào dẫn đến thua thì lần sau tránh. Giờ nó nhận ra thế cờ theo hình dạng, nên cùng một khai cuộc dịch sang chỗ khác trên bàn cũng bị nhận ra, như hai ván bị dịch cột ở trên.',
        ],
      },
      beatHell: {
        title: 'Cách thắng cấp Địa ngục',
        body: [
          'Để tìm câu trả lời, một bản Rapfi mạnh hơn (4 giây mỗi nước) đã đi trước và đấu 150 ván với cấp Địa ngục, đúng như trang chơi trên một máy chậm: sách khai cuộc, rồi Rapfi 2 giây mỗi nước trên một luồng. Ở ba nước đầu, bên tấn công chọn ngẫu nhiên trong các nước gần tốt nhất, để các ván trải qua nhiều kiểu khai cuộc. Bên tấn công thắng 130 ván, cấp Địa ngục thắng 14, và 6 ván kín bàn.',
          'Ván nào sách cũng đi đủ ba nước đầu của máy, và không ván thua nào trong 130 ván do nước sách: lần nào đường thắng ép buộc cũng xuất hiện ngay sau một nước engine tự tìm kiếm. Vậy việc của khai cuộc là ra khỏi sách mà vẫn giữ thế chủ động; ván cờ được quyết định ở trung cuộc.',
          'Các đường dưới đây bắt đầu bằng X ở k11 giữa bàn, máy luôn đáp j10. Lật đối xứng qua đường chéo k11 đến j10 thì vẫn y như vậy (l10 thành j12, m10 thành j13).',
        ],
        bullets: [
          'l10, đường tốt nhất: sách đáp m9; đi i12, sách đi m11. Sau đó engine tự nghĩ, và trong cả 6 ván theo đường này bên tấn công đã có đường thắng ép buộc ở nước thứ 5 hoặc 6 của mình (ví dụ đầu tiên).',
          'm10: sách đáp l11; đi n10. Bên tấn công thắng cả 8 ván (ví dụ thứ hai).',
          'l11: sách đáp m11; đi k12. Bên tấn công thắng 26/29 ván.',
          'j8 thắng cả 10 ván, sách đáp gì cũng vậy. l9 là yếu nhất: sau khi máy đáp m9, đi k10 chỉ thắng 2/7.',
          'Sau khai cuộc: một nửa số đường thắng ép buộc xuất hiện trong khoảng nước thứ 7 đến 19 của bạn, và phần lớn ván kết thúc bằng một chuỗi 2 đến 4 thế bốn. Hãy liên tục tạo ba và bốn buộc máy phải đỡ, ở gần quân của mình, và trước mỗi nước hãy tìm bốn-ba hoặc một chuỗi VCF.',
        ],
        tip: {
          title: 'Máy học từ bạn',
          text: 'Máy nhớ trên trình duyệt của bạn các ván nó đã thua, và lần sau tránh nước dẫn đến thua. Đi lại y nguyên một ván đã thắng hiếm khi thắng được lần hai: hãy học khai cuộc và ý tưởng, đừng học thuộc nước. Trên máy mạnh nó còn nghĩ với tối đa 4 luồng, nên mạnh hơn một chút so với các thử nghiệm này.',
        },
      },
      practice: {
        title: 'Cách luyện tập',
        body: [
          'Chơi với máy từ cấp Dễ trở lên. Khi đang học hãy đi trước, và sau mỗi ván thua hãy quay lại nước mà đối phương có thế bốn hoặc ba mở bạn đã không thấy.',
          'Từ cấp Dễ trở lên, máy đều chơi bằng engine Tengen, chỉ khác ở chỗ được tính trước bao xa: Dễ tính một nước và hay cố ý chọn nước kém hơn, Trung bình tính ba nước, Khó tính tám nước, có thêm sách khai cuộc và các bài học từ ván thua. Địa ngục là Rapfi, một engine mạnh hơn nhiều. Thắng đều cấp Khó đã là một thành tích thật sự.',
        ],
      },
    },
    examples: {
      five: {
        title: 'Năm quân liền nhau là thắng',
        caption: 'X đi j8, có f8 đến j8: năm quân hàng ngang.',
      },
      overline: {
        title: 'Sáu quân cũng thắng',
        caption: 'X lấp ô trống i8: sáu quân từ f8 đến k8. Caro tính là thắng.',
      },
      blockedFive: {
        title: 'Bị chặn hai đầu: không thắng',
        caption:
          'X có f8 đến j8, nhưng O đã đứng ở e8 và k8. Theo luật chặn hai đầu, năm quân này không tính và ván cờ tiếp tục.',
      },
      edgeFive: {
        title: 'Mép bàn không phải là chặn',
        caption:
          'X có a8 đến e8, sát mép trái. O chặn đầu phải ở f8, nhưng mép bàn không tính, nên X thắng.',
      },
      openThree: {
        title: 'Ba mở',
        caption:
          'g8 h8 i8, hai đầu f8 và j8 trống (và còn chỗ phía sau). Nếu O không đỡ, X đi f8 hoặc j8 thành bốn mở. O phải chặn ở f8 hoặc j8.',
      },
      splitThree: {
        title: 'Ba gãy',
        caption:
          'g8 h8 _ j8 cũng là ba mở: X đi i8 là thành bốn mở. Các ô có vòng là chỗ có thể chặn; ô giữa i8 là tốt nhất.',
      },
      closedThree: {
        title: 'Ba chết',
        caption: 'O đã đứng ở f8. X vẫn tạo được bốn (j8), nhưng O sẽ chặn ở k8. Chưa cần đỡ ngay.',
      },
      four: {
        title: 'Thế bốn',
        caption: 'O ở f8 chặn một đầu. Nước sau X thắng ở k8 nếu O không chặn ngay.',
      },
      openFour: {
        title: 'Bốn mở',
        caption:
          'g8 đến j8, hai đầu f8 và k8 đều trống: O chỉ chặn được một, X đi ô còn lại và thắng.',
      },
      blockGap: {
        title: 'Chặn ba gãy vào giữa',
        caption:
          'O đi i8. Chặn ở f8 hay k8 thì X vẫn tạo được bốn; chặn vào giữa thì đường này hỏng hẳn.',
      },
      fakeOpenFour: {
        title: 'Bốn mở giả',
        caption:
          'X có g8 đến j8, hai ô f8 và k8 trống, nhưng O đứng ở l8. O đi f8, giờ X đi k8 thành năm quân bị O chặn cả hai đầu: không thắng. Nếu không có luật chặn hai đầu thì đây là bốn mở.',
      },
      fourThree: {
        title: 'Bốn-ba',
        caption:
          'X đi j8 vừa thành bốn hàng ngang (O buộc phải chặn k8) vừa thành ba mở hàng dọc (j6 j7 j8). X đi tiếp j9 thành bốn mở hàng dọc, rồi j5 là năm.',
      },
      doubleThree: {
        title: 'Ba-ba',
        caption:
          'X đi i8 tạo hai ba mở: hàng ngang (g8 h8 i8) và hàng dọc (i6 i7 i8). O chặn hàng dọc ở i9, X đi j8 thành bốn mở hàng ngang và thắng ở k8.',
      },
      vcf: {
        title: 'Một chuỗi VCF',
        caption:
          'Nước nào của X cũng là thế bốn. i8 buộc O chặn j8. i9 tạo hai thế bốn cùng lúc (cột i và đường chéo h8 i9 j10 k11): O chặn i7, X thắng ở g7.',
      },
      bookOpening: {
        title: 'Các nước đầu theo sách của cấp Địa ngục (bàn 20×20)',
        caption:
          'X bắt đầu ở k11 giữa bàn; máy đáp chéo ở j10. X tạo đường hai chéo bằng l10, sách chặn đầu xa ở m9.',
      },
      realGame: {
        title: 'Một ván thật máy đã thua (39 nước)',
        caption:
          'Ô có vòng: nước 4 và 6 của sách cũ. Xem đến cuối: từ nước 33 người chơi đánh một chuỗi VCF (m7, p10, o9) và thắng trên đường chéo l6 đến p10.',
      },
      hellLineA: {
        title: 'Thắng cấp Địa ngục: đường l10 (25 nước)',
        caption:
          'Nước 1 đến 6 là đường ở trên, các nước của máy lấy từ sách. Ô có vòng: h14, nước đầu tiên máy tự tìm kiếm, sau đó X đã có đường thắng ép buộc. Từ nước 19 nước nào của X cũng là thế bốn (l12, l13), i10 tạo hai thế bốn cùng lúc (h9 và m14), và h9 hoàn thành đường chéo h9 đến l13.',
      },
      hellLineB: {
        title: 'Thắng cấp Địa ngục: đường m10 (27 nước)',
        caption:
          'Sách đi j10, l11 và j9. Ô có vòng: j7, nước đầu tiên máy tự tìm kiếm, cho X cơ hội thắng. X dồn quân về phía phải; l12 tạo hai thế bốn cùng lúc (k12 và p12), và k12 thắng trên hàng 12.',
      },
    },
    playLink: 'Chơi caro với máy',
    sourcesTitle: 'Nguồn tham khảo',
    sources: [
      'Wikipedia: Gomoku (luật, các biến thể, kết quả đã giải)',
      'Wikipedia tiếng Việt: Cờ caro',
      'L. V. Allis, Searching for Solutions in Games and Artificial Intelligence (1994): gomoku là thế thắng cho bên đi trước',
      'Gomocup: giải đấu engine gomoku và renju',
      'Rapfi: engine đứng sau cấp Địa ngục',
    ],
  },
});
