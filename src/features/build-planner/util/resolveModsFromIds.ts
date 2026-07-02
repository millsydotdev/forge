import type { ModSlot, ArcaneSlot } from '../model';
import type { Polarity } from '../../../engine/build-core';
import { parsePolarity } from '../../../engine/polarity';
import { logger } from '../../../utils/logger';

type ItemDetail = {
  name: string;
  fusionLimit?: number;
  baseDrain?: number;
  polarity?: string;
  imageName?: string;
  rarity?: string;
  type?: string;
};

export interface RichModSlot extends ModSlot {
  uniqueName: string;
  name: string;
  rank: number;
  maxRank: number;
  baseDrain: number;
  polarity: Polarity;
  type?: string;
  imageName?: string;
  rarity?: string;
}

export async function resolveModTuple(
  id: string,
  rank: number,
): Promise<RichModSlot | null> {
  try {
    const d = await window.forge.getItemDetail(id) as ItemDetail | null;
    if (!d) return null;
    return {
      uniqueName: id,
      name: d.name,
      rank,
      maxRank: d.fusionLimit ?? 3,
      baseDrain: d.baseDrain ?? 6,
      polarity: parsePolarity(d.polarity ?? 'universal'),
      type: d.type,
      imageName: d.imageName,
      rarity: d.rarity,
    };
  } catch (e) {
    logger.warn('[resolveModTuple] failed for', id, e);
    return null;
  }
}

export async function resolveModTuples(
  tuples: [string, number][],
): Promise<RichModSlot[]> {
  const results = await Promise.all(
    tuples.map(([id, rank]) => resolveModTuple(id, rank)),
  );
  return results.filter(Boolean) as RichModSlot[];
}

export async function resolveArcaneTuple(
  id: string,
  rank: number,
): Promise<ArcaneSlot | null> {
  try {
    const d = await window.forge.getItemDetail(id) as ItemDetail | null;
    if (!d) return null;
    return { uniqueName: id, name: d.name, rank, maxRank: d.fusionLimit ?? 3 };
  } catch (e) {
    logger.warn('[resolveArcaneTuple] failed for', id, e);
    return null;
  }
}

export async function resolveArcaneTuples(
  tuples: ([string, number] | null)[],
): Promise<(ArcaneSlot | null)[]> {
  return Promise.all(
    tuples.map((a) =>
      a ? resolveArcaneTuple(a[0], a[1]) : Promise.resolve(null),
    ),
  );
}

export function resolveShards(
  shards: ({ color: string | null; isTau: boolean } | null)[] | undefined,
): { color: string | null; isTau: boolean }[] {
  if (!shards) return Array.from({ length: 5 }, () => ({ color: null, isTau: false }));
  return shards.map((s) =>
    s
      ? { color: s.color as string | null, isTau: s.isTau ?? false }
      : { color: null, isTau: false },
  );
}

export function assertNever(_value: never): void {
}
