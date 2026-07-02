import { useEffect, useRef } from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { logger } from '../utils/logger';
import { searchIndex } from '../services/search-index';

type ItemInfoWithCompat = ItemInfo & { compatName?: string };

const CATEGORIES = [
  'Warframes', 'Primary', 'Secondary', 'Melee',
  'Arch-Gun', 'Arch-Melee', 'Mods', 'Companions',
  'CompanionWeapons', 'Arcanes',
] as const;

export function useLibraryData() {
  const setLibraryData = useLibraryStore((s) => s.setLibraryData);
  const loading = useLibraryStore((s) => s.loading);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    logger.info('[LibraryData] fetching items from main process...');
    Promise.all(CATEGORIES.map((cat) => window.forge.getItems(cat)))
      .then(([wf, pri, sec, mel, archGun, archMelee, mods, comps, compWeaps, arcanes]) => {
        const best = new Map<string, ItemInfoWithCompat>();
        for (const m of mods) {
          const existing = best.get(m.name);
          if (!existing || (m.baseDrain ?? 0) > (existing.baseDrain ?? 0)) {
            best.set(m.name, m);
          }
        }

        setLibraryData({
          warframes: wf,
          weapons: {
            primary: pri, secondary: sec, melee: mel,
            'arch-gun': archGun, 'arch-melee': archMelee,
          },
          allMods: [...best.values()],
          allArcanes: arcanes,
          companions: comps,
          companionWeapons: compWeaps,
          allFrames: wf,
        });

        // Build search index after data is loaded
        searchIndex.build(
          [...best.values()],
          wf,
          { primary: pri, secondary: sec, melee: mel, 'arch-gun': archGun, 'arch-melee': archMelee },
          arcanes,
          comps,
        );
        logger.info(`[SearchIndex] Built: ${searchIndex.stats.documents} documents, ${searchIndex.stats.indexTerms} terms in ${searchIndex.stats.buildTime.toFixed(0)}ms`);
      })
      .catch((e) => {
        logger.error('[LibraryData] failed to fetch items:', e);
      });
  }, [setLibraryData]);

  return { loading };
}
