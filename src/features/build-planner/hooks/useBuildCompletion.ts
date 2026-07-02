import { useMemo } from 'react';
import { useBuildStore } from '../../../store/buildStore';
import { useLibraryStore } from '../../../store/libraryStore';
import type { OwnershipState } from '../model';

export interface MissingItem {
  type: 'mod' | 'arcane' | 'weapon' | 'warframe' | 'shard' | 'focus' | 'helminth';
  name: string;
  state: OwnershipState;
  details: string;
}

export interface BuildCompletion {
  percentComplete: number;
  total: number;
  completed: number;
  missing: MissingItem[];
}

const WEAPON_SLOTS = ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee'] as const;

export function useBuildCompletion(): BuildCompletion | null {
  const build = useBuildStore();
  const lib = useLibraryStore();

  return useMemo(() => {
    if (!build.wf.id) return null;

    const missing: MissingItem[] = [];
    let total = 0;
    let completed = 0;

    const ownedMods = lib.ownedModIds;
    const ownedWfs = lib.ownedWarframeIds;
    const ownedWeps = lib.ownedWeaponIds;
    const ownedArcs = lib.ownedArcaneIds;

    const isOwned = (set: Set<string> | null, id: string): boolean => {
      if (!set) return true;
      return set.has(id);
    };

    // ── Warframe ────────────────────────────────
    if (build.wf.id) {
      total++;
      if (isOwned(ownedWfs, build.wf.id)) completed++;
      else missing.push({ type: 'warframe', name: build.wf.id.split('/').pop() || 'Warframe', state: 'missing', details: 'Warframe not in inventory' });
    }

    // ── Mods (warframe) ─────────────────────────
    const frameMods = [
      build.wf.aura && { ...build.wf.aura, label: 'Aura' },
      build.wf.exilus && { ...build.wf.exilus, label: 'Exilus' },
      ...build.wf.mods.map(m => ({ ...m, label: 'Mod' })),
    ].filter(Boolean);

    for (const mod of frameMods) {
      if (!mod) continue;
      total++;
      if (isOwned(ownedMods, mod.uniqueName)) completed++;
      else missing.push({ type: 'mod', name: mod.name || mod.uniqueName, state: 'missing', details: 'Mod not in inventory' });
    }

    // ── Arcanes (warframe) ──────────────────────
    for (const arc of build.wf.arcanes) {
      if (arc) {
        total++;
        if (isOwned(ownedArcs, (arc as any).uniqueName)) completed++;
        else missing.push({ type: 'arcane', name: (arc as any).name || (arc as any).uniqueName, state: 'missing', details: 'Arcane not in inventory' });
      }
    }

    // ── Shards ──────────────────────────────────
    for (const shard of build.wf.shards) {
      if (shard.color) {
        total++;
        completed++;
      }
    }

    // ── Weapons ─────────────────────────────────
    for (const slot of WEAPON_SLOTS) {
      const wp = build.weaponStates[slot];
      if (wp && wp.id) {
        total++;
        if (isOwned(ownedWeps, wp.id)) completed++;
        else missing.push({ type: 'weapon', name: wp.id.split('/').pop() || 'Weapon', state: 'missing', details: 'Weapon not in inventory' });
        for (const mod of wp.mods) {
          total++;
          if (isOwned(ownedMods, mod.uniqueName)) completed++;
          else missing.push({ type: 'mod', name: mod.name || mod.uniqueName, state: 'missing', details: 'Mod not in inventory' });
        }
        if (wp.arcanes) {
          for (const arc of wp.arcanes) {
            if (arc) {
              total++;
              if (isOwned(ownedArcs, (arc as any).uniqueName)) completed++;
              else missing.push({ type: 'arcane', name: (arc as any).name || (arc as any).uniqueName, state: 'missing', details: 'Arcane not in inventory' });
            }
          }
        }
      }
    }

    // ── Companion ──────────────────────────────
    if (build.comp && build.comp.id) {
      total++;
      if (isOwned(ownedWfs, build.comp.id)) completed++;
      else missing.push({ type: 'warframe', name: build.comp.id.split('/').pop() || 'Companion', state: 'missing', details: 'Companion not in inventory' });
      for (const mod of build.comp.mods) {
        total++;
        if (isOwned(ownedMods, mod.uniqueName)) completed++;
        else missing.push({ type: 'mod', name: mod.name || mod.uniqueName, state: 'missing', details: 'Mod not in inventory' });
      }
    }

    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentComplete, total, completed, missing };
  }, [
    build, lib.ownedModIds, lib.ownedWarframeIds,
    lib.ownedWeaponIds, lib.ownedArcaneIds,
  ]);
}
