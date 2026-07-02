import { useEffect, useReducer } from 'react';
import type { EnemyDef, ExaltedEntry, HelminthAbilityDef, FocusSchoolDef, SquadBuffDef, ShardDef } from '../shared/game-data-types';

interface GameDataCache {
  enemies: EnemyDef[];
  exaltedDefs: Record<string, ExaltedEntry>;
  incarnonDefs: string[];
  helminthAbilities: HelminthAbilityDef[];
  focusSchools: FocusSchoolDef[];
  squadBuffs: SquadBuffDef[];
  shardDefs: ShardDef[];
}

const cache: Partial<GameDataCache> = {};
let loading = false;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

async function loadGameData(): Promise<void> {
  if (loaded || loading) return;
  loading = true;
  try {
    const [enemies, exaltedDefs, incarnonDefs, helminthAbilities, focusSchools, squadBuffs, shardDefs] = await Promise.all([
      window.forge.getEnemies(),
      window.forge.getExaltedDefs(),
      window.forge.getIncarnonDefs(),
      window.forge.getHelminthAbilities(),
      window.forge.getFocusSchools(),
      window.forge.getSquadBuffs(),
      window.forge.getShardDefs(),
    ]);
    cache.enemies = enemies;
    cache.exaltedDefs = exaltedDefs;
    cache.incarnonDefs = incarnonDefs;
    cache.helminthAbilities = helminthAbilities;
    cache.focusSchools = focusSchools;
    cache.squadBuffs = squadBuffs;
    cache.shardDefs = shardDefs;
    loaded = true;
    notify();
  } catch {
    loaded = false;
  } finally {
    loading = false;
  }
}

export function useGameData(): GameDataCache & { loaded: boolean } {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (!loaded && !loading) loadGameData();
    listeners.add(forceUpdate);
    return () => { listeners.delete(forceUpdate); };
  }, [forceUpdate]);

  return {
    enemies: cache.enemies ?? [],
    exaltedDefs: cache.exaltedDefs ?? {},
    incarnonDefs: cache.incarnonDefs ?? [],
    helminthAbilities: cache.helminthAbilities ?? [],
    focusSchools: cache.focusSchools ?? [],
    squadBuffs: cache.squadBuffs ?? [],
    shardDefs: cache.shardDefs ?? [],
    loaded,
  };
}

export function getExaltedForWarframe(uniqueName: string): ExaltedEntry | undefined {
  return cache.exaltedDefs?.[uniqueName];
}

export function isIncarnonWeapon(uniqueName: string): boolean {
  return cache.incarnonDefs?.includes(uniqueName) ?? false;
}

export function getEnemyByName(name: string): EnemyDef | undefined {
  return cache.enemies?.find(e => e.name === name);
}

export function getHelminthByDonor(donorUniqueName: string): HelminthAbilityDef | undefined {
  return cache.helminthAbilities?.find(h => h.donorUniqueName === donorUniqueName);
}

export function getShardDef(color: string): ShardDef | undefined {
  return cache.shardDefs?.find(s => s.color === color);
}
