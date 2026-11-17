import { Bluetooth, Settings } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { TPlayMode } from 'src/types/caro.type';
import { useCaroConfigContext } from '../CaroConfigDialog/caroConfig.context';

export default function PlayModeConfig() {
  const {
    playMode,
    fn: { setPlayMode },
  } = useCaroConfigContext();
  const { peer } = useCaroConnectionContext();
  const { config: text } = useMessages(caroMessages);

  function onChangePlayMode(playMode: TPlayMode) {
    setPlayMode(playMode);
    if (playMode != 'online' && peer) peer.destroy();
  }

  return (
    <div className="mt-2 rounded-sm border p-2">
      <p className="text-sm font-bold">{text.playMode}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          variant={playMode == 'offline' ? 'default' : 'outline'}
          onClick={() => onChangePlayMode('offline')}
        >
          {text.offline}
        </Button>
        <Button
          variant={playMode == 'online' ? 'default' : 'outline'}
          onClick={() => onChangePlayMode('online')}
        >
          {text.online}
        </Button>
        <Button
          variant={playMode == 'machine' ? 'default' : 'outline'}
          onClick={() => onChangePlayMode('machine')}
        >
          {text.machine}
        </Button>
      </div>
      {playMode == 'online' && (
        <div className="mt-1 text-justify text-xs">
          {text.onlineHint.before} <Bluetooth className="inline" size={14} />{' '}
          {text.onlineHint.middle} <Settings className="inline" size={14} />
          {text.onlineHint.after}
        </div>
      )}
    </div>
  );
}
