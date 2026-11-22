import { useConfigStore } from 'src/states/config.state';
import { TSound, TSoundConfigType } from 'src/types/global';

type TEffect = Exclude<TSound, TSound.BACKGROUND>;

type TEffectConfig = {
  src: string;
  // Relative loudness: the files are levelled alike, so this sets how much each one stands out.
  gain: number;
  // Sounds heard many times in a row get a slightly different pitch each time, so they do not
  // drone.
  vary?: boolean;
  // Short music: the background music steps back while it plays.
  jingle?: boolean;
};

// Short effects are decoded once and played through Web Audio: no start-up latency, and
// rapid repeats overlap instead of cutting each other off like a shared <audio> element.
export const SOUND_EFFECTS: Record<TEffect, TEffectConfig> = {
  [TSound.CLICK]: { src: '/sounds/click.wav', gain: 0.35 },
  [TSound.SELECT]: { src: '/sounds/select.wav', gain: 0.55, vary: true },
  [TSound.DESELECT]: { src: '/sounds/deselect.wav', gain: 0.45 },
  [TSound.MATCH]: { src: '/sounds/match.wav', gain: 0.7, vary: true },
  [TSound.ERROR]: { src: '/sounds/error.wav', gain: 0.45 },
  [TSound.PLACE]: { src: '/sounds/place.wav', gain: 0.8, vary: true },
  [TSound.PLACE_OPPONENT]: { src: '/sounds/place-opponent.wav', gain: 0.75, vary: true },
  [TSound.UNDO]: { src: '/sounds/undo.wav', gain: 0.5 },
  [TSound.HINT]: { src: '/sounds/hint.wav', gain: 0.55 },
  [TSound.SHUFFLE]: { src: '/sounds/shuffle.mp3', gain: 0.6 },
  [TSound.ROUND]: { src: '/sounds/round.mp3', gain: 0.65, jingle: true },
  [TSound.WIN]: { src: '/sounds/win.mp3', gain: 0.7, jingle: true },
  [TSound.LOSE]: { src: '/sounds/lose.mp3', gain: 0.6, jingle: true },
  [TSound.DRAW]: { src: '/sounds/draw.mp3', gain: 0.6, jingle: true },
  [TSound.NO_MOVE]: { src: '/sounds/no-move.mp3', gain: 0.6, jingle: true },
};
const BACKGROUND_SOURCE = '/sounds/background.mp3';
// The music sits under the effects: at full music volume it plays at this level.
const BACKGROUND_LEVEL = 0.35;
const DUCKED = 0.3;
const FADE_SECONDS = 0.6;
// The same effect fired twice within this window (double events) plays once.
const REPEAT_WINDOW_MS = 40;

class Soundtrack {
  private context: AudioContext | null = null;
  private buffers: Partial<Record<TEffect, AudioBuffer>> = {};
  private loading: Promise<void> | null = null;
  private lastPlayed: Partial<Record<TEffect, number>> = {};
  private background: HTMLAudioElement | null = null;
  private backgroundGain: GainNode | null = null;
  private wantsBackground = false;
  private duckTimer: ReturnType<typeof setTimeout> | undefined;
  private pauseTimer: ReturnType<typeof setTimeout> | undefined;

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
      const response = await fetch(SOUND_EFFECTS[type].src);
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
      const types = Object.keys(SOUND_EFFECTS) as Array<TEffect>;
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
    const now = performance.now();
    if (now - (this.lastPlayed[type] ?? -Infinity) < REPEAT_WINDOW_MS) return;
    this.lastPlayed[type] = now;
    if (context.state === 'suspended') context.resume().catch(() => {});

    const { gain: level, vary, jingle } = SOUND_EFFECTS[type];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    if (vary) source.playbackRate.value = 0.96 + Math.random() * 0.08;
    gain.gain.value = level * volume * useConfigStore.getState().effectsVolume;
    source.connect(gain).connect(context.destination);
    source.start();
    if (jingle) this.duck(buffer.duration / source.playbackRate.value);
  }

  private musicLevel() {
    return BACKGROUND_LEVEL * useConfigStore.getState().musicVolume;
  }

  private rampBackground(value: number, seconds = FADE_SECONDS) {
    const { context, backgroundGain } = this;
    if (!context || !backgroundGain) return;
    const param = backgroundGain.gain;
    param.cancelScheduledValues(context.currentTime);
    param.setValueAtTime(param.value, context.currentTime);
    param.linearRampToValueAtTime(value, context.currentTime + seconds);
  }

  // Lowers the music while a jingle plays, then brings it back.
  private duck(seconds: number) {
    if (!this.wantsBackground) return;
    clearTimeout(this.duckTimer);
    this.rampBackground(this.musicLevel() * DUCKED, 0.15);
    this.duckTimer = setTimeout(() => this.rampBackground(this.musicLevel()), seconds * 1000);
  }

  private startBackground({ loop = true, volume }: TSoundConfigType) {
    if (typeof Audio === 'undefined') return;
    const context = this.getContext();
    if (!this.background) {
      this.background = new Audio(BACKGROUND_SOURCE);
      this.background.preload = 'auto';
      // Routed through Web Audio so it can fade in and out smoothly.
      if (context) {
        this.backgroundGain = context.createGain();
        this.backgroundGain.gain.value = 0;
        context.createMediaElementSource(this.background).connect(this.backgroundGain);
        this.backgroundGain.connect(context.destination);
      }
    }
    this.wantsBackground = true;
    clearTimeout(this.pauseTimer);
    this.background.loop = loop;
    if (!this.backgroundGain) this.background.volume = volume ?? this.musicLevel();
    if (context?.state === 'suspended') context.resume().catch(() => {});
    this.background
      .play()
      .then(() => this.rampBackground(volume ?? this.musicLevel()))
      .catch((err) => console.warn('Failed to play background:', err));
  }

  private pauseBackground(reset: boolean) {
    const background = this.background;
    if (!background) return;
    clearTimeout(this.duckTimer);
    clearTimeout(this.pauseTimer);
    this.rampBackground(0);
    this.pauseTimer = setTimeout(
      () => {
        background.pause();
        if (reset) background.currentTime = 0;
      },
      this.backgroundGain ? FADE_SECONDS * 1000 : 0
    );
  }

  /** Follows a change of the music volume setting while the music plays. */
  updateMusicVolume() {
    if (!this.wantsBackground) return;
    if (this.backgroundGain) this.rampBackground(this.musicLevel(), 0.1);
    else if (this.background) this.background.volume = this.musicLevel();
  }

  /** Pauses the music while the page is hidden and resumes it when the page comes back. */
  handleVisibility(hidden: boolean) {
    if (!this.wantsBackground || !this.background) return;
    if (hidden) this.pauseBackground(false);
    else this.startBackground({ type: TSound.BACKGROUND, loop: this.background.loop });
  }

  play(option: TSoundConfigType) {
    const { isEnabled = useConfigStore.getState().isSound, type, volume } = option;
    if (!isEnabled) return;
    try {
      if (type === TSound.BACKGROUND) this.startBackground(option);
      else this.playEffect(type, volume);
    } catch (err) {
      console.warn('Error playing sound:', err);
    }
  }

  stop(type: TSound) {
    if (type !== TSound.BACKGROUND) return;
    this.wantsBackground = false;
    this.pauseBackground(true);
  }
}

export const soundtrack = new Soundtrack();

if (typeof window !== 'undefined') {
  // Browsers only allow audio after a user gesture, so warm up on the first pointer press.
  window.addEventListener('pointerdown', () => void soundtrack.preload(), { once: true });
  document.addEventListener('visibilitychange', () =>
    soundtrack.handleVisibility(document.visibilityState === 'hidden')
  );
  useConfigStore.subscribe((state, previous) => {
    if (state.musicVolume !== previous.musicVolume) soundtrack.updateMusicVolume();
  });
}
