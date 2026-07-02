import { useMemo } from 'react';
import { visualManager } from '../services/visual-manager';

/** Resolves a Warframe CDN image URL via VisualManager. */
export function useAssetUrl(imageName?: string): string {
  return useMemo(() => (imageName ? visualManager.getImageUrl(imageName) : visualManager.getPlaceholder('generic')), [imageName]);
}
