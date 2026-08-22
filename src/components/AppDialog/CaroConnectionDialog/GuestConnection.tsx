import { Fragment, useState } from 'react';
import BaseInput from 'src/components/input/BaseInput';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';

export default function GuestConnection() {
  const {
    peer,
    roomCode,
    connectionType,
    fn: { initConnection, joinRoom },
  } = useCaroConnectionContext();
  const [code, setCode] = useState('');

  if (peer) {
    return (
      <p className="mt-2 text-sm">
        Room code: <span className="font-mono">{roomCode}</span>
      </p>
    );
  }

  if (connectionType != 'init') {
    return (
      <BaseInput
        placeholder="Room code"
        name="guest-room-code"
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        icon={{
          end: (
            <Button onClick={() => joinRoom(code)} disabled={!code}>
              Join
            </Button>
          ),
        }}
      />
    );
  }

  return (
    <Fragment>
      <Button onClick={() => initConnection('guest')}>Connect</Button>
    </Fragment>
  );
}
