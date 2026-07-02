import type { Modifier } from '../modifier';
import type { EquippedArcane, EquippedMod, EquippedShard } from '../build-core';
import type { ItemResolver } from './types';

export function resolveMods(resolver: ItemResolver, mods: EquippedMod[]): Modifier[] {
  return mods.flatMap(mod => resolver.resolveMod(mod));
}

export function resolveArcanes(
  resolver: ItemResolver,
  arcanes: [EquippedArcane | null, EquippedArcane | null],
): Modifier[] {
  return arcanes.flatMap(arcane => arcane ? resolver.resolveArcane(arcane) : []);
}

export function resolveShards(resolver: ItemResolver, shards: EquippedShard[]): Modifier[] {
  return shards.flatMap(shard => resolver.resolveShard(shard));
}

export function sortMods(mods: Modifier[]): Modifier[] {
  return [...mods].sort((a, b) => a.priority - b.priority);
}

export function adjustModifiers(mods: Modifier[], isAiming: boolean): Modifier[] {
  return mods.map(mod => {
    if (isAiming) {
      if (mod.stat === 'aiming_crit_chance') return { ...mod, stat: 'crit_chance' };
      if (mod.stat === 'aiming_crit_dmg') return { ...mod, stat: 'crit_damage' };
      if (mod.stat === 'aiming_accuracy') return { ...mod, stat: 'accuracy' };
      if (mod.stat === 'aiming_fire_rate') return { ...mod, stat: 'fire_rate' };
      if (mod.stat === 'aiming_status_chance') return { ...mod, stat: 'status_chance' };
      if (mod.stat === 'aiming_damage') return { ...mod, stat: 'base_damage' };
    }
    return mod;
  });
}
