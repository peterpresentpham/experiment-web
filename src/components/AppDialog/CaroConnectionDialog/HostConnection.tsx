import { Fragment } from 'react';
import TitleBox from 'src/components/box/TitleBox';
import CopyClipboard from 'src/components/CopyClipboard';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';

export default function HostConnection() {
  const {
    peer,
    roomCode,
    fn: { initConnection },
  } = useCaroConnectionContext();

  return (
    <Fragment>
      {peer ? (
        <TitleBox
          className="mt-2 items-start"
          valueProps={{ className: 'flex items-center gap-1' }}
          title="Room code"
          value={
            roomCode ? (
              <Fragment>
                <span className="font-mono text-lg tracking-widest">{roomCode}</span>
                <CopyClipboard copyText={roomCode} iconprops={{ size: 16 }} />
              </Fragment>
            ) : (
              <span className="text-sm">Creating room...</span>
            )
          }
        />
      ) : (
        <Button onClick={() => initConnection('host')}>Connect</Button>
      )}
    </Fragment>
  );
}
