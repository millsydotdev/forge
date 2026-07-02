import { useEffect } from 'react';
import type { Polarity } from '../../../engine/build-core';
import { parsePolarity } from '../../../engine/polarity';
import type { ItemOption } from '../model';
import type { ArcaneSlot, ModSlot, ShardColor } from '../model';
import { DEFAULT_POLARITY } from '../model';
import type { OverwolfMessage, OverwolfLoadout, OverwolfModItem, OverwolfArcaneItem, LegacyLoadout } from '../types/overwolf-types';
import { logger } from '../../../utils/logger';

declare const overwolf: {
  windows: {
    onMessageReceived: {
      addListener(handler: (msg: OverwolfMessage) => void): void;
      removeListener(handler: (msg: OverwolfMessage) => void): void;
    };
  };
};

export function useOverwolf(
  allModsRef: React.MutableRefObject<ItemOption[]>,
  warframesRef: React.MutableRefObject<ItemOption[]>,
  allWeaponsRef: React.MutableRefObject<ItemOption[]>,
  companionsRef: React.MutableRefObject<ItemOption[]>,
  allArcanesRef: React.MutableRefObject<ItemOption[]>,
  setOwnedModIds: (ids: Set<string> | null) => void,
  setOwnedWarframeIds: (ids: Set<string> | null) => void,
  setOwnedWeaponIds: (ids: Set<string> | null) => void,
  setOwnedCompanionIds: (ids: Set<string> | null) => void,
  setOwnedArcaneIds: (ids: Set<string> | null) => void,
  setWf: React.Dispatch<React.SetStateAction<import('../model').WarframeState>>,
  setWeaponStates: React.Dispatch<React.SetStateAction<Record<string, import('../model').WeaponState>>>,
  setComp: React.Dispatch<React.SetStateAction<import('../model').CompanionState>>,
  setHelminth: React.Dispatch<React.SetStateAction<import('../model').HelminthState>>,
  setPlayerName: (name: string | null) => void,
) {
  useEffect(() => {
    if (typeof overwolf === 'undefined') return;

    async function enrichSlot(un: string, rank: number | null): Promise<ModSlot | null> {
      try {
        const d = await window.forge.getItemDetail(un);
        if (!d) return null;
        const isArcane = d.category === 'Arcanes' || (d.type ?? '').toLowerCase().includes('arcane');
        const baseDrain = isArcane ? 0 : (d.baseDrain ?? 6);
        const maxRank = isArcane ? (d.levelStats?.length ?? 1) - 1 : (d.fusionLimit ?? 3);
        return {
          uniqueName: un, name: d.name,
          rank: rank != null ? Math.min(rank, maxRank) : maxRank,
          maxRank, baseDrain,
          polarity: parsePolarity(isArcane ? 'universal' : (d.polarity ?? 'universal')),
          type: d.type, imageName: d.imageName, rarity: d.rarity ?? 'Common',
        };
      } catch (e) { logger.warn('[useOverwolf] enrichSlot failed:', e); return null; }
    }

    async function enrichArcane(un: string, rank: number): Promise<ArcaneSlot | null> {
      try {
        const d = await window.forge.getItemDetail(un);
        if (!d) return null;
        const maxRank = (d.levelStats?.length ?? 1) - 1;
        return { uniqueName: un, name: d.name, rank: Math.min(rank, maxRank), maxRank };
      } catch (e) { logger.warn('[useOverwolf] enrichArcane failed:', e); return null; }
    }

    async function applyGEPLoadout(lo: OverwolfLoadout) {
      const wfData = lo.warframe;
      const weps = lo.weapons ?? {};
      const compData = lo.companion;

      if (wfData?.id) {
        const [aura, exilus, ...mods] = await Promise.all([
          wfData.aura ? enrichSlot(wfData.aura.uniqueName, wfData.aura.rank) : Promise.resolve(null),
          wfData.exilus ? enrichSlot(wfData.exilus.uniqueName, wfData.exilus.rank) : Promise.resolve(null),
          ...(wfData.mods || []).map((m: OverwolfModItem) => enrichSlot(m.uniqueName, m.rank)),
        ]);
        const arcaneResults = await Promise.all(
          (wfData.arcanes || [null, null]).map((a: OverwolfArcaneItem | null) => a ? enrichArcane(a.uniqueName, a.rank) : Promise.resolve(null))
        );
        const shards = (wfData.shards || []).slice(0, 5);
        while (shards.length < 5) shards.push({ color: null, isTau: false });
        setWf({
          id: wfData.id,
          aura, exilus,
          mods: mods.filter(Boolean) as ModSlot[],
          slotPolarities: Array(10).fill(DEFAULT_POLARITY) as Polarity[],
          shards: shards.map((s) => ({ color: (s?.color as ShardColor) ?? null, isTau: s?.isTau ?? false })),
          arcanes: [arcaneResults[0], arcaneResults[1]] as [ArcaneSlot | null, ArcaneSlot | null],
          exaltedWeapon: null,
        });
        if (wfData.helminthDonor) {
          setHelminth({ enabled: true, donorId: wfData.helminthDonor, slotIndex: 0 });
        }
      }

      for (const slot of ['primary', 'secondary', 'melee'] as const) {
        const w = weps[slot];
        if (!w?.id) continue;
        const wMods = await Promise.all((w.mods || []).map((m: OverwolfModItem) => enrichSlot(m.uniqueName, m.rank)));
        const wArcanes = await Promise.all(
          (w.arcanes || [null, null]).map((a: OverwolfArcaneItem | null) => a ? enrichArcane(a.uniqueName, a.rank) : Promise.resolve(null))
        );
        setWeaponStates(p => ({
          ...p,
          [slot]: {
            ...p[slot],
            id: w.id,
            mods: wMods.filter(Boolean) as ModSlot[],
            arcanes: [wArcanes[0], wArcanes[1]] as [ArcaneSlot | null, ArcaneSlot | null],
          },
        }));
      }

      if (compData?.id) {
        const cMods = await Promise.all((compData.mods || []).map((m: OverwolfModItem) => enrichSlot(m.uniqueName, m.rank)));
        const cwMods = compData.weaponMods
          ? await Promise.all(compData.weaponMods.map((m: OverwolfModItem) => enrichSlot(m.uniqueName, m.rank)))
          : [];
        setComp(p => ({
          ...p,
          id: compData.id,
          weaponId: compData.weaponId ?? '',
          mods: cMods.filter(Boolean) as ModSlot[],
          weaponMods: cwMods.filter(Boolean) as ModSlot[],
        }));
      }
    }

    const handler = (msg: OverwolfMessage) => {
      if (msg.id === 'inventory-update') {
        const data = msg.data;
        if (data?.uniqueNames && Array.isArray(data.uniqueNames)) {
          const modSet = new Set(allModsRef.current.map(m => m.uniqueName));
          const wfSet = new Set(warframesRef.current.map(w => w.uniqueName));
          const wpSet = new Set(allWeaponsRef.current.map(w => w.uniqueName));
          const compSet = new Set(companionsRef.current.map(c => c.uniqueName));
          const arcSet = new Set(allArcanesRef.current.map(a => a.uniqueName));

          const ownedMods = new Set<string>();
          const ownedWfs = new Set<string>();
          const ownedWeps = new Set<string>();
          const ownedComps = new Set<string>();
          const ownedArcs = new Set<string>();

          for (const un of data.uniqueNames) {
            if (modSet.has(un)) ownedMods.add(un);
            if (wfSet.has(un)) ownedWfs.add(un);
            if (wpSet.has(un)) ownedWeps.add(un);
            if (compSet.has(un)) ownedComps.add(un);
            if (arcSet.has(un)) ownedArcs.add(un);
          }
          setOwnedModIds(ownedMods.size > 0 ? ownedMods : null);
          setOwnedWarframeIds(ownedWfs.size > 0 ? ownedWfs : null);
          setOwnedWeaponIds(ownedWeps.size > 0 ? ownedWeps : null);
          setOwnedCompanionIds(ownedComps.size > 0 ? ownedComps : null);
          setOwnedArcaneIds(ownedArcs.size > 0 ? ownedArcs : null);
        } else if (Array.isArray(data)) {
          const mods = (data as ItemOption[]).filter(i => i.category === 'Mods');
          setOwnedModIds(mods.length > 0 ? new Set(mods.map(m => m.uniqueName)) : null);
        }
      }
      if (msg.id === 'loadout-update') {
        const lo = msg.data as OverwolfLoadout | LegacyLoadout;
        if (lo && 'warframe' in lo && (lo as OverwolfLoadout).warframe?.id) {
          applyGEPLoadout(lo as OverwolfLoadout);
        } else {
          const legacy = lo as LegacyLoadout;
          setWf({
            id: legacy.warframe?.id ?? '',
            aura: legacy.warframe?.aura ?? null,
            exilus: legacy.warframe?.exilus ?? null,
            mods: legacy.warframe?.mods ?? [],
            slotPolarities: legacy.warframe?.slotPolarities ?? [],
            shards: legacy.warframe?.shards ?? Array.from({ length: 5 }, () => ({ color: null, isTau: false })),
            arcanes: legacy.warframe?.arcanes ?? [null, null],
            exaltedWeapon: null,
          });
          setWeaponStates(p => ({
            ...p,
            primary: legacy.weapons?.primary ?? p.primary,
            secondary: legacy.weapons?.secondary ?? p.secondary,
            melee: legacy.weapons?.melee ?? p.melee,
          }));
          setComp({
            compType: legacy.companion?.type ?? 'sentinel',
            id: legacy.companion?.id ?? '',
            weaponId: legacy.companion?.weaponId ?? '',
            mods: legacy.companion?.mods ?? [],
            weaponMods: legacy.companion?.weaponMods ?? [],
            slotPolarities: legacy.companion?.slotPolarities ?? Array(8).fill(DEFAULT_POLARITY) as Polarity[],
            weaponSlotPolarities: legacy.companion?.weaponSlotPolarities ?? Array(8).fill(DEFAULT_POLARITY) as Polarity[],
          });
        }
      }
      if (msg.id === 'player-name' && msg.data?.name) {
        setPlayerName(msg.data.name);
      }
    };

    overwolf.windows.onMessageReceived.addListener(handler);
    return () => {
      overwolf.windows.onMessageReceived.removeListener(handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
