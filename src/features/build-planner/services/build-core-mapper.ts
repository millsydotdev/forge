import type { BuildCore, EquippedArcane, EquippedMod, EquippedShard, WeaponBuild, CompanionBuild } from '../../../engine/build-core';
import { polarityMatches } from '../../../engine/polarity';
import type { ArcaneSlot, CompanionState, HelminthState, ModSlot, WarframeState, WeaponState } from '../model';
import { getRiven } from './riven-store';

function toMod(mod: ModSlot, slotPolarity: EquippedMod['slotPolarity']): EquippedMod {
  if (mod.uniqueName.startsWith('riven_custom_')) {
    const rivenData = getRiven(mod.uniqueName);
    return {
      id: mod.uniqueName,
      rank: mod.rank,
      slotPolarity,
      polarityMatch: polarityMatches(mod.polarity, slotPolarity),
      rivenData: rivenData ?? undefined,
    };
  }
  return {
    id: mod.uniqueName,
    rank: mod.rank,
    slotPolarity,
    polarityMatch: polarityMatches(mod.polarity, slotPolarity),
  };
}

function toArcane(arcane: ArcaneSlot | null): EquippedArcane | null {
  return arcane ? { id: arcane.uniqueName, rank: arcane.rank } : null;
}

function toWeapon(slot: 'primary' | 'secondary' | 'melee' | 'arch-gun' | 'arch-melee', weapon: WeaponState | undefined): WeaponBuild | null {
  if (!weapon?.id) return null;
  const pols = weapon.slotPolarities;
  return {
    id: weapon.id,
    slot,
    normalMods: weapon.mods.map((m, i) => toMod(m, pols[i + 2] ?? 'UNIVERSAL')),
    exilus: weapon.exilus ? toMod(weapon.exilus, pols[1] ?? 'UNIVERSAL') : null,
    arcanes: [toArcane(weapon.arcanes[0]), toArcane(weapon.arcanes[1])],
  };
}

export function toBuildCore(
   warframe: WarframeState,
   weapons: Record<string, WeaponState>,
   companion: CompanionState,
   helminth: HelminthState,
   targetFaction?: string,
   isAiming?: boolean,
   activeStatuses?: number,
   operatorId: string | null = null,
   focusNodes: string[] = [],
   arcane: string | null = null,
 ): BuildCore {
   const wfPols = warframe.slotPolarities;
   const equippedShards: EquippedShard[] = [];
   for (const slot of warframe.shards) {
     if (slot.color) {
       equippedShards.push({ id: '', color: slot.color, isTau: slot.isTau });
     }
   }
   return {
     name: 'Forge Build',
     warframe: {
       id: warframe.id || '',
       aura: warframe.aura ? toMod(warframe.aura, wfPols[0] ?? 'UNIVERSAL') : null,
       exilus: warframe.exilus ? toMod(warframe.exilus, wfPols[1] ?? 'UNIVERSAL') : null,
       normalMods: warframe.mods.map((m, i) => toMod(m, wfPols[i + 2] ?? 'UNIVERSAL')),
       arcanes: [toArcane(warframe.arcanes[0]), toArcane(warframe.arcanes[1])],
       shards: equippedShards,
       helminth: helminth.enabled && helminth.donorId
         ? { donorWarframeId: helminth.donorId, slotIndex: helminth.slotIndex, replacesAbilityIndex: helminth.slotIndex }
         : null,
       exaltedWeapon: null,
     },
      primary: toWeapon('primary', weapons.primary),
      secondary: toWeapon('secondary', weapons.secondary),
      melee: toWeapon('melee', weapons.melee),
      'arch-gun': toWeapon('arch-gun', weapons['arch-gun']),
      'arch-melee': toWeapon('arch-melee', weapons['arch-melee']),
     companion: companion.id ? {
       id: companion.id,
       type: companion.compType as CompanionBuild['type'],
       normalMods: companion.mods.map((m, i) => toMod(m, companion.slotPolarities[i] ?? 'UNIVERSAL')),
       slotPolarities: companion.slotPolarities,
       weapon: companion.weaponId ? {
         id: companion.weaponId,
         normalMods: companion.weaponMods.map((m, i) => toMod(m, companion.weaponSlotPolarities[i] ?? 'UNIVERSAL')),
         slotPolarities: companion.weaponSlotPolarities,
       } : null,
     } : null,
     operator: operatorId ? {
       id: operatorId,
       focusNodes,
        arcane: arcane ? toArcane({ uniqueName: arcane, name: arcane, rank: 0, maxRank: 5 }) : null,
     } : null,
     targetFaction,
     isAiming,
     activeStatuses,
   };
 }
