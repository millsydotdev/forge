import { parsePolarity } from '../../../engine/polarity';
import type { ItemOption, ModSlot } from '../model';
import { logger } from '../../../utils/logger';

export async function enrichMod(m: ItemOption): Promise<ModSlot | null> {
  try {
    const d = await window.forge.getItemDetail(m.uniqueName) as ItemDetail | null;
    if (!d) return null;
    const isArcane = d.category === 'Arcanes' || (d.type ?? '').toLowerCase().includes('arcane');
    const baseDrain = isArcane ? 0 : (d.baseDrain ?? 6);
    const maxRank = isArcane ? (d.levelStats?.length ?? 1) - 1 : (d.fusionLimit ?? 3);
    return {
      uniqueName: m.uniqueName, name: m.name, rank: maxRank, maxRank,
      baseDrain, polarity: parsePolarity(isArcane ? 'universal' : (d.polarity ?? 'universal')),
      type: d.type, imageName: d.imageName, rarity: d.rarity ?? 'Common',
    };
  } catch (e) { logger.warn('[enrichMod] failed for', m.uniqueName, e); return null; }
}
