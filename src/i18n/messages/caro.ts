import { defineMessages } from '../define';

export const caroMessages = defineMessages({
  en: {
    meta: {
      title: 'Caro',
      description: 'Caro (five-in-a-row) with offline, online peer-to-peer and blind modes.',
    },
    title: 'Caro',
    status: {
      turn: (player: number) => `Player ${player}'s turn`,
      win: (player: number) => `Player ${player} wins`,
      draw: "It's a draw",
      yourTurn: 'Your turn',
      opponentTurn: "Opponent's turn",
      youWin: 'You win',
      opponentWins: 'Opponent wins',
      machineThinking: 'Machine is thinking…',
      machineWins: 'Machine wins',
      // Shown next to the side's piece in the header; the full sentences above are announced.
      short: {
        you: 'You',
        opponent: 'Opponent',
        machine: 'Thinking…',
        player: (player: number) => `Player ${player}`,
      },
    },
    blindErrors: (player: number) => `Player ${player} errors`,
    mode: {
      machine: 'vs Machine',
      offline: 'Two players',
      online: 'Online',
      notConnected: 'Not connected',
      label: 'Mode',
      changeAction: 'Change',
      change: (summary: string) => `Game settings: ${summary}. Change settings`,
      rules: { blockOpponent: 'Blocked ends', 'non-blockOpponent': 'Free' },
    },
    cell: (row: number, column: number, piece?: string) =>
      `Row ${row}, column ${column}${piece ? `: ${piece}` : ''}`,
    config: {
      title: 'Caro config',
      playMode: 'Play mode',
      offline: 'Offline',
      online: 'Online',
      machine: 'Machine',
      onlineHint: {
        before: 'When online mode is on, the connection icon',
        middle: '(right next to the settings icon',
        after:
          ') is shown. Follow its instructions to connect with your friend. Press the save button to confirm the changes.',
      },
      gameType: 'Game type',
      normal: 'Normal',
      blind: 'Blind',
      override: 'Override',
      maxErrors: 'Maximum number of errors',
      maxErrorsHint: 'The maximum number of errors a player can make in blind mode',
      winType: 'Win type',
      blockByOpponent: 'Blocked by opponent',
      notBlockByOpponent: 'Not blocked by opponent',
      board: 'Caro board',
      machineLevel: 'Machine level',
      levels: { easy: 'Easy', medium: 'Medium', hard: 'Hard', hell: 'Hell' },
      hellHint: {
        unknown:
          'The strongest level: a tournament-style caro engine running in your browser, which also remembers the moves that lost it a game.',
        ready: (games: number) =>
          games == 0
            ? 'The strongest level: a tournament-style caro engine running in your browser, which also remembers the moves that lost it a game.'
            : `The strongest level: a tournament-style caro engine running in your browser; it has studied ${games} of your ${games == 1 ? 'game' : 'games'} here.`,
        missing:
          'The engine could not start in this browser, so this level plays like Hard for now.',
        report:
          'Games at this level are saved anonymously (moves only) to make the machine stronger.',
      },
      engines: {
        label: 'Engines',
        loading: 'loading…',
        ready: 'ready',
        failed: 'unavailable',
        tengenMeanwhile: 'Tengen plays until Rapfi (the stronger engine) has loaded.',
      },
      firstMove: 'First move',
      firstMoveYou: 'You',
      firstMoveMachine: 'Machine',
      memory: 'Machine memory',
      memoryCount: (count: number) =>
        count == 0
          ? 'No lessons yet: the machine learns from its losses and from games it nearly lost.'
          : `Learned from its losses and close calls: ${count} ${count == 1 ? 'position' : 'positions'} it now plays differently.`,
      memoryLearning: 'Analysing the last game…',
      clearMemory: 'Clear memory',
    },
    learning: {
      cleared: 'The machine forgot everything it learned.',
    },
    connection: {
      trigger: 'Connection',
      title: 'Caro peer-to-peer connection',
      host: 'Host',
      guest: 'Guest',
      disconnect: 'Disconnect',
      roleLabel: { host: 'host', guest: 'guest' },
      youAre: 'You are the',
      youConnected: 'You are connected as the',
      youConnecting: 'You are connecting as the',
      roomCode: 'Room code',
      creatingRoom: 'Creating room...',
      connect: 'Connect',
      join: 'Join',
      notReady: 'Signaling is not ready, please try again',
      friendJoined: 'Your friend joined the room',
      friendLeft: 'Your friend left the room',
      roomErrors: {
        'Room not found or expired': 'Room not found or expired',
        'Room is already full': 'Room is already full',
      },
      greeting: 'Hello',
      newMessage: 'New message!',
      syncBoard: (size: number) => `Board size set to ${size}x${size}`,
      syncGameType: (gameType: string, isOverride: boolean) =>
        `Game type set to ${gameType} ${isOverride ? 'with' : 'without'} override`,
      opponentUndo: 'Your opponent undid the last moves',
      decodeError: 'Could not read the message from your opponent',
      closed: 'Connection closed',
    },
    messenger: {
      trigger: 'Message',
      title: 'Messenger',
      you: 'you',
      friend: 'friend',
      placeholder: 'Enter your message',
      send: 'Send message',
    },
    instruction: {
      title: 'Caro instructions',
      howToPlay: '1. How to play?',
      howToPlayText:
        'Your goal is to make five pieces of the same color in a vertical, horizontal or diagonal line. Player 1 takes the first move. After the first game is over, the winner takes the first move.',
      setting: '2. Settings',
      settingBefore: 'Click on the icon',
      settingAfter:
        'to open the config dialog, where you can change how the caro board works. When you press the save button, your changes are applied and a new game starts.',
      playMode: '3. Play mode',
      playModeIntro: 'This game has three modes:',
      modes: { offline: 'offline', online: 'online', machine: 'machine' },
      and: 'and',
      playModeText:
        'You and your friend can play on one device in offline play mode. In machine play mode, you play against the computer, which runs entirely in your browser. Choose its level (easy, medium or hard) and who moves first in the config dialog; override mode is not available against the machine.',
      onlineBefore: 'In online play mode, you and your friend connect to each other peer-to-peer (',
      onlineAfter:
        '). One of you is the host and the other is the guest. The host creates the connection and gets a short room code; the guest enters that room code to join. The app exchanges the connection info in the background, so you only need to share the short room code with your friend (via any chat app). Once connected, you can start playing and chatting with each other.',
      online: '4. Online play mode',
      onlineText:
        'The host, as player 1, controls the configuration and takes the first move. When the connection is established, the configuration is synced to the guest. After the first game is over, the right to control the configuration and play the first move passes to the winner.',
      gameType: '5. Game type',
      gameTypeIntro: 'This game supports two game types:',
      types: { normal: 'normal', blind: 'blind' },
      normalText:
        'The normal type is the traditional caro game, where two players take turns until one of them wins.',
      blindText:
        'In the blind type, only the latest move is shown on the board; the others are hidden, and players must rely on their memory. If a player makes more than a set number of mistakes (trying to play on a cell that is already taken), the game is over and the other player wins.',
      overrideText:
        'You can enable override mode. In this mode, you can play on a cell the opponent has already taken.',
    },
  },
  vi: {
    meta: {
      title: 'Caro',
      description: 'Cờ caro năm quân liên tiếp: chơi offline, online ngang hàng và chế độ bịt mắt.',
    },
    title: 'Caro',
    status: {
      turn: (player: number) => `Lượt người chơi ${player}`,
      win: (player: number) => `Người chơi ${player} thắng`,
      draw: 'Hoà',
      yourTurn: 'Lượt của bạn',
      opponentTurn: 'Lượt đối thủ',
      youWin: 'Bạn thắng',
      opponentWins: 'Đối thủ thắng',
      machineThinking: 'Máy đang nghĩ…',
      machineWins: 'Máy thắng',
      // Shown next to the side's piece in the header; the full sentences above are announced.
      short: {
        you: 'Bạn',
        opponent: 'Đối thủ',
        machine: 'Máy nghĩ…',
        player: (player: number) => `Người ${player}`,
      },
    },
    blindErrors: (player: number) => `Lỗi của người chơi ${player}`,
    mode: {
      machine: 'Đấu với máy',
      offline: 'Hai người',
      online: 'Online',
      notConnected: 'Chưa kết nối',
      label: 'Chế độ',
      changeAction: 'Đổi',
      change: (summary: string) => `Cài đặt ván: ${summary}. Đổi cài đặt`,
      rules: { blockOpponent: 'Chặn hai đầu', 'non-blockOpponent': 'Tự do' },
    },
    cell: (row: number, column: number, piece?: string) =>
      `Hàng ${row}, cột ${column}${piece ? `: ${piece}` : ''}`,
    config: {
      title: 'Cài đặt Caro',
      playMode: 'Chế độ chơi',
      offline: 'Offline',
      online: 'Online',
      machine: 'Với máy',
      onlineHint: {
        before: 'Khi bật chế độ online, biểu tượng kết nối',
        middle: '(ngay cạnh biểu tượng cài đặt',
        after:
          ') sẽ hiện ra. Làm theo hướng dẫn ở đó để kết nối với bạn bè. Bấm nút lưu để xác nhận thay đổi.',
      },
      gameType: 'Kiểu chơi',
      normal: 'Thường',
      blind: 'Bịt mắt',
      override: 'Đánh đè',
      maxErrors: 'Số lỗi tối đa',
      maxErrorsHint: 'Số lần đánh sai tối đa của mỗi người chơi ở chế độ bịt mắt',
      winType: 'Luật thắng',
      blockByOpponent: 'Bị chặn hai đầu thì không thắng',
      notBlockByOpponent: 'Không tính chặn hai đầu',
      board: 'Bàn cờ',
      machineLevel: 'Mức độ của máy',
      levels: { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó', hell: 'Địa ngục' },
      hellHint: {
        unknown:
          'Mức mạnh nhất: engine caro chuẩn giải đấu chạy ngay trên trình duyệt, nhớ cả những nước từng khiến nó thua.',
        ready: (games: number) =>
          games == 0
            ? 'Mức mạnh nhất: engine caro chuẩn giải đấu chạy ngay trên trình duyệt, nhớ cả những nước từng khiến nó thua.'
            : `Mức mạnh nhất: engine caro chuẩn giải đấu chạy ngay trên trình duyệt; đã rút kinh nghiệm từ ${games} ván của bạn ở đây.`,
        missing:
          'Engine không khởi động được trên trình duyệt này nên tạm thời mức này chơi như mức Khó.',
        report: 'Các ván ở mức này được lưu ẩn danh (chỉ các nước đi) để máy chơi mạnh hơn.',
      },
      engines: {
        label: 'Engine',
        loading: 'đang tải…',
        ready: 'sẵn sàng',
        failed: 'không chạy được',
        tengenMeanwhile: 'Tengen chơi tạm cho đến khi Rapfi (engine mạnh hơn) tải xong.',
      },
      firstMove: 'Đi trước',
      firstMoveYou: 'Bạn',
      firstMoveMachine: 'Máy',
      memory: 'Trí nhớ của máy',
      memoryCount: (count: number) =>
        count == 0
          ? 'Chưa có bài học nào: máy học từ các ván thua và cả những ván suýt thua.'
          : `Đã rút kinh nghiệm từ các ván thua và suýt thua: ${count} thế cờ máy sẽ đánh khác đi.`,
      memoryLearning: 'Đang phân tích ván vừa rồi…',
      clearMemory: 'Xoá trí nhớ',
    },
    learning: {
      cleared: 'Máy đã quên toàn bộ những gì đã học.',
    },
    connection: {
      trigger: 'Kết nối',
      title: 'Kết nối ngang hàng',
      host: 'Chủ phòng',
      guest: 'Khách',
      disconnect: 'Ngắt kết nối',
      roleLabel: { host: 'chủ phòng', guest: 'khách' },
      youAre: 'Bạn là',
      youConnected: 'Bạn đã kết nối với vai trò',
      youConnecting: 'Bạn đang kết nối với vai trò',
      roomCode: 'Mã phòng',
      creatingRoom: 'Đang tạo phòng...',
      connect: 'Kết nối',
      join: 'Vào phòng',
      notReady: 'Máy chủ kết nối chưa sẵn sàng, vui lòng thử lại',
      friendJoined: 'Bạn của bạn đã vào phòng',
      friendLeft: 'Bạn của bạn đã rời phòng',
      roomErrors: {
        'Room not found or expired': 'Không tìm thấy phòng hoặc phòng đã hết hạn',
        'Room is already full': 'Phòng đã đủ người',
      },
      greeting: 'Xin chào',
      newMessage: 'Có tin nhắn mới!',
      syncBoard: (size: number) => `Kích thước bàn cờ: ${size}x${size}`,
      syncGameType: (gameType: string, isOverride: boolean) =>
        `Kiểu chơi: ${gameType}, ${isOverride ? 'có' : 'không'} đánh đè`,
      opponentUndo: 'Đối thủ đã đi lại',
      decodeError: 'Không đọc được tin nhắn từ đối thủ',
      closed: 'Đã đóng kết nối',
    },
    messenger: {
      trigger: 'Tin nhắn',
      title: 'Tin nhắn',
      you: 'bạn',
      friend: 'đối thủ',
      placeholder: 'Nhập tin nhắn',
      send: 'Gửi tin nhắn',
    },
    instruction: {
      title: 'Hướng dẫn chơi Caro',
      howToPlay: '1. Cách chơi',
      howToPlayText:
        'Mục tiêu là xếp được năm quân cùng màu liên tiếp theo hàng dọc, hàng ngang hoặc đường chéo. Người chơi 1 đi trước. Từ ván thứ hai, người thắng ván trước sẽ đi trước.',
      setting: '2. Cài đặt',
      settingBefore: 'Bấm vào biểu tượng',
      settingAfter:
        'để mở hộp cài đặt, nơi bạn có thể thay đổi cách bàn cờ hoạt động. Khi bấm lưu, thay đổi được áp dụng và một ván mới bắt đầu.',
      playMode: '3. Chế độ chơi',
      playModeIntro: 'Trò chơi có ba chế độ:',
      modes: { offline: 'offline', online: 'online', machine: 'chơi với máy' },
      and: 'và',
      playModeText:
        'Ở chế độ offline, bạn và bạn bè chơi chung trên một thiết bị. Ở chế độ chơi với máy, bạn đấu với máy tính, chạy hoàn toàn trong trình duyệt. Chọn mức độ của máy (dễ, trung bình hoặc khó) và ai đi trước trong hộp cài đặt; chế độ đánh đè không dùng được khi chơi với máy.',
      onlineBefore: 'Ở chế độ online, bạn và bạn bè kết nối trực tiếp với nhau (',
      onlineAfter:
        '). Một người làm chủ phòng, người còn lại là khách. Chủ phòng tạo kết nối và nhận một mã phòng ngắn; khách nhập mã đó để vào phòng. Ứng dụng tự trao đổi thông tin kết nối ở phía sau, nên bạn chỉ cần gửi mã phòng cho bạn bè (qua bất kỳ ứng dụng nhắn tin nào). Khi đã kết nối, hai bạn có thể bắt đầu chơi và nhắn tin cho nhau.',
      online: '4. Chế độ online',
      onlineText:
        'Chủ phòng là người chơi 1, được quyền chỉnh cài đặt và đi trước. Khi kết nối thành công, cài đặt được đồng bộ sang khách. Sau ván đầu tiên, quyền chỉnh cài đặt và đi trước thuộc về người thắng.',
      gameType: '5. Kiểu chơi',
      gameTypeIntro: 'Trò chơi có hai kiểu:',
      types: { normal: 'thường', blind: 'bịt mắt' },
      normalText:
        'Kiểu thường là caro truyền thống: hai người lần lượt đánh cho đến khi có người thắng.',
      blindText:
        'Ở kiểu bịt mắt, bàn cờ chỉ hiện nước đi mới nhất, các nước khác bị ẩn và người chơi phải dựa vào trí nhớ. Nếu một người đánh sai quá số lần quy định (đánh vào ô đã có quân), ván đấu kết thúc và người còn lại thắng.',
      overrideText: 'Bạn có thể bật chế độ đánh đè. Khi đó, bạn được đánh vào ô đối thủ đã đánh.',
    },
  },
});
