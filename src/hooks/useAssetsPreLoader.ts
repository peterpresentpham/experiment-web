import { useEffect, useRef } from 'react';

const BATCH_SIZE = 10;

export default function useAssetsPreLoader(assets: Array<string>) {
  const imageCache = useRef<Set<HTMLImageElement>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preloadImage = (src: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          imageCache.current.add(img);
          resolve(src);
        };
        img.onerror = () => resolve(src);
      });
    };

    async function preloadAll() {
      for (let i = 0; i < assets.length; i += BATCH_SIZE) {
        const batch = assets.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(preloadImage));
      }
    }

    void preloadAll();
  }, [assets]);
}
