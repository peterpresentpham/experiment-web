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
  const [socket, setSocket] = useState<TSignalingSocket | null>(null);

  useEffect(() => {
    const newSocket: TSignalingSocket = io(`${GAME_SIGNAL_URL}/game-signal`);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket };
}
