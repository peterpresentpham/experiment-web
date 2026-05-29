import { useEffect, useState } from 'react';
import { soundtrack } from 'src/services/soundtrack';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';

export default function useEnableSoundtrack() {
  const { backgroundSound } = useConfigStore();
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    const unlock = () => {
      soundtrack.preload();
      setAudioUnlocked(true);
    };

    window.addEventListener('click', unlock, { once: true });

    return () => {
      window.removeEventListener('click', unlock);
    };
  }, []);

  useEffect(() => {
    if (!audioUnlocked) return;

    if (backgroundSound) {
      soundtrack.play({
        type: TSound.BACKGROUND,
        loop: true,
        volume: 0.4,
        isEnabled: true,
      });
    } else {
      soundtrack.stop(TSound.BACKGROUND);
    }
  }, [backgroundSound, audioUnlocked]);
}
