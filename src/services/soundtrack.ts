import { useConfigStore } from 'src/states/config.state';
import { TSound, TSoundConfigType } from 'src/types/global';

type TEffect = Exclude<TSound, TSound.BACKGROUND>;

// Short effects are decoded once and played through Web Audio: no start-up latency, and
// rapid repeats overlap instead of cutting each other off like a shared <audio> element.
const EFFECT_SOURCES: Record<TEffect, string> = {
  [TSound.CLICK]: '/sounds/click.wav',
  [TSound.MOVE]: '/sounds/move.wav',
  [TSound.SUCCESS]: '/sounds/success.wav',
  [TSound.ERROR]: '/sounds/error.wav',
  [TSound.WIN]: '/sounds/win.wav',
};
const BACKGROUND_SOURCE = '/sounds/background.mp3';
const EFFECT_VOLUME = 0.5;
const BACKGROUND_VOLUME = 0.25;

class Soundtrack {
  private context: AudioContext | null = null;
  private buffers: Partial<Record<TEffect, AudioBuffer>> = {};
  private loading: Promise<void> | null = null;
  private background: HTMLAudioElement | null = null;

  private getContext() {
    if (this.context) return this.context;
    if (typeof window === 'undefined') return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.context = new Ctor();
    return this.context;
  }

  private async loadEffect(context: AudioContext, type: TEffect) {
    try {
      const response = await fetch(EFFECT_SOURCES[type]);
      const data = await response.arrayBuffer();
      this.buffers[type] = await context.decodeAudioData(data);
    } catch (err) {
      console.warn(`Failed to load sound "${type}":`, err);
    }
  }

  /** Creates the audio context and decodes every effect. Call it from a user gesture. */
  preload() {
    const context = this.getContext();
    if (!context) return Promise.resolve();
    if (context.state === 'suspended') context.resume().catch(() => {});
    if (!this.loading) {
      const types = Object.keys(EFFECT_SOURCES) as Array<TEffect>;
      this.loading = Promise.all(types.map((type) => this.loadEffect(context, type))).then(
        () => undefined
      );
    }
    return this.loading;
  }

  private playEffect(type: TEffect, volume = 1) {
    const context = this.getContext();
    if (!context) return;
    const buffer = this.buffers[type];
    if (!buffer) {
      // Not decoded yet (first sound before preload finished): start loading, skip this one.
      void this.preload();
      return;
    }
    if (context.state === 'suspended') context.resume().catch(() => {});

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = EFFECT_VOLUME * volume;
    source.connect(gain).connect(context.destination);
    source.start();
  }

  private playBackground({ loop = true, volume }: TSoundConfigType) {
    if (typeof Audio === 'undefined') return;
    if (!this.background) this.background = new Audio(BACKGROUND_SOURCE);
    this.background.loop = loop;
    this.background.volume = volume ?? BACKGROUND_VOLUME;
    this.background.play().catch((err) => console.warn('Failed to play background:', err));
  }

  play(option: TSoundConfigType) {
    const { isEnabled = useConfigStore.getState().isSound, type, volume } = option;
    if (!isEnabled) return;
    try {
      if (type === TSound.BACKGROUND) this.playBackground(option);
      else this.playEffect(type, volume);
    } catch (err) {
      console.warn('Error playing sound:', err);
    }
  }

  stop(type: TSound) {
    if (type !== TSound.BACKGROUND || !this.background) return;
    this.background.pause();
    this.background.currentTime = 0;
  }
}

export const soundtrack = new Soundtrack();

// Browsers only allow audio after a user gesture, so warm up on the first pointer press.
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => void soundtrack.preload(), { once: true });
}
