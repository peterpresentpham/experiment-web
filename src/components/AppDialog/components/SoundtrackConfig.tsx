import { Volume2, VolumeOff } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { SOUND_EFFECTS } from 'src/services/soundtrack';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';

type TEffect = Exclude<TSound, TSound.BACKGROUND>;

const EFFECTS = Object.keys(SOUND_EFFECTS) as Array<TEffect>;

type TVolumeProps = { label: string; value: number; onChange: (value: number) => void };

function VolumeSlider({ label, value, onChange }: TVolumeProps) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-36 shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="min-w-0 flex-1 accent-primary"
      />
      <span className="w-10 text-right text-muted-foreground tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </label>
  );
}

export default function SoundtrackConfig() {
  const { isSound, backgroundSound, effectsVolume, musicVolume, fn } = useConfigStore();
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
      <div className="mt-2 flex flex-col gap-2">
        <VolumeSlider
          label={settings.effectsVolume}
          value={effectsVolume}
          onChange={fn.setEffectsVolume}
        />
        <VolumeSlider
          label={settings.musicVolume}
          value={musicVolume}
          onChange={fn.setMusicVolume}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{settings.preview}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {EFFECTS.map((effect) => (
          // Previews play even when effects are muted, so a sound can be checked first.
          <Button key={effect} size="sm" variant="outline" sound={effect} isSound={true}>
            {settings.samples[effect]}
          </Button>
        ))}
      </div>
    </div>
  );
}
