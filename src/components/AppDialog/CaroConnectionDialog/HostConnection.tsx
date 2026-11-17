import { Fragment } from 'react';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';

export default function HostConnection() {
  const {
    peer,
    roomCode,
    fn: { initConnection },
  } = useCaroConnectionContext();
  const { connection: text } = useMessages(caroMessages);

  return (
    <Fragment>
      {peer ? (
        <TitleBox
          className="mt-2 items-start"
          valueProps={{ className: 'flex items-center gap-1' }}
          title={text.roomCode}
          value={
            roomCode ? (
              <Fragment>
                <span className="font-mono text-lg tracking-widest">{roomCode}</span>
                <CopyClipboard copyText={roomCode} iconprops={{ size: 16 }} />
              </Fragment>
            ) : (
              <span className="text-sm">{text.creatingRoom}</span>
            )
          }
        />
      ) : (
        <Button onClick={() => initConnection('host')}>{text.connect}</Button>
      )}
    </Fragment>
  );
}
