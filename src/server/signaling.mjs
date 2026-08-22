import { Server } from 'socket.io';

const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_TTL_MS = 10 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

export function attachSignalingServer(httpServer) {
  // cors: '*' is safe here — the namespace carries no auth/cookies, only
  // ephemeral room codes and WebRTC SDP blobs, and is meant to be reachable
  // from a separately-deployed frontend (e.g. the Next.js app on Vercel).
  const io = new Server(httpServer, { cors: { origin: '*' } });
  const namespace = io.of('/game-signal');

  /** @type {Map<string, { hostSocketId: string, guestSocketId: string | null, createdAt: number }>} */
  const rooms = new Map();
  /** @type {Map<string, string>} */
  const socketRooms = new Map();

  function generateRoomCode() {
    let code;
    do {
      code = Array.from(
        { length: ROOM_CODE_LENGTH },
        () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
      ).join('');
    } while (rooms.has(code));
    return code;
  }

  function cleanupExpiredRooms() {
    const now = Date.now();
    for (const [code, room] of rooms) {
      if (!room.guestSocketId && now - room.createdAt > ROOM_TTL_MS) {
        rooms.delete(code);
        socketRooms.delete(room.hostSocketId);
      }
    }
  }
  const cleanupInterval = setInterval(cleanupExpiredRooms, CLEANUP_INTERVAL_MS);
  cleanupInterval.unref?.();

  namespace.on('connection', (socket) => {
    socket.on('create_room', () => {
      const roomCode = generateRoomCode();
      rooms.set(roomCode, { hostSocketId: socket.id, guestSocketId: null, createdAt: Date.now() });
      socketRooms.set(socket.id, roomCode);
      socket.emit('room_created', { roomCode });
    });

    socket.on('join_room', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('room_error', { reason: 'Room not found or expired' });
        return;
      }
      if (room.guestSocketId) {
        socket.emit('room_error', { reason: 'Room is already full' });
        return;
      }
      room.guestSocketId = socket.id;
      socketRooms.set(socket.id, roomCode);
      socket.emit('joined_room', { roomCode });
      namespace.to(room.hostSocketId).emit('peer_joined');
    });

    socket.on('send_signal', ({ roomCode, signal }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      const targetSocketId =
        room.hostSocketId === socket.id ? room.guestSocketId : room.hostSocketId;
      if (targetSocketId) namespace.to(targetSocketId).emit('receive_signal', { signal });
    });

    socket.on('disconnect', () => {
      const roomCode = socketRooms.get(socket.id);
      socketRooms.delete(socket.id);
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room) return;
      if (room.hostSocketId === socket.id) {
        rooms.delete(roomCode);
        if (room.guestSocketId) namespace.to(room.guestSocketId).emit('peer_left');
      } else if (room.guestSocketId === socket.id) {
        room.guestSocketId = null;
        namespace.to(room.hostSocketId).emit('peer_left');
      }
    });
  });

  return io;
}
