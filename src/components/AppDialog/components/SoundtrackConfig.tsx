import { Volume2, VolumeOff } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';

export default function SoundtrackConfig() {
  const { isSound, backgroundSound, fn } = useConfigStore();
  const { settings } = useMessages(commonMessages);

  return (
    <div className="mt-2 rounded-lg border p-3">
      <p className="text-sm font-bold">{settings.sound}</p>
      <div className="mt-2 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => fn.setIsSound()}>
          {isSound ? <Volume2 size={16} /> : <VolumeOff size={16} />}
          {isSound ? settings.mute : settings.unmute}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fn.setBackgroundSound()}>
          {backgroundSound ? <Volume2 size={16} /> : <VolumeOff size={16} />}
          {backgroundSound ? settings.backgroundMute : settings.backgroundUnmute}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="outline" sound={TSound.CLICK} isSound={true}>
          {settings.samples.click}
        </Button>
        <Button sound={TSound.SUCCESS} isSound={true}>
          {settings.samples.success}
        </Button>
        <Button sound={TSound.MOVE} isSound={true} variant="destructive">
          {settings.samples.move}
        </Button>
        <Button sound={TSound.ERROR} isSound={true}>
          {settings.samples.error}
        </Button>
        <Button sound={TSound.WIN} isSound={true} variant="secondary">
          {settings.samples.win}
        </Button>
      </div>
    </div>
  );
}
