import type { Modifier } from '../modifier';

export interface ResolvedBucket {
  flat: number;
  multiplier: number;
}

export function bucketify(mods: Modifier[]): Map<string, ResolvedBucket> {
  const buckets = new Map<string, { flat: number[]; multiplier: number[] }>();

  for (const mod of mods) {
    const key = `${mod.stat}::${mod.stackingGroup}`;
    if (!buckets.has(key)) buckets.set(key, { flat: [], multiplier: [] });
    const bucket = buckets.get(key)!;
    if (mod.category === 'FLAT') bucket.flat.push(mod.value);
    else bucket.multiplier.push(mod.value);
  }

  const resolved = new Map<string, ResolvedBucket>();
  for (const [key, bucket] of buckets) {
    resolved.set(key, {
      flat: bucket.flat.reduce((sum, value) => sum + value, 0),
      multiplier: 1 + bucket.multiplier.reduce((sum, value) => sum + value, 0),
    });
  }
  return resolved;
}

export function resolveFlat(buckets: Map<string, ResolvedBucket>, key: string): number {
  return buckets.get(key)?.flat ?? 0;
}

export function resolveMultiplied(buckets: Map<string, ResolvedBucket>, key: string): number {
  const bucket = buckets.get(key);
  if (!bucket) return 0;
  return bucket.flat * bucket.multiplier;
}

export function resolveStatWithBase(
  buckets: Map<string, ResolvedBucket>,
  flatKey: string,
  multKey: string,
): number {
  const base = resolveFlat(buckets, flatKey);
  const bucket = buckets.get(multKey);
  if (!bucket) return base;
  return base * bucket.multiplier;
}

export function sumMultipliersForGroup(
  buckets: Map<string, ResolvedBucket>,
  statPrefix: string,
  stackingGroup: string,
): number {
  let total = 0;
  for (const [key, bucket] of buckets) {
    if (key.startsWith(`${statPrefix}_`) && key.endsWith(`::${stackingGroup}`)) {
      total += bucket.multiplier - 1;
    }
  }
  return total;
}

export function collectDamageTypes(buckets: Map<string, ResolvedBucket>): Record<string, number> {
  const damage: Record<string, number> = {};
  for (const [key, bucket] of buckets) {
    if (!key.startsWith('damage_') || !key.endsWith('::weapon_damage_types')) continue;
    const type = key.slice('damage_'.length, key.indexOf('::'));
    damage[type] = (damage[type] ?? 0) + bucket.flat;
  }
  return damage;
}
