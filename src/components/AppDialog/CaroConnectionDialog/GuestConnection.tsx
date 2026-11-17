import { Fragment, useState } from 'react';
import BaseInput from 'src/components/input/BaseInput';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';

export default function GuestConnection() {
  const {
    peer,
    roomCode,
    connectionType,
    fn: { initConnection, joinRoom },
  } = useCaroConnectionContext();
  const [code, setCode] = useState('');
  const { connection: text } = useMessages(caroMessages);

  if (peer) {
    return (
      <p className="mt-2 text-sm">
        {text.roomCode}: <span className="font-mono">{roomCode}</span>
      </p>
    );
  }

  if (connectionType != 'init') {
    return (
      <BaseInput
        placeholder={text.roomCode}
        name="guest-room-code"
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        icon={{
          end: (
            <Button onClick={() => joinRoom(code)} disabled={!code}>
              {text.join}
            </Button>
          ),
        }}
      />
    );
  }

  return (
    <Fragment>
      <Button onClick={() => initConnection('guest')}>{text.connect}</Button>
    </Fragment>
  );
}
