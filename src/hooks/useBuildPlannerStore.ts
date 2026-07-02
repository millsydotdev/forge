import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Polarity } from '../engine/build-core';
import { calculateOperatorStats } from '../features/build-planner/calculators/operator-calc';
import { weaponCapacity } from '../engine/polarity';
import type { CapacityBreakdown } from '../engine/polarity';
import { parseArcaneMods } from '../features/build-planner/util/operatorParse';
import { enrichMod } from '../features/build-planner/components/enrich-mod';
import { DEFAULT_POLARITY, calcModCost } from '../features/build-planner/model';
import type { ItemOption, ModSlot, WarframeDetail } from '../features/build-planner/model';
import { useBuildStore } from '../store/buildStore';
import { useLibraryStore } from '../store/libraryStore';
import { useUiStore } from '../store/uiStore';
import { useOverwolf } from '../features/build-planner/hooks/use-overwolf';
import { useBuildSubmit } from '../features/build-planner/hooks/use-build-submit';
import { useLibraryData } from './useLibraryData';
import { useBuildDerived } from './useBuildDerived';
import { useBuildActions } from './useBuildActions';

export function useBuildPlannerStore(): BuildPlannerStoreState;
export function useBuildPlannerStore<T>(selector: (state: BuildPlannerStoreState) => T): T;
export function useBuildPlannerStore<T>(selector?: (state: BuildPlannerStoreState) => T) {
  const state = useBuildPlannerStoreImpl();
  return selector ? selector(state) : state;
}

function useBuildPlannerStoreImpl() {
  useLibraryData();

  const build = useBuildStore(useShallow(s => ({...s})));
  const library = useLibraryStore(useShallow(s => ({...s})));
  const ui = useUiStore(useShallow(s => ({...s})));

  const derived = useBuildDerived();
  const actions = useBuildActions();

  // Refs for Overwolf hook
  const allModsRef = useRef(library.allMods);
  const warframesRef = useRef(library.warframes);
  const allWeaponsRef = useRef<ItemOption[]>([]);
  const companionsRef = useRef(library.companions);
  const allArcanesRef = useRef(library.allArcanes);

  useEffect(() => { allModsRef.current = library.allMods; }, [library.allMods]);
  useEffect(() => { warframesRef.current = library.warframes; }, [library.warframes]);
  useEffect(() => {
    allWeaponsRef.current = Object.values(library.weapons).flat();
  }, [library.weapons]);
  useEffect(() => { companionsRef.current = library.companions; }, [library.companions]);
  useEffect(() => { allArcanesRef.current = library.allArcanes; }, [library.allArcanes]);

  useOverwolf(
    allModsRef, warframesRef, allWeaponsRef, companionsRef, allArcanesRef,
    library.setOwnedModIds, library.setOwnedWarframeIds, library.setOwnedWeaponIds,
    library.setOwnedCompanionIds, library.setOwnedArcaneIds,
    build.setWf, build.setWeaponStates, build.setComp, build.setHelminth, library.setPlayerName,
  );

  // ── Frame detail ──
  useEffect(() => {
    if (!build.wf.id) { build.setFrameDetail(null); return; }
    let active = true;
    window.forge.getItemDetail(build.wf.id).then((d) => {
      if (active) build.setFrameDetail(d as unknown as WarframeDetail);
    }).catch(() => {});
    return () => { active = false; };
  }, [build.wf.id, build]);

  // ── Build submission → IPC ──
  useBuildSubmit(
    build.wf, build.weaponStates, build.comp, build.helminth,
    build.targetFaction, build.isAiming, build.activeStatuses,
    build.buffs, build.conditionalTriggers, build.enemyEnabled, build.enemyState,
    build.operatorId, build.focusNodes, build.arcane,
    build.setResult, build.setCalculating,
    msg => ui.setToast({ message: `Calculation failed: ${msg}`, type: 'error' }),
  );

  // ── Operator stats ──
  useEffect(() => {
    const opId = build.operatorId;
    if (!opId) { build.setOperatorStats(null); return; }
    let active = true;
    (async () => {
      const opDetail = await window.forge.getItemDetail(opId);
      if (!opDetail || !active) { if (active) build.setOperatorStats(null); return; }
      const opRecord = opDetail as unknown as Record<string, number | undefined>;
      const operator = { health: opRecord.health, shield: opRecord.shield, armor: opRecord.armor, power: opRecord.power, sprintSpeed: opRecord.sprintSpeed };
      const arcaneMods = await parseArcaneMods(build.arcane);
      const stats = calculateOperatorStats(operator, build.focusNodes, arcaneMods);
      if (active) build.setOperatorStats(stats);
    })();
    return () => { active = false; };
  }, [build.operatorId, build.focusNodes, build.arcane, build]);

  // ── Status primer auto-update ──
  useEffect(() => {
    if (derived.primerStats?.damagePerType) {
      const count = Object.keys(derived.primerStats.damagePerType).length;
      if (count !== build.activeStatuses) build.setActiveStatuses(count);
    }
  }, [derived.primerStats, build]);

  // ── Complex actions ──
  const enrichAndPlace = useCallback(async (m: ItemOption) => {
    const e = await enrichMod(m);
    if (!e) return;
    if (ui.activeSlot === 'warframe') {
      if (m.type === 'Aura' && !build.wf.aura) { build.setWf(p => ({ ...p, aura: e })); return; }
      build.setWf(p => p.mods.length < 8 ? { ...p, mods: [...p.mods, e] } : p);
    } else if (ui.activeSlot === 'companion') {
      build.setComp(p => p.mods.length < 8 ? { ...p, mods: [...p.mods, e] } : p);
    } else if (ui.activeSlot === 'companion_weapon') {
      build.setComp(p => p.weaponMods.length < 8 ? { ...p, weaponMods: [...p.weaponMods, e] } : p);
    } else if (ui.activeSlot === 'exalted_weapon') {
      build.setWeaponStates(p => {
        const existing = p['exalted_weapon'] ?? { id: 'exalted_weapon', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill(DEFAULT_POLARITY) as Polarity[] };
        if (existing.mods.length >= 8) return p;
        return { ...p, exalted_weapon: { ...existing, mods: [...existing.mods, e] } };
      });
    } else {
      build.setWeaponStates(p => {
        const ws = p[ui.activeSlot];
        if (!ws || !ws.id || ws.mods.length >= 8) return p;
        return { ...p, [ui.activeSlot]: { ...ws, mods: [...ws.mods, e] } };
      });
    }
  }, [ui.activeSlot, build]);

  const enrichAndPlaceAt = useCallback(async (i: number, m: ItemOption) => {
    const e = await enrichMod(m);
    if (!e) return;
    const insert = <T extends ModSlot>(mods: T[]): T[] => {
      const copy = [...mods];
      while (copy.length < i) copy.push({} as T);
      copy[i] = e as unknown as T;
      return copy.filter(x => (x as ModSlot).uniqueName);
    };
    if (ui.activeSlot === 'warframe') {
      build.setWf(p => p.mods.length >= 8 ? p : { ...p, mods: insert(p.mods) });
    } else if (ui.activeSlot === 'companion') {
      build.setComp(p => p.mods.length >= 8 ? p : { ...p, mods: insert(p.mods) });
    } else if (ui.activeSlot === 'companion_weapon') {
      build.setComp(p => p.weaponMods.length >= 8 ? p : { ...p, weaponMods: insert(p.weaponMods) });
    } else if (ui.activeSlot === 'exalted_weapon') {
      build.setWeaponStates(p => {
        const existing = p['exalted_weapon'] ?? { id: 'exalted_weapon', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill(DEFAULT_POLARITY) as Polarity[] };
        if (existing.mods.length >= 8) return p;
        return { ...p, exalted_weapon: { ...existing, mods: insert(existing.mods) } };
      });
    } else {
      build.setWeaponStates(p => {
        const ws = p[ui.activeSlot];
        if (!ws || !ws.id || ws.mods.length >= 8) return p;
        return { ...p, [ui.activeSlot]: { ...ws, mods: insert(ws.mods) } };
      });
    }
  }, [ui.activeSlot, build]);

  const placeModAtSlot = useCallback((slot: string, index: number, item: ItemOption) => {
    enrichMod(item).then(e => {
      if (!e) return;
      const setMods = <T extends ModSlot>(mods: T[]): T[] => {
        const copy = [...mods];
        copy[index] = e as unknown as T;
        return copy.filter(Boolean);
      };
      if (slot === 'warframe') {
        build.setWf(p => p.mods.length >= 8 ? p : { ...p, mods: setMods(p.mods) });
      } else if (slot === 'companion') {
        build.setComp(p => p.mods.length >= 8 ? p : { ...p, mods: setMods(p.mods) });
      } else {
        build.setWeaponStates(p => {
          const ws = p[slot];
          if (!ws || !ws.id || ws.mods.length >= 8) return p;
          return { ...p, [slot]: { ...ws, mods: setMods(ws.mods) } };
        });
      }
    });
  }, [build]);

  const weaponCapFor = useCallback((slot: string): CapacityBreakdown | null => {
    const ws = build.weaponStates[slot];
    if (!ws?.id) return null;
    const modCosts = ws.mods.map((m, i) => calcModCost(m, ws.slotPolarities[i + 1]));
    const exilusCost = ws.exilus ? calcModCost(ws.exilus, ws.slotPolarities[0]) : 0;
    return weaponCapacity({ stanceDrain: 0, stanceMatched: true, modCosts: [exilusCost, ...modCosts], mr: build.mr });
  }, [build.weaponStates, build.mr]);

  const { buildExportCode, handleImport, saveLoadout, loadLoadout, deleteLoadout } = actions;

  return {
    warframes: library.warframes,
    weapons: library.weapons,
    allMods: library.allMods,
    allArcanes: library.allArcanes,
    ownedModIds: library.ownedModIds,
    playerName: library.playerName,
    companions: library.companions,
    companionWeapons: library.companionWeapons,
    allFrames: library.allFrames,

    wf: build.wf, setWf: build.setWf,
    weaponStates: build.weaponStates, setWeaponStates: build.setWeaponStates,
    comp: build.comp, setComp: build.setComp,
    helminth: build.helminth, setHelminth: build.setHelminth,
    mr: build.mr, setMr: build.setMr,
    frameDetail: build.frameDetail,
    targetFaction: build.targetFaction, setTargetFaction: build.setTargetFaction,
    isAiming: build.isAiming, setIsAiming: build.setIsAiming,
    activeStatuses: build.activeStatuses, setActiveStatuses: build.setActiveStatuses,
    enemyState: build.enemyState, setEnemyState: build.setEnemyState,
    enemyEnabled: build.enemyEnabled, setEnemyEnabled: build.setEnemyEnabled,
    buffs: build.buffs, setBuffs: build.setBuffs,
    conditionalTriggers: build.conditionalTriggers, setConditionalTriggers: build.setConditionalTriggers,
    result: build.result,
    calculating: build.calculating,
    buildNotes: build.buildNotes, setBuildNotes: build.setBuildNotes,
    buildName: build.buildName, setBuildName: build.setBuildName,
    primerSlot: build.primerSlot, setPrimerSlot: build.setPrimerSlot,
    operatorId: build.operatorId, setOperatorId: build.setOperatorId,
    focusNodes: build.focusNodes, setFocusNodes: build.setFocusNodes,
    arcane: build.arcane, setArcane: build.setArcane,
    operatorStats: build.operatorStats,

    activeSlot: ui.activeSlot, setActiveSlot: ui.setActiveSlot,
    showImport: ui.showImport, setShowImport: ui.setShowImport,
    importText: ui.importText, setImportText: ui.setImportText,
    toast: ui.toast, setToast: ui.setToast,
    loadouts: build.loadouts,

    wfCapacity: derived.wfCapacity,
    wpCapacity: derived.wpCapacity,
    compCapacity: derived.compCapacity,
    curWeapon: derived.curWeapon,
    curCategory: derived.curCategory,
    equippedCount: derived.equippedCount,
    primerStats: derived.primerStats,

    enrichAndPlace,
    enrichAndPlaceAt,
    placeModAtSlot,
    weaponCapFor,
    buildExportCode,
    handleImport,
    saveLoadout,
    loadLoadout,
    deleteLoadout,
  };
}

export type BuildPlannerStoreState = ReturnType<typeof useBuildPlannerStoreImpl>;
