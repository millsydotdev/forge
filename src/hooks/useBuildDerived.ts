import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { modDrainAtRank, polarityMatches, warframeCapacity, weaponCapacity } from '../engine/polarity';
import type { CapacityBreakdown } from '../engine/polarity';
import { calcModCost, DEFAULT_POLARITY } from '../features/build-planner/model';
import { useBuildStore } from '../store/buildStore';
import { useUiStore } from '../store/uiStore';
import { CATEGORIES } from '../features/build-planner/types/overwolf-types';

export function useBuildDerived() {
  const build = useBuildStore(useShallow(s => ({...s})));
  const ui = useUiStore(useShallow(s => ({ activeSlot: s.activeSlot })));

  const wfCapacity = useMemo<CapacityBreakdown | null>(() => {
    if (!build.wf.id) return null;
    const auraCost = build.wf.aura ? calcModCost(build.wf.aura, build.wf.slotPolarities[0]) : 0;
    const auraMatch = build.wf.aura ? polarityMatches(build.wf.aura.polarity, build.wf.slotPolarities[0]) : true;
    const auraDrain = build.wf.aura ? modDrainAtRank(build.wf.aura.baseDrain, build.wf.aura.rank) : 0;
    const modCosts = build.wf.mods.map((m, i) => calcModCost(m, build.wf.slotPolarities[i + 2]));
    const exilusCost = build.wf.exilus ? calcModCost(build.wf.exilus, build.wf.slotPolarities[1]) : 0;
    return warframeCapacity({ auraDrain, auraMatched: auraMatch, modCosts: [exilusCost, ...modCosts, auraCost], mr: build.mr });
  }, [build.wf, build.mr]);

  const wpCapacity = useMemo<CapacityBreakdown | null>(() => {
    const isWp = ui.activeSlot !== 'warframe' && ui.activeSlot !== 'companion' && ui.activeSlot !== 'companion_weapon';
    if (!isWp) return null;
    const ws = build.weaponStates[ui.activeSlot];
    if (!ws?.id) return null;
    const modCosts = ws.mods.map((m, i) => calcModCost(m, ws.slotPolarities[i + 1]));
    const exilusCost = ws.exilus ? calcModCost(ws.exilus, ws.slotPolarities[0]) : 0;
    return weaponCapacity({ stanceDrain: 0, stanceMatched: true, modCosts: [exilusCost, ...modCosts], mr: build.mr });
  }, [build.weaponStates, ui.activeSlot, build.mr]);

  const compCapacity = useMemo<CapacityBreakdown | null>(() => {
    if (!build.comp.id) return null;
    const modCosts = build.comp.mods.map((m, i) => calcModCost(m, build.comp.slotPolarities[i] ?? DEFAULT_POLARITY));
    return weaponCapacity({ stanceDrain: 0, stanceMatched: true, modCosts, mr: build.mr });
  }, [build.comp, build.mr]);

  const curWeapon = build.weaponStates[ui.activeSlot] ?? null;
  const curCategory = CATEGORIES.find(c => c.key === ui.activeSlot);

  const equippedCount = useMemo(() => {
    if (ui.activeSlot === 'warframe') return build.wf.mods.filter((m) => m.uniqueName).length;
    if (ui.activeSlot === 'companion') return build.comp.mods.filter((m) => m.uniqueName).length;
    if (ui.activeSlot === 'companion_weapon') return build.comp.weaponMods.filter((m) => m.uniqueName).length;
    const ws = build.weaponStates[ui.activeSlot];
    if (ws) return ws.mods.filter((m) => m.uniqueName).length;
    return 0;
  }, [ui.activeSlot, build.wf.mods, build.comp.mods, build.comp.weaponMods, build.weaponStates]);

  const primerStats = build.primerSlot && build.result?.weapons
    ? build.result.weapons[build.primerSlot]
    : undefined;

  return {
    wfCapacity,
    wpCapacity,
    compCapacity,
    curWeapon,
    curCategory,
    equippedCount,
    primerStats,
  };
}
