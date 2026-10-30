import { Volume2, VolumeOff } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';

export default function SoundtrackConfig() {
  const { isSound, backgroundSound, fn } = useConfigStore();

  return (
    <div className="mt-2 rounded-lg border p-3">
      <p className="text-sm font-bold">Sound effect and Background</p>
      <div className="mt-2 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => fn.setIsSound()}>
          {isSound ? <Volume2 size={16} /> : <VolumeOff size={16} />}
          {isSound ? 'Mute' : 'Unmute'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fn.setBackgroundSound()}>
          {backgroundSound ? <Volume2 size={16} /> : <VolumeOff size={16} />}
          {backgroundSound ? 'Background Mute' : 'Background Unmute'}
        </Button>
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
