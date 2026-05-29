import { useConfigStore } from 'src/states/config.state';
import { TSoundConfigType, TSound } from 'src/types/global';

const sources: Record<TSound, string> = {
  [TSound.CLICK]: '/sounds/click.mp3',
  [TSound.MOVE]: '/sounds/move.mp3',
  [TSound.SUCCESS]: '/sounds/success.mp3',
  [TSound.ERROR]: '/sounds/error.mp3',
  [TSound.BACKGROUND]: '/sounds/background.mp3',
};

class Soundtrack {
  private cache: Record<TSound, HTMLAudioElement | null> = {
    [TSound.CLICK]: null,
    [TSound.MOVE]: null,
    [TSound.SUCCESS]: null,
    [TSound.ERROR]: null,
    [TSound.BACKGROUND]: null,
  };

  private createAudio(config: TSoundConfigType) {
    const { type, loop = false, volume } = config;
    let audio = this.cache[type];

    if (!audio) {
      audio = new Audio(sources[type]);
      this.cache[type] = audio;
    }

    audio.loop = loop;
    if (volume != undefined) audio.volume = volume;
    return audio;
  }

  preload() {
    Object.values(TSound).forEach((type) => {
      const audio = new Audio(sources[type]);
      audio.preload = 'auto';
      audio.load();
      this.cache[type] = audio;
    });
  }

  private _play(ref: HTMLAudioElement | null, config: TSoundConfigType): HTMLAudioElement | null {
    try {
      if (!ref) ref = this.createAudio(config);
      ref.currentTime = 0;
      ref.play().catch((err) => {
        console.warn('Failed to play sound:', err);
      });
      return ref;
    } catch (err) {
      console.warn('Error initializing sound:', err);
      return ref;
    }
  }

  play(option: TSoundConfigType) {
    const { isEnabled = useConfigStore.getState().isSound, ...rest } = option;
    if (!isEnabled) return;
    this.cache[rest.type] = this._play(this.cache[rest.type], rest);
  }

  stop(type: TSound) {
    const audio = this.cache[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
}

export const soundtrack = new Soundtrack();
