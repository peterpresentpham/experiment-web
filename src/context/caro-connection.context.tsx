'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Peer, { Instance } from 'simple-peer';
import { toast } from 'sonner';
import { createCaroMessage, decodeCaroMessage, TSyncReturnType } from 'src/services/caro.utils';
import { useCaroStore } from 'src/states/caro.state';
import { useGameMessengerChat } from 'src/states/messenger.state';
import { TConnection, TRole } from 'src/types/caro.type';

export type TCaroConnectionContext = {
  peer: Instance | null;
  yourSignal: string;
  friendSignal: string;
  role: TRole;
  connectionType: TConnection;
  fn: {
    initConnection: (role: TRole) => void;
    setFriendSignal: (friendSignal: string) => void;
  };
};

const caroConnectionContextDefault: TCaroConnectionContext = {
  peer: null,
  yourSignal: '',
  friendSignal: '',
  role: 'host',
  connectionType: 'init',
  fn: {
    initConnection: () => {},
    setFriendSignal: () => {},
  },
};

const CaroConnectionContext = createContext<TCaroConnectionContext>(caroConnectionContextDefault);

interface TProps {
  children: ReactNode;
}

export default function CaroConnectionProvider({ children }: TProps) {
  const [peer, setPeer] = useState<Instance | null>(null);
  const [role, setRole] = useState<TRole>('host');
  const [yourSignal, setYourSignal] = useState('');
  const [friendSignal, setFriendSignal] = useState('');
  const [connection, setConnection] = useState<TConnection>('init');
  const {
    fn: { addChats },
  } = useGameMessengerChat('caro');
  const {
    metadata: { size, gameType, isOverride },
    fn: { setMetadata, move, undo, reset },
  } = useCaroStore();

  const initConnection = useCallback((type: TRole) => {
    const p = new Peer({ initiator: type == 'host' ? true : false, trickle: false });
    setPeer(p);
    setRole(type);
    setConnection('connecting');
  }, []);

  const _setFriendSignal = useCallback(
    (friendSignal: string) => {
      if (peer) {
        setFriendSignal(friendSignal);
        peer.signal(friendSignal);
      } else toast.error('Peer is not defined');
    },
    [peer]
  );

  useEffect(() => {
    if (peer && connection == 'connected' && role == 'host') {
      peer.send(createCaroMessage('sync', size, gameType, isOverride ? 1 : 0));
    }
  }, [connection, gameType, isOverride, size, peer, role]);

  useEffect(() => {
    if (peer) {
      peer.on('signal', (data) => {
        setYourSignal(JSON.stringify(data));
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
        toast.info('Connection closed');
        if (peer) peer.destroy();
      });

      return () => peer.destroy();
    }
  }, [addChats, move, peer, setMetadata, reset, undo]);

  const contextData = useMemo<TCaroConnectionContext>(() => {
    return {
      peer,
      yourSignal,
      friendSignal,
      role,
      connectionType: connection,
      fn: { initConnection, setFriendSignal: _setFriendSignal },
    };
  }, [initConnection, peer, yourSignal, friendSignal, role, connection, _setFriendSignal]);

  return (
    <CaroConnectionContext.Provider value={contextData}>{children}</CaroConnectionContext.Provider>
  );
}

export function useCaroConnectionContext() {
  return useContext(CaroConnectionContext);
}
