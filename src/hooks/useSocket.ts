/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PAPP_BACKEND_URL } from 'src/configs/constance';
import { useAuthStore } from 'src/states/auth.state';

interface EventsMap {
  [event: string]: any;
}

export default function useSocket<ListenEvents extends EventsMap, EmitEvents extends EventsMap>(
  url = PAPP_BACKEND_URL
) {
  const { accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket<ListenEvents, EmitEvents> | null>(null);

  useEffect(() => {
    const newSocket = io(url, { transports: ['websocket'], auth: { token: accessToken } });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url, accessToken]);

  return { socket };
}
