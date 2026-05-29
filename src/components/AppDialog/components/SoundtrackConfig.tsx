import { Volume2, VolumeOff } from 'lucide-react';
import IconButton from 'src/components/buttons/IconButton';
import { Button } from 'src/components/shadcn/button';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';

export default function SoundtrackConfig() {
  const { isSound, backgroundSound, fn } = useConfigStore();

  return (
    <div className="mt-2 rounded-sm border p-2">
      <p className="text-sm font-bold">Sound effect and Background</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex cursor-pointer items-center gap-1" onClick={() => fn.setIsSound()}>
          <IconButton>{isSound ? <Volume2 size={16} /> : <VolumeOff size={16} />}</IconButton>
          <p>{isSound ? 'Mute' : 'Unmute'}</p>
        </div>
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => fn.setBackgroundSound()}
        >
          <IconButton>
            {backgroundSound ? <Volume2 size={16} /> : <VolumeOff size={16} />}
          </IconButton>
          <p>{backgroundSound ? 'Background Mute' : 'Background Unmute'}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="outline" sound={TSound.CLICK} isSound={true}>
          Click
        </Button>
        <Button sound={TSound.SUCCESS} isSound={true}>
          Success
        </Button>
        <Button sound={TSound.MOVE} isSound={true} variant="destructive">
          Move
        </Button>
        <Button sound={TSound.ERROR} isSound={true}>
          Error
        </Button>
      </div>
    </div>
  );
}
