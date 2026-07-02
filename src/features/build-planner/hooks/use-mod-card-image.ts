import { useEffect, useRef, useState } from 'react';

interface ModCardImageData {
  uniqueName?: string;
  displayName: string;
  description?: string;
  rarity: string;
  polarity: string;
  baseDrain: number;
  fusionLimit: number;
  iconName?: string;
  compatName?: string;
  modSet?: string;
}

const imageCache = new Map<string, string>();

export function useModCardImage(
  data: ModCardImageData | null,
  rank: number,
  format: 'expanded' | 'collapsed',
  setBonus?: number,
): string | null {
  const cacheKey = data
    ? `${data.uniqueName ?? data.displayName}_r${rank}_${format}_s${setBonus ?? 0}`
    : null;

  const [src, setSrc] = useState<string | null>(
    cacheKey ? imageCache.get(cacheKey) ?? null : null,
  );
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!data || !cacheKey) {
      setTimeout(() => setSrc(null), 0);
      return;
    }
    if (imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey)!;
      setTimeout(() => setSrc(cached), 0);
      return;
    }
    let active = true;
    window.forge.generateModCard(data, rank, format, setBonus).then(buf => {
      if (!active || !buf) return;
      const blob = new Blob([buf], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      imageCache.set(cacheKey, url);
      if (active) {
        setTimeout(() => setSrc(url), 0);
      } else {
        URL.revokeObjectURL(url);
      }
    });
    return () => {
      active = false;
      if (prevUrl.current && prevUrl.current !== src && prevUrl.current.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl.current);
      }
      prevUrl.current = src;
    };
  }, [cacheKey, rank, format, setBonus, data, src]);

  return src;
}
