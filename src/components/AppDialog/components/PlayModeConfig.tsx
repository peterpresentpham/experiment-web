import { Bluetooth, Settings } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import useBoardGameConnectionContext from 'src/hooks/useBoardGameConnection';
import { TMyGame, TPlayMode } from 'src/types/caro.type';
import useBoardGameConfigContext from './useBoardGameConfigContext';

interface TProps {
  game: TMyGame;
}

export default function PlayModeConfig({ game }: TProps) {
  const {
    playMode,
    fn: { setPlayMode },
  } = useBoardGameConfigContext(game);
  const { peer } = useBoardGameConnectionContext(game);

  function onChangePlayMode(playMode: TPlayMode) {
    setPlayMode(playMode);
    if (playMode != 'online' && peer) peer.destroy();
  }

  return (
    <div className="mt-2 rounded-sm border p-2">
      <p className="text-sm font-bold">Play mode</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          variant={playMode == 'offline' ? 'default' : 'outline'}
          onClick={() => onChangePlayMode('offline')}
        >
          Offline
        </Button>
        <Button
          variant={playMode == 'online' ? 'default' : 'outline'}
          onClick={() => onChangePlayMode('online')}
        >
          Online
        </Button>
        <Button
          variant={playMode == 'machine' ? 'default' : 'outline'}
          onClick={() => onChangePlayMode('machine')}
        >
          Machine
        </Button>
      </div>
      {playMode == 'online' && (
        <div className="mt-1 text-justify text-xs">
          When online mode is on, the connection icon <Bluetooth className="inline" size={14} />{' '}
          (right next to setting icon <Settings className="inline" size={14} />) is showed, you
          should follow its instruction to connect with your friends. Please press save button to
          confirm changes.
        </div>
      )}
    </div>
  );
}
