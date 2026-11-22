'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GAME_SIGNAL_URL } from 'src/configs/constance';
import {
  TSignalingClientToServerEvents,
  TSignalingServerToClientEvents,
} from 'src/types/signaling.type';

export type TSignalingSocket = Socket<
  TSignalingServerToClientEvents,
  TSignalingClientToServerEvents
>;

export default function useGameSignalingSocket() {
  // Created once in the browser (none on the server), and connected only while mounted. Nothing
  // renders from it, so the server's null does not change the hydrated markup.
  const [socket] = useState<TSignalingSocket | null>(() =>
    typeof window == 'undefined'
      ? null
      : io(`${GAME_SIGNAL_URL}/game-signal`, { autoConnect: false })
  );

  useEffect(() => {
    socket?.connect();
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return { socket };
}
