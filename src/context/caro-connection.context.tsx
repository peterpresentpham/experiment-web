'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Peer, { Instance } from 'simple-peer';
import { toast } from 'sonner';
import useGameSignalingSocket from 'src/hooks/useGameSignalingSocket';
import { createCaroMessage, decodeCaroMessage, TSyncReturnType } from 'src/services/caro.utils';
import { useCaroStore } from 'src/states/caro.state';
import { useGameMessengerChat } from 'src/states/messenger.state';
import { TConnection, TRole } from 'src/types/caro.type';

export type TCaroConnectionContext = {
  peer: Instance | null;
  roomCode: string;
  role: TRole;
  connectionType: TConnection;
  fn: {
    initConnection: (role: TRole) => void;
    joinRoom: (roomCode: string) => void;
  };
};

const caroConnectionContextDefault: TCaroConnectionContext = {
  peer: null,
  roomCode: '',
  role: 'host',
  connectionType: 'init',
  fn: {
    initConnection: () => {},
    joinRoom: () => {},
  },
};

const CaroConnectionContext = createContext<TCaroConnectionContext>(caroConnectionContextDefault);

interface TProps {
  children: ReactNode;
}

export default function CaroConnectionProvider({ children }: TProps) {
  const [peer, setPeer] = useState<Instance | null>(null);
  const [role, setRole] = useState<TRole>('host');
  const [roomCode, setRoomCode] = useState('');
  const [connection, setConnection] = useState<TConnection>('init');
  const { socket } = useGameSignalingSocket();
  const roomCodeRef = useRef('');
  const pendingSignalRef = useRef<string | null>(null);
  const {
    fn: { addChats },
  } = useGameMessengerChat('caro');
  const {
    metadata: { size, gameType, isOverride },
    fn: { setMetadata, move, undo, reset },
  } = useCaroStore();

  const flushRoomCode = useCallback(
    (code: string) => {
      roomCodeRef.current = code;
      setRoomCode(code);
      if (pendingSignalRef.current && socket) {
        socket.emit('send_signal', { roomCode: code, signal: pendingSignalRef.current });
        pendingSignalRef.current = null;
      }
    },
    [socket]
  );

  const sendSignal = useCallback(
    (signal: string) => {
      if (roomCodeRef.current && socket) {
        socket.emit('send_signal', { roomCode: roomCodeRef.current, signal });
      } else {
        pendingSignalRef.current = signal;
      }
    },
    [socket]
  );

  const initConnection = useCallback((type: TRole) => {
    setRole(type);
    setConnection('connecting');
    if (type == 'host') {
      const p = new Peer({ initiator: true, trickle: false });
      setPeer(p);
    }
  }, []);

  const joinRoom = useCallback(
    (code: string) => {
      if (!socket) {
        toast.error('Signaling is not ready, please try again');
        return;
      }
      roomCodeRef.current = code;
      setRoomCode(code);
      const p = new Peer({ initiator: false, trickle: false });
      setPeer(p);
      socket.emit('join_room', { roomCode: code });
    },
    [socket]
  );

  useEffect(() => {
    if (socket && peer && role == 'host' && !roomCodeRef.current) socket.emit('create_room');
  }, [socket, peer, role]);

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = ({ roomCode: code }: { roomCode: string }) => flushRoomCode(code);
    const onPeerJoined = () => toast.info('Your friend joined the room');
    const onPeerLeft = () => {
      if (connection != 'connected') toast.warning('Your friend left the room');
    };
    const onRoomError = ({ reason }: { reason: string }) => {
      toast.error(reason);
      setConnection('init');
      setRoomCode('');
      roomCodeRef.current = '';
      setPeer((current) => {
        current?.destroy();
        return null;
      });
    };
    const onReceiveSignal = ({ signal }: { signal: string }) => {
      setPeer((current) => {
        current?.signal(signal);
        return current;
      });
    };

    socket.on('room_created', onRoomCreated);
    socket.on('peer_joined', onPeerJoined);
    socket.on('peer_left', onPeerLeft);
    socket.on('room_error', onRoomError);
    socket.on('receive_signal', onReceiveSignal);

    return () => {
      socket.off('room_created', onRoomCreated);
      socket.off('peer_joined', onPeerJoined);
      socket.off('peer_left', onPeerLeft);
      socket.off('room_error', onRoomError);
      socket.off('receive_signal', onReceiveSignal);
    };
  }, [socket, connection, flushRoomCode]);

  useEffect(() => {
    if (peer && connection == 'connected' && role == 'host') {
      peer.send(createCaroMessage('sync', size, gameType, isOverride ? 1 : 0));
    }
  }, [connection, gameType, isOverride, size, peer, role]);

  useEffect(() => {
    if (peer) {
      peer.on('signal', (data) => {
        sendSignal(JSON.stringify(data));
      });

      peer.on('connect', () => {
        addChats('yourChat', 'Hello');
        peer.send(createCaroMessage('chat', 'Hello'));
        setConnection('connected');
      });

      peer.on('data', (data) => {
        try {
          const sData = data.toString();
          const result = decodeCaroMessage(sData);
          if (result) {
            const { type, message } = result;
            if (type == 'chat') {
              addChats('friendChat', message);
              toast.info('New message!!');
            } else if (type == 'sync') {
              const { size, gameType, isOverride } = message as TSyncReturnType;
              setMetadata({ size, gameType, isOverride });
              toast.info(`Set board size to ${size}x${size}`);
              toast.info(
                `Set game type to ${gameType} ${isOverride ? 'with' : 'without'} override`
              );
            } else if (type == 'move') {
              const location = Number(message);
              move(location);
            } else if (type == 'undo') {
              undo();
              toast.warning('Opponent undo caro board');
            } else if (type == 'newGame') reset();
          } else toast.error('Message is not decoded');
        } catch (error) {
          console.error(error);
        }
      });

      peer.on('error', (error) => {
        console.error('Caro peer-to-peer error:', error);
        toast.error(String(error));
      });

      peer.on('close', () => {
        setConnection('init');
        setRoomCode('');
        roomCodeRef.current = '';
        toast.info('Connection closed');
        if (peer) peer.destroy();
      });

      return () => peer.destroy();
    }
  }, [addChats, move, peer, sendSignal, setMetadata, reset, undo]);

  const contextData = useMemo<TCaroConnectionContext>(() => {
    return {
      peer,
      roomCode,
      role,
      connectionType: connection,
      fn: { initConnection, joinRoom },
    };
  }, [initConnection, peer, roomCode, role, connection, joinRoom]);

  return (
    <CaroConnectionContext.Provider value={contextData}>{children}</CaroConnectionContext.Provider>
  );
}

export function useCaroConnectionContext() {
  return useContext(CaroConnectionContext);
}
