/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import Peer, { Instance } from 'simple-peer';
import { toast } from 'sonner';
import { useGameMessengerChat } from 'src/states/messenger.state';
import { TConnection, TRole } from 'src/types/caro.type';
import { TCaroConnectionContext } from './caro-connection.context';

type TConnect4ConnectionContext = TCaroConnectionContext;

const connect4ConnectionContextDefault: TConnect4ConnectionContext = {
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

const Connect4ConnectionContext = createContext<TConnect4ConnectionContext>(
  connect4ConnectionContextDefault
);

interface TProps {
  children: ReactNode;
}

export default function Connect4ConnectionProvider({ children }: TProps) {
  const [peer, setPeer] = useState<Instance | null>(null);
  const [role, setRole] = useState<TRole>('host');
  const [yourSignal, setYourSignal] = useState('');
  const [friendSignal, setFriendSignal] = useState('');
  const [connection, setConnection] = useState<TConnection>('init');
  const {
    fn: { addChats },
  } = useGameMessengerChat('connect4');

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

  const contextData = useMemo<TConnect4ConnectionContext>(() => {
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
    <Connect4ConnectionContext.Provider value={contextData}>
      {children}
    </Connect4ConnectionContext.Provider>
  );
}

export function useConnect4ConnectionContext() {
  return useContext(Connect4ConnectionContext);
}
